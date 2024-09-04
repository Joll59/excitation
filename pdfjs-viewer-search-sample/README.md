# [excitation](../../) pdf.js viewer search sample

This sample embeds the default pdf.js web viewer application (as used in the Firefox browser) in an iframe, allowing users to work with excerpts within a powerful PDF reader that enables sophisticated searching.

## Embedding pdf.js

To use this sample you need to clone [pdf.js](https://github.com/mozilla/pdf.js) and build it, following the instructions in the project README.

```sh
# Clone the repo and cd in
git clone git@github.com:mozilla/pdf.js.git
cd pdf.js

# Install canvas to prevent it from building the older version from source
npm install canvas@next

# Install all dependencies of pdf.js
npm install

# Bundle pdf.js
npx gulp generic
```

Once you have built the project using `gulp generic` (I used `npx gulp generic`), copy the contents of the `build\generic` folder of that repo into the `public\pdfjs` folder.

## Building and running this sample

```zsh
cd pdfjs-viewer-search-sample
npm install
npm run dev
```

Then aim your browser at the indicated VITE dev endpoint, which for me is [http://localhost:5173/](http://localhost:5173/)

## Architecture Explanation

### User Interface

- App Component: The main component that renders the application. It includes the QuestionAnswer component.
  - QuestionAnswer Component: Handles the display of questions and answers, and manages interactions like showing references.

### Business Logic

Interfaces: Defines the data structures used in the application, such as QA, BoundingRegion, and Reference.

### Data Access

di.json: A JSON file that containing data used by the application.

### External Services

PDF.js Viewer: An iframe that loads and displays PDF documents. It interacts with the application to show specific pages and highlight regions.

### Key Interactions

- The App component initializes the application and manages state.
- The QuestionAnswer component handles user interactions and displays questions, answers, and references.
  - When a reference is clicked, the QuestionAnswer component interacts with the PDF.js Viewer to display the relevant document and highlight specific regions.
