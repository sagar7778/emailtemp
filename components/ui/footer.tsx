import * as React from "react";

const Footer: React.FC = () => (
  <footer className="w-full py-4 px-6 flex items-center justify-center border-t bg-white dark:bg-black text-xs text-muted-foreground">
    <span>&copy; {new Date().getFullYear()} Temp Mail. All rights reserved.</span>
  </footer>
);

export default Footer;
