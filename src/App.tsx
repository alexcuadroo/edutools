import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import PlayableLayout from "./components/layout/PlayableLayout";
import HomePage from "./pages/HomePage";
import WordSearchPage from "./pages/WordSearchPage";
import CrosswordPage from "./pages/CrosswordPage";
import FillBlanksPage from "./pages/FillBlanksPage";
import HangmanPage from "./pages/HangmanPage";
import AnagramPage from "./pages/AnagramPage";
import SentenceOrderPage from "./pages/SentenceOrderPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlayHubPage from "./pages/play/PlayHubPage";
import PlayWordSearchPage from "./pages/play/PlayWordSearchPage";
import PlayCrosswordPage from "./pages/play/PlayCrosswordPage";
import PlayFillBlanksPage from "./pages/play/PlayFillBlanksPage";
import PlayHangmanPage from "./pages/play/PlayHangmanPage";
import PlayAnagramPage from "./pages/play/PlayAnagramPage";
import PlaySentenceOrderPage from "./pages/play/PlaySentenceOrderPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { wordSearchGenerator } from "./lib/puzzles/word-search/generator";
import { crosswordGenerator } from "./lib/puzzles/crossword/generator";
import { fillBlanksGenerator } from "./lib/puzzles/fill-blanks/generator";
import { hangmanGenerator } from "./lib/puzzles/hangman/generator";
import { anagramGenerator } from "./lib/puzzles/anagram/generator";
import { sentenceOrderGenerator } from "./lib/puzzles/sentence-order/generator";
import { registerPuzzle } from "./lib/puzzles/registry";

let didInit = false;

function initPuzzles() {
  if (didInit) return;
  didInit = true;
  registerPuzzle(wordSearchGenerator);
  registerPuzzle(crosswordGenerator);
  registerPuzzle(fillBlanksGenerator);
  registerPuzzle(hangmanGenerator);
  registerPuzzle(anagramGenerator);
  registerPuzzle(sentenceOrderGenerator);
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
            <Route path="/anagrama" element={<AnagramPage />} />
            <Route path="/ordenar-oracion" element={<SentenceOrderPage />} />
          </Route>
          <Route element={<PlayableLayout />}>
            <Route path="/jugar" element={<PlayHubPage />} />
            <Route path="/jugar/sopa-de-letras" element={<PlayWordSearchPage />} />
            <Route path="/jugar/crucigrama" element={<PlayCrosswordPage />} />
            <Route path="/jugar/rellenar-huecos" element={<PlayFillBlanksPage />} />
            <Route path="/jugar/adivina-la-palabra" element={<PlayHangmanPage />} />
            <Route path="/jugar/anagrama" element={<PlayAnagramPage />} />
            <Route path="/jugar/ordenar-oracion" element={<PlaySentenceOrderPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
