import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { pdfjs } from 'react-pdf';
import { useAsyncStateMachine } from './State';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

import './App.css'
import { Login } from './Login';
import Protected from './Protected';
import { Routes, Route } from "react-router-dom";


function App() {
  useAsyncStateMachine();
  return (
    <Routes>
      <Route path="/:id" index element={<Login> {<Protected />} </Login>} />
    </Routes>
  );
}

export default App