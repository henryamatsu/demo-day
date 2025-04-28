class Translator {
  constructor() {
    this._id = document.body.dataset._id;
    this.translationMap = {};
    this.textType = "input";
    this.currentWordElement = null;

    this.setupQuerySelectors();
    this.setupEventListeners();

    (async() => {
      await this.getUserData();
      this.createTranslationMap();  
    })();
  }

  setupQuerySelectors() {
    this.sampleTextButton = document.querySelector("#sample-text-button");
    this.translateButton = document.querySelector("#translate-button");
    this.textDisplay = document.querySelector("#text-display");
    this.textInput = document.querySelector("#text-input");
    this.infoPopup = document.querySelector("#info-popup");
  }

  setupEventListeners() {
    this.sampleTextButton.addEventListener("click", this.handleSampleTextButton.bind(this));
    this.translateButton.addEventListener("click", this.handleTranslateButton.bind(this));

    document.addEventListener("mouseover", this.displayHoverInfo.bind(this));
    this.infoPopup.addEventListener("mouseout", this.hideHoverInfo.bind(this));
    this.infoPopup.addEventListener("click", this.changeReading.bind(this));
    
  }

  async getUserData() { 
    const res = await fetch("/getUserData", {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({_id: this._id})
    });
    const data = await res.json();
    this.user = data;
  }

  async createTranslationMap() {
    const grades = this.user.local.preferences.grades;
    let allData = [];

    if (grades.grade1) {
      const res = await fetch("/json/grade1.json");
      const data = await res.json();  
      allData = [...allData, ...data];
    }
    if (grades.grade2) {
      const res = await fetch("/json/grade2.json");
      const data = await res.json();  
      allData = [...allData, ...data];
    }
    if (grades.grade3) {
      const res = await fetch("/json/grade3.json");
      const data = await res.json();  
      allData = [...allData, ...data];
    }
    
    allData.forEach(entry => {
      this.translationMap[entry.heisig_en] = entry;
    });
  }

  async handleSampleTextButton() {
    const res = await fetch("/json/sample-text.json");
    const data = await res.json();
    this.textInput.innerText = data.text;
  }

  handleTranslateButton() {
    if (this.textType === "input") {
      this.convertInputText();
    }
    else if (this.textType === "display") {
      this.returnToInput();
    }
  }

  convertInputText() {
    this.textType = "display";
    
    this.translateButton.innerText = "New Translation";
    this.textDisplay.style = "display: block;"
    this.textInput.style = "display: none;"
    this.sampleTextButton.style = "display: none;"

    this.textDisplay.innerText = this.textInput.value;

    this.translateEligibleWords();
  }

  async translateEligibleWords() {
    const text = this.textDisplay.innerText;
    const textArr = text.split(" ");

    const translatedArr = textArr.map(word => {
      const replacementChance = Math.round(Math.random() * 100) < +this.user.local.preferences.frequency;

      return this.translationMap[word] && replacementChance ? `<span class="translated-word" data-key="${word}">${this.translationMap[word].kanji}</span>` : word;
    });
    // might need regex to deal with words with punctuation attached/ words with spaces in between

    this.textDisplay.innerHTML = translatedArr.join(" ");
  }

  returnToInput() {
    this.textType = "input";

    this.translateButton.innerText = "Translate!";
    this.textDisplay.style = "display: none;"
    this.textInput.style = "display: block;"
    this.sampleTextButton.style = "display: inline-block;"
  }

  displayHoverInfo(event) {
    if (!event.target.classList.contains("translated-word")) return;
  
    this.currentWordElement = event.target;
    this.populateHoverInfo(event);

    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const popupWidth = this.infoPopup.offsetWidth;
    const popupHeight = this.infoPopup.offsetHeight;
 
    const clientHeight = document.documentElement.clientHeight;
    const midPoint = clientHeight / 2;
    const yAdjust = pointerY < midPoint ? -20 : -popupHeight + 20;

    if (pointerY < midPoint) {
      this.infoPopup.style.paddingTop = "40px";
      this.infoPopup.style.paddingBottom = "0";
    }
    else {
      this.infoPopup.style.paddingTop = "0";
      this.infoPopup.style.paddingBottom = "40px";
    }

    const popupX = pointerX - popupWidth / 2;
    const popupY = pointerY + yAdjust;

    this.infoPopup.style.visibility = "visible";
    this.infoPopup.style.left = popupX + "px";
    this.infoPopup.style.top = popupY + "px";
  }

  populateHoverInfo(event) {
    const key = event.target.dataset.key;
    const entry = this.translationMap[key];
    
    this.infoPopup.querySelector("#english-reading").innerText = entry.heisig_en;
    this.infoPopup.querySelector("#hiragana-reading").innerText = entry.kun_readings.join(", ");
  }

  hideHoverInfo(event) {
    // if (event.relatedTarget.classList.contains("popup-content")) return;
    this.currentWordElement = null;
    this.infoPopup.style.visibility = "hidden";
  }

  changeReading() {
    // on clicking a translated word, this feature will change the reading to hiragana/romaji
  }
}

new Translator();