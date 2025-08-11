import * as React from "react";

const Header: React.FC = () => (
  <header className="w-full py-4 px-6 flex items-center justify-between border-b bg-white dark:bg-black">
    <span className="font-bold text-lg tracking-tight">Temp Mail</span>
    <nav aria-label="Main navigation">
      <a href="/" className="text-sm text-[hsl(var(--primary))] hover:underline">Home</a>
    </nav>
  </header>
);

export default Header;
