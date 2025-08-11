import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-6 flex items-center justify-center border-t bg-white dark:bg-black text-xs text-muted-foreground">
      <span>
        © {new Date().getFullYear()} Temp Mail · <a href="/privacy" className="underline">Privacy</a>
      </span>
    </footer>
  );
}
