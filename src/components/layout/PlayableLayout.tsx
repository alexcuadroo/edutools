import { Outlet } from "react-router-dom";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function PlayableLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl justify-end px-4 pt-3">
        <ThemeToggle />
      </div>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
