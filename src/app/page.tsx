import { Button, Input, Select, Dropdown, Tabs, Skeleton } from "../../components/ui";
import { useState } from "react";

export default function HomePage() {
  // Placeholder state for domain/provider
  const [local, setLocal] = useState("");
  const [domain, setDomain] = useState("");
  const [provider, setProvider] = useState("");

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-2 sm:px-0 py-8 gap-8">
      {/* Hero Section */}
      <section className="w-full max-w-xl rounded-xl p-6 sm:p-10 bg-gradient-to-br from-[hsl(var(--gradient-primary))] to-[hsl(var(--primary-glow))] shadow-glow flex flex-col items-center gap-6 text-center relative">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))]">Free Disposable Email</h1>
        <p className="text-base sm:text-lg text-white/90 max-w-md mx-auto">Protect your privacy and avoid spam with a temporary email address. No registration, instant inbox.</p>
        <form className="w-full flex flex-col sm:flex-row gap-3 items-stretch justify-center" aria-label="Create disposable email">
          <Input
            className="flex-1 min-w-0"
            placeholder="custom.localpart"
            value={local}
            onChange={e => setLocal(e.target.value)}
            aria-label="Local part"
            autoFocus
          />
          <Select className="w-32" aria-label="Domain picker" disabled>
            <option value="">@domain.com</option>
          </Select>
          <Select className="w-32" aria-label="Provider selector" disabled>
            <option value="">Provider</option>
          </Select>
        </form>
        <div className="flex gap-2 w-full justify-center">
          <Button variant="hero" className="flex-1 sm:flex-none" tabIndex={0} aria-label="Generate random email">Generate Random</Button>
          <Button variant="hero" className="flex-1 sm:flex-none" tabIndex={0} aria-label="Create custom email">Create</Button>
        </div>
        <div className="absolute right-4 top-4 hidden sm:block text-xs text-white/70 select-none">Tab/Shift+Tab to navigate</div>
      </section>

      {/* Email Address Card Placeholder */}
      <section className="w-full max-w-md flex flex-col items-center gap-2">
        <div className="w-full bg-white dark:bg-black rounded-lg shadow-elev p-4 flex items-center justify-between">
          <span className="font-mono text-lg text-[hsl(var(--primary))]">your.email@domain.com</span>
          <Button variant="outline" aria-label="Copy email">Copy</Button>
        </div>
      </section>

      {/* Tabs: Inbox | About */}
      <section className="w-full max-w-2xl mt-2">
        <Tabs
          tabs={[
            {
              label: "Inbox",
              id: "inbox",
              content: (
                <div className="flex flex-col md:flex-row gap-6 mt-2">
                  {/* Inbox List Skeleton */}
                  <div className="flex-1 min-w-[220px]">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-5/6 mb-2" />
                    <Skeleton className="h-6 w-2/3" />
                  </div>
                  {/* Message Viewer Skeleton */}
                  <div className="flex-1 min-w-[220px]">
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-40 w-full mb-2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ),
            },
            {
              label: "About",
              id: "about",
              content: (
                <div className="prose prose-sm max-w-none mt-2 text-muted-foreground">
                  <h2>About Temp Mail</h2>
                  <p>Temp Mail lets you create a disposable email address for free. Use it to sign up for services, receive verification codes, and keep your real inbox safe from spam.</p>
                  <ul>
                    <li>No registration required</li>
                    <li>Instant inbox, auto-refresh</li>
                    <li>Multiple domains and providers (coming soon)</li>
                  </ul>
                </div>
              ),
            },
          ]}
          defaultTabId="inbox"
        />
      </section>
      {/* Keyboard navigation hint for mobile */}
      <div className="sm:hidden text-xs text-muted-foreground mt-4">Tip: Use Tab to move between fields</div>
    </main>
  );
}
