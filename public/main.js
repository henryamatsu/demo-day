class MommaKnowsPizza {
  constructor() {
    this._id = document.body.dataset._id;
    this.toppings = [];

    this.setupQuerySelectors();
    this.setupEventListeners();

    this.updatePastOrders();
  }

  setupQuerySelectors() {
    this.pizzaDisplay = document.querySelector(".pizza-display");
    this.pastPizzaDisplays = document.querySelectorAll(".past-orders > .pizza-display");
    this.orderMessageElement = document.querySelector(".order-message");
  
    this.topping1CheckBox = document.querySelector("#topping-1");
    this.topping2CheckBox = document.querySelector("#topping-2");
    this.topping3CheckBox = document.querySelector("#topping-3");
    this.topping4CheckBox = document.querySelector("#topping-4");  
  }

  setupEventListeners() {
    document.addEventListener("click", event => {  
      if (event.target.localName === "input") {
        this.updateMainPizza();
      }
      else if (event.target.id === "order-button") {  
        this.orderPizza();
      }
      else if (event.target.classList.contains("past-order")) {
        this.selectPastOrder(event.target.dataset.index);
      }
    });
  }

  updateMainPizza() {
    this.toppings = [];
      
    if (this.topping1CheckBox.checked) this.toppings.push(1);
    if (this.topping2CheckBox.checked) this.toppings.push(2);
    if (this.topping3CheckBox.checked) this.toppings.push(3);
    if (this.topping4CheckBox.checked) this.toppings.push(4);
    
    this.updatePizzaDisplay(this.toppings, this.pizzaDisplay);
  }

  updatePizzaDisplay(toppings, pizzaElement) {
    let toppingStyle = "";
  
    if (toppings.length > 0) {
      toppingStyle += "background-image:";
      const svgs = [];
  
      if (toppings.includes(1)) {
        svgs.push("url(img/pepperoni.svg)");
      }
      if (toppings.includes(2)) {
        svgs.push("url(img/mushrooms.svg)");
      }
      if (toppings.includes(3)) {
        svgs.push("url(img/pineapple.svg)");
      }
      if (toppings.includes(4)) {
        svgs.push("url(img/anchovies.svg)");
      }
  
      toppingStyle += svgs.join(",") + ";";
    }
  
    pizzaElement.style = toppingStyle;
  }

  async updatePastOrders(pastOrders = []) {
    if (pastOrders.length === 0) {
      const res = await fetch("/getPastOrders", {
        method: "put",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({_id: this._id})
      })
      const data = await res.json(); 
      this.pastOrders = data.pastOrders;  
    }
    else {
      this.pastOrders = pastOrders;
    }
  
    this.pastOrders.forEach((toppings, i) => {
      this.updatePizzaDisplay(toppings, this.pastPizzaDisplays[i]);
    });
  }

  selectPastOrder(index) {
    const toppings = this.pastOrders[index] || [];

    this.topping1CheckBox.checked = toppings.includes(1);
    this.topping2CheckBox.checked = toppings.includes(2);
    this.topping3CheckBox.checked = toppings.includes(3);
    this.topping4CheckBox.checked = toppings.includes(4);

    this.updateMainPizza();
  }

  orderPizza() {
    fetch("/orderPizza", {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        _id: this._id,
        toppings: this.toppings
      })
    })
    .then(res => res.json())
    .then(data => {      
      this.updatePastOrders(data.pastOrders);
      this.orderMessageElement.style = "opacity: 1; pointer-events: all;";
      setTimeout(() => {
        this.orderMessageElement.style = "";
      }, 1000);
    });
  }
}

new MommaKnowsPizza();