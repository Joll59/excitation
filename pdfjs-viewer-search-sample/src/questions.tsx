import { DocumentIntelligenceResponse, BoundingRegion } from "./interfaces";
import di from "../../di.json"
import { fuzzyMatch, drawPolygon, condenseRegions } from './utility'
const response = di as DocumentIntelligenceResponse;

// given a set of lines, find the association boundingRegions
const findLinesBoundingRegions = (lines: string[], response: DocumentIntelligenceResponse) => {
    let nextLine = 0;

    const pages = response.analyzeResult.pages;
    const boundingRegions: BoundingRegion[] = [];

    for (let i = 0; i < pages.length; i++) {
        const pageLines = pages[i].lines;
        for (let j = 0; j < pageLines.length; j++) {
            if (fuzzyMatch(pageLines[j].content, lines[nextLine])) {
                boundingRegions.push({
                    pageNumber: i + 1,
                    polygon: pageLines[j].polygon,
                });
                nextLine++;
                if (nextLine == lines.length) return boundingRegions;
            }
        }
    }
    console.log("Failed to find all lines in document")
    return boundingRegions;
}

const findCanvasAndDraw = (
    iframeRef,
    pageNumber: number,
    polygon: number[],
    shown: boolean[][],
    questionIndex: number,
    referenceIndex: number,
    setShown: React.Dispatch<React.SetStateAction<boolean[][]>>
): void => {
    // we'll find the right page to grab the attached canvas
    const pages = iframeRef.current.contentDocument?.getElementsByClassName("page") as HTMLCollectionOf<Element>;

    console.log("searching for page canvas...");
    let canvas;
    for (let index = 0; index < pages.length; index++) {
        const page = pages[index] as HTMLElement;
        const canvasPageNumber = Number(page.dataset.pageNumber);
        if (canvasPageNumber == pageNumber) canvas = page.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    }

    if (canvas) {
        // this doesn't happen immediately...
        console.log("canvas found!");
        const highlightContext = canvas?.getContext('2d');
        const scale = parseFloat(window.getComputedStyle(canvas).getPropertyValue('--scale-factor') || '1');
        if (highlightContext) drawPolygon(highlightContext, scale, polygon);
        shown[questionIndex][referenceIndex] = true;
        setShown(shown);
    } else {
        setTimeout(findCanvasAndDraw, 100, iframeRef, pageNumber, polygon, shown, questionIndex, referenceIndex, setShown);
    }
}

const showReference = (props, fileName: string, pageNumber: number, polygon: number[]) => {
    const { iframeRef, shown, questionIndex, referenceIndex, setShown } = props;
    const pdfViewer = iframeRef.current.contentWindow?.PDFViewerApplication;

    // when you click on a specific citation
    // this runs to find the relevant document, page, and bounding box data
    pdfViewer.url = fileName;
    pdfViewer.page = pageNumber;

    // if we've already drawn the reference box once, we don't need to redraw
    if (!shown[questionIndex][referenceIndex]) findCanvasAndDraw(iframeRef, pageNumber, polygon, shown, questionIndex, referenceIndex, setShown);
}

const Reference = (props) => {
    const { reference } = props;

    // fetch DI response from a db
    // actually for now, we just import the di.json file
    // later we'll need to do some logic about pulling the relevant file
    const paragraphs = response.analyzeResult.paragraphs;

    // loop through paragraphs object
    // get relevant paragraph with matching text to set the page number
    let foundBoundingRegion = {} as BoundingRegion;
    paragraphs.forEach((paragraph) => {
        if (paragraph.content == reference.text) {
            foundBoundingRegion = paragraph.boundingRegions[0] as BoundingRegion;
        }
    })
    const fileName = reference.fileName;
    const { pageNumber, polygon } = foundBoundingRegion;

    return (
        <button className="referenceContext" onClick={() => showReference(props, fileName, pageNumber, polygon)}>
            <p>{reference.text}</p>
        </button>
    )
}

const createReferenceFromSelection = (iframeRef, props) => {
    const { shown, questionIndex, setShown, setSelection } = props;
    // give visual feedback that the selection is being processed
    setSelection(iframeRef.current?.contentWindow?.getSelection()?.toString() || "");
    const selection = iframeRef.current?.contentWindow.getSelection().toString()
    if (!selection) {
        console.log("No text selected");
        return;
    }

    const lines = selection.split('\n');
    for (let i = 0; i < lines.length; i++) lines[i] = lines[i].trim();

    const foundBoundingRegions = findLinesBoundingRegions(lines, response);
    const boundingRegions = condenseRegions(foundBoundingRegions);
    if (boundingRegions.length === 0) {
        console.log("No match found for selected text");
        return;
    }

    console.log("boundingRegions:", boundingRegions);
    boundingRegions.forEach((region) => {
        console.log("region:", region);
        // repeat the action of show reference for each bounding region associated with the selected text
        // we need to create a reference Index in state to keep track of the references ... This Smells
        const referenceIndex = shown[questionIndex].length + 1;
        findCanvasAndDraw(iframeRef, region.pageNumber, region.polygon, shown, questionIndex, referenceIndex, setShown);
    });

    // do a thing with the found boundingRegionss
    // add/save to references in DB?
}

export function QuestionAnswer(props) {
    const { qA, iframeRef, selection, ...otherProps } = props;

    const questionReferenceElements = [];
    questionReferenceElements.push(
        <div key="questionDiv" id="questionDiv"><p id="question">Question: </p><p id="question-text">{qA.question}</p></div>
    );
    questionReferenceElements.push(
        <label key="answer" id="answer">Answer: <input placeholder={qA.answer} /></label>
    );
    questionReferenceElements.push(
        <h3 key="referenceTitle" id="referenceTitle">Reference contexts</h3>
    );

    for (let index = 0; index < qA.references.length; index++) {
        questionReferenceElements.push(
            <Reference key={Math.random()} reference={qA.references[index]} referenceIndex={index} iframeRef={iframeRef} {...otherProps} />
        )
    }

    questionReferenceElements.push(
        <h4 key="userAddedRefs" id="userAddedRefs">User contributions</h4>
    )
    questionReferenceElements.push(
        <button key="addReference" className="addReference" onClick={() => createReferenceFromSelection(iframeRef, props)}>add selected text to references</button>
    )
    questionReferenceElements.push(
        <div key="currentSelection">
            <h3>Selection</h3>
            {selection}
        </div>
    );
    return questionReferenceElements;
}
