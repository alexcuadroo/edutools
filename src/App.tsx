import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import WordSearchPage from "./pages/WordSearchPage";
import CrosswordPage from "./pages/CrosswordPage";
import { wordSearchGenerator } from "./lib/puzzles/word-search/generator";
import { crosswordGenerator } from "./lib/puzzles/crossword/generator";
import { registerPuzzle } from "./lib/puzzles/registry";

registerPuzzle(wordSearchGenerator);
registerPuzzle(crosswordGenerator);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sopa-de-letras" element={<WordSearchPage />} />
          <Route path="/crucigrama" element={<CrosswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
