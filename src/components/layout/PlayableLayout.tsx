import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Maximize2, Minimize2 } from "lucide-react";

export default function PlayableLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canFullscreen] = useState(() => typeof document !== "undefined" && Boolean(document.fullscreenEnabled));

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === containerRef.current));
  }, []);

  useEffect(() => {
    const onDocFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === containerRef.current));
    };
    document.addEventListener("fullscreenchange", onDocFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onDocFullscreenChange);
    };
  }, []);

  const handleFullscreenError = useCallback((e: React.SyntheticEvent) => {
    console.warn("Error al cambiar modo de pantalla completa:", e);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("No se pudo alternar pantalla completa:", err);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onFullscreenChange={handleFullscreenChange}
      onFullscreenError={handleFullscreenError}
      className={`min-h-screen flex flex-col bg-background text-foreground ${
        isFullscreen ? "bg-white overflow-y-auto p-2 sm:p-4" : ""
      }`}
    >
      {canFullscreen && (
        <div className="w-full max-w-5xl mx-auto px-4 pt-3 flex justify-end">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
                <span>Salir de pantalla completa</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
                <span>Pantalla completa</span>
              </>
            )}
          </button>
        </div>
      )}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

