import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import WordSearchPage from "./pages/WordSearchPage";
import CrosswordPage from "./pages/CrosswordPage";
import FillBlanksPage from "./pages/FillBlanksPage";
import HangmanPage from "./pages/HangmanPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { wordSearchGenerator } from "./lib/puzzles/word-search/generator";
import { crosswordGenerator } from "./lib/puzzles/crossword/generator";
import { fillBlanksGenerator } from "./lib/puzzles/fill-blanks/generator";
import { hangmanGenerator } from "./lib/puzzles/hangman/generator";
import { registerPuzzle } from "./lib/puzzles/registry";

let didInit = false;

function initPuzzles() {
  if (didInit) return;
  didInit = true;
  registerPuzzle(wordSearchGenerator);
  registerPuzzle(crosswordGenerator);
  registerPuzzle(fillBlanksGenerator);
  registerPuzzle(hangmanGenerator);
}

initPuzzles();

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sopa-de-letras" element={<WordSearchPage />} />
            <Route path="/crucigrama" element={<CrosswordPage />} />
            <Route path="/rellenar-huecos" element={<FillBlanksPage />} />
            <Route path="/adivina-la-palabra" element={<HangmanPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
