import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PlayableLayout from "@/components/layout/PlayableLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
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
import { wordleGenerator } from "@/lib/puzzles/wordle/generator";
import { registerPuzzle } from "@/lib/puzzles/registry";

const HomePage = lazy(() => import("@/pages/HomePage"));
const WordSearchPage = lazy(() => import("@/pages/WordSearchPage"));
const CrosswordPage = lazy(() => import("@/pages/CrosswordPage"));
const FillBlanksPage = lazy(() => import("@/pages/FillBlanksPage"));
const HangmanPage = lazy(() => import("@/pages/HangmanPage"));
const AnagramPage = lazy(() => import("@/pages/AnagramPage"));
const SentenceOrderPage = lazy(() => import("@/pages/SentenceOrderPage"));
const MatchColumnsPage = lazy(() => import("@/pages/MatchColumnsPage"));
const MemoryPage = lazy(() => import("@/pages/MemoryPage"));
const RoscoPage = lazy(() => import("@/pages/RoscoPage"));
const WordlePage = lazy(() => import("@/pages/WordlePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const VerifyPage = lazy(() => import("@/pages/VerifyPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const MyPuzzlesPage = lazy(() => import("@/pages/MyPuzzlesPage"));
const PuzzleProgressPage = lazy(() => import("@/pages/PuzzleProgressPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const PlayHubPage = lazy(() => import("@/pages/play/PlayHubPage"));
const PlayWordSearchPage = lazy(() => import("@/pages/play/PlayWordSearchPage"));
const PlayCrosswordPage = lazy(() => import("@/pages/play/PlayCrosswordPage"));
const PlayFillBlanksPage = lazy(() => import("@/pages/play/PlayFillBlanksPage"));
const PlayHangmanPage = lazy(() => import("@/pages/play/PlayHangmanPage"));
const PlayAnagramPage = lazy(() => import("@/pages/play/PlayAnagramPage"));
const PlaySentenceOrderPage = lazy(() => import("@/pages/play/PlaySentenceOrderPage"));
const PlayMatchColumnsPage = lazy(() => import("@/pages/play/PlayMatchColumnsPage"));
const PlayMemoryPage = lazy(() => import("@/pages/play/PlayMemoryPage"));
const PlayRoscoPage = lazy(() => import("@/pages/play/PlayRoscoPage"));
const PlayWordlePage = lazy(() => import("@/pages/play/PlayWordlePage"));

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
  registerPuzzle(wordleGenerator);
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
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center" aria-live="polite">
              <Spinner />
            </div>
          }
        >
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
            <Route path="/cadenas-de-palabras" element={<WordlePage />} />
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
            <Route path="/jugar/cadenas-de-palabras/:id" element={<PlayWordlePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
