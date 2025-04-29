# Demo-Day (Real title pending)

A user-authentication enabled app that can receive English text and translate specific words into Japanese. The goal of the app is to build it as a browser extension so it can translate text on any webpage. The idea isn't to perform comprehensive webpage translation, but to give a language learner passive exposure to a language they're trying to learn by peppering translated words into their everyday internet use. In the current version, it isn't installable as a browser extension, but instead has a page with a textarea where a user can insert text to be translated, as a demonstration of how the translation feature should work on a webpage.

![demo-day](https://github.com/user-attachments/assets/626c1973-c48c-451c-a680-140e069afb56)

*Screenshot of the translation page*

## How It’s Made

**Tech Stack:**  
- **Backend:** Node.js, Express.js, Passport.js (user authentication)
- **Database:** MongoDB, Mongoose
- **Frontend:** EJS, HTML, CSS, JS  

## How It Works
- The **Sample Text** button will populate the textarea with a pregenerated story (a Japanese folktale called Momotaro) with many translation-eligible words
-  When the **Translate!** button is clicked, the app reads the text inside the textarea, and looks for any words that are present in the translationMap object
- All eligible words are replaced with their Japanese translation, and hovering over any translated word will display additional info about the word
- The user can navigate to the **Preferences** page to customize what grade levels of kanji are used in the translation, and the user can also adjust the frequency at which words are replaced

## Next Steps
- A major hurdle is to generate translations with greater contextual awareness. There are a lot of instances where an English word might translate into Japanese differently depending on the context (there are differnt words for "old" when it's being used to refer to an inanimate object or a person), and I'm hoping to leverage the DeepL api or something like it to achieve this, based on Flex's recommendation.
- I need to use a library to sanitize user input, because right now the textarea input is being taken and inserted into the text display with innerHTML (to enable unique styling for translated words, as well as to enable the hover functionality), which I understand can be a security risk.
- I need to make the translation features available as a browser extension.

## Installation

1. Clone repo
2. run `npm install`

## Usage

1. run `node server.js`
2. Navigate to `localhost:8080`
3. Create an account

## Inspiration & Credit

README.md layout modified from **CodingWCal**'s template
