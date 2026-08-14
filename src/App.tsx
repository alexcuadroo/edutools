import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PlayableLayout from "@/components/layout/PlayableLayout";
import HomePage from "@/pages/HomePage";
import WordSearchPage from "@/pages/WordSearchPage";
import CrosswordPage from "@/pages/CrosswordPage";
import FillBlanksPage from "@/pages/FillBlanksPage";
import HangmanPage from "@/pages/HangmanPage";
import AnagramPage from "@/pages/AnagramPage";
import SentenceOrderPage from "@/pages/SentenceOrderPage";
import MatchColumnsPage from "@/pages/MatchColumnsPage";
import MemoryPage from "@/pages/MemoryPage";
import RoscoPage from "@/pages/RoscoPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import VerifyPage from "@/pages/VerifyPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import MyPuzzlesPage from "@/pages/MyPuzzlesPage";
import PuzzleProgressPage from "@/pages/PuzzleProgressPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlayHubPage from "@/pages/play/PlayHubPage";
import PlayWordSearchPage from "@/pages/play/PlayWordSearchPage";
import PlayCrosswordPage from "@/pages/play/PlayCrosswordPage";
import PlayFillBlanksPage from "@/pages/play/PlayFillBlanksPage";
import PlayHangmanPage from "@/pages/play/PlayHangmanPage";
import PlayAnagramPage from "@/pages/play/PlayAnagramPage";
import PlaySentenceOrderPage from "@/pages/play/PlaySentenceOrderPage";
import PlayMatchColumnsPage from "@/pages/play/PlayMatchColumnsPage";
import PlayMemoryPage from "@/pages/play/PlayMemoryPage";
import PlayRoscoPage from "@/pages/play/PlayRoscoPage";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import { useAuthStore } from "@/store/auth-store";
import { wordSearchGenerator } from "@/lib/puzzles/word-search/generator";
import { crosswordGenerator } from "@/lib/puzzles/crossword/generator";
import { fillBlanksGenerator } from "@/lib/puzzles/fill-blanks/generator";
import { hangmanGenerator } from "@/lib/puzzles/hangman/generator";
import { anagramGenerator } from "@/lib/puzzles/anagram/generator";
import { sentenceOrderGenerator } from "@/lib/puzzles/sentence-order/generator";
import { matchColumnsGenerator } from "@/lib/puzzles/match-columns/generator";
import { memoryGenerator } from "@/lib/puzzles/memory/generator";
import { roscoGenerator } from "@/lib/puzzles/rosco/generator";
import { registerPuzzle } from "@/lib/puzzles/registry";

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
  registerPuzzle(roscoGenerator);
}

initPuzzles();

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
            <Route path="/rosco" element={<RoscoPage />} />
            <Route path="/iniciar-sesion" element={<LoginPage />} />
            <Route path="/crear-cuenta" element={<SignupPage />} />
            <Route path="/verificar" element={<VerifyPage />} />
            <Route path="/recuperar-cuenta" element={<ForgotPasswordPage />} />
            <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
            <Route path="/mis-puzzles" element={<MyPuzzlesPage />} />
            <Route path="/mis-puzzles/:id/progreso" element={<PuzzleProgressPage />} />
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
            <Route path="/jugar/rosco/:id" element={<PlayRoscoPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
