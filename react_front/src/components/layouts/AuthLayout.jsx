import React from "react";
import logo from "../../assets/logo.png";

function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <header className="absolute left-0 top-0 w-full px-6 py-6">
        <img src={logo} alt="CarsBusiness" className="h-10 w-auto" />
      </header>
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
