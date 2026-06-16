import { Outlet } from "react-router";
import Navbar from "../nav/Navbar";
import Footer from "../nav/Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
