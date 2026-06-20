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
import MatchColumnsPage from "./pages/MatchColumnsPage";
import MemoryPage from "./pages/MemoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlayHubPage from "./pages/play/PlayHubPage";
import PlayWordSearchPage from "./pages/play/PlayWordSearchPage";
import PlayCrosswordPage from "./pages/play/PlayCrosswordPage";
import PlayFillBlanksPage from "./pages/play/PlayFillBlanksPage";
import PlayHangmanPage from "./pages/play/PlayHangmanPage";
import PlayAnagramPage from "./pages/play/PlayAnagramPage";
import PlaySentenceOrderPage from "./pages/play/PlaySentenceOrderPage";
import PlayMatchColumnsPage from "./pages/play/PlayMatchColumnsPage";
import PlayMemoryPage from "./pages/play/PlayMemoryPage";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { wordSearchGenerator } from "./lib/puzzles/word-search/generator";
import { crosswordGenerator } from "./lib/puzzles/crossword/generator";
import { fillBlanksGenerator } from "./lib/puzzles/fill-blanks/generator";
import { hangmanGenerator } from "./lib/puzzles/hangman/generator";
import { anagramGenerator } from "./lib/puzzles/anagram/generator";
import { sentenceOrderGenerator } from "./lib/puzzles/sentence-order/generator";
import { matchColumnsGenerator } from "./lib/puzzles/match-columns/generator";
import { memoryGenerator } from "./lib/puzzles/memory/generator";
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
  registerPuzzle(matchColumnsGenerator);
  registerPuzzle(memoryGenerator);
}

initPuzzles();

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sopa-de-letras" element={<WordSearchPage />} />
            <Route path="/crucigrama" element={<CrosswordPage />} />
            <Route path="/rellenar-huecos" element={<FillBlanksPage />} />
            <Route path="/adivina-la-palabra" element={<HangmanPage />} />
            <Route path="/anagrama" element={<AnagramPage />} />
            <Route path="/ordenar-oracion" element={<SentenceOrderPage />} />
            <Route path="/relacionar-columnas" element={<MatchColumnsPage />} />
            <Route path="/memoria" element={<MemoryPage />} />
          </Route>
          <Route element={<PlayableLayout />}>
            <Route path="/jugar" element={<PlayHubPage />} />
            <Route path="/jugar/sopa-de-letras/:id" element={<PlayWordSearchPage />} />
            <Route path="/jugar/crucigrama/:id" element={<PlayCrosswordPage />} />
            <Route path="/jugar/rellenar-huecos/:id" element={<PlayFillBlanksPage />} />
            <Route path="/jugar/adivina-la-palabra/:id" element={<PlayHangmanPage />} />
            <Route path="/jugar/anagrama/:id" element={<PlayAnagramPage />} />
            <Route path="/jugar/ordenar-oracion/:id" element={<PlaySentenceOrderPage />} />
            <Route path="/jugar/relacionar-columnas/:id" element={<PlayMatchColumnsPage />} />
            <Route path="/jugar/memoria/:id" element={<PlayMemoryPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
