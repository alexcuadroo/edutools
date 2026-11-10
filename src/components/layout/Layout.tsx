import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Layout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 w-full mx-auto px-4 py-6 ${isHome ? "max-w-6xl" : "max-w-5xl"}`}>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
