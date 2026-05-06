import { Lightbulb, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ManusDialog } from "@/components/ManusDialog";
import { toast } from "sonner";

const navItems = [
  { href: "/browse", label: "Browse" },
  { href: "/library", label: "My Library" },
  { href: "/community", label: "Community" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const storedSignedIn = window.localStorage.getItem("promptwise:signed-in") === "true";

    setSignedIn(storedSignedIn);
  }, []);

  const isActive = (href: string) => location === href;

  const handleLogin = () => {
    window.localStorage.setItem("promptwise:signed-in", "true");
    setSignedIn(true);
    setAuthDialogOpen(false);
    toast.success("Signed in to PromptWise");
  };

  const handleLogout = () => {
    window.localStorage.setItem("promptwise:signed-in", "false");
    setSignedIn(false);
    toast.success("Signed out");
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center shadow-lg group-hover:scale-105 transition-transform">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">PromptWise</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI Prompt Idea Bank</p>
              </div>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card/70 p-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                  ].join(" ")}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {signedIn ? (
              <Button variant="outline" className="hidden sm:flex" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button className="hidden sm:flex bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90" onClick={() => setAuthDialogOpen(true)}>
                Sign In
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={[
                      "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "hover:text-primary hover:bg-muted/70",
                    ].join(" ")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
              <div className="flex items-center gap-3">
                {signedIn ? (
                  <Button variant="outline" className="flex-1" onClick={handleLogout}>
                    Sign Out
                  </Button>
                ) : (
                  <Button className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" onClick={() => setAuthDialogOpen(true)}>
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      </header>

      <ManusDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onLogin={handleLogin} />
    </>
  );
}

