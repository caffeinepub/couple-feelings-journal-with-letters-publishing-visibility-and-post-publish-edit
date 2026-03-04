import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Heart, Mail, PenLine, Settings } from "lucide-react";
import type React from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../../hooks/useQueries";
import LoginButton from "../auth/LoginButton";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;

  const navLinks = [
    { path: "/", label: "Love Letters", icon: Mail, public: true },
    { path: "/editor", label: "Write", icon: PenLine, public: true },
    { path: "/my-letters", label: "My Letters", icon: FileText, public: false },
    { path: "/settings", label: "Settings", icon: Settings, public: false },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Warm parchment background layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage:
            "url(/assets/generated/paper-texture.dim_1600x900.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "800px 450px",
        }}
      />
      {/* Subtle radial warm glow behind content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.92 0.06 20 / 0.18) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full">
        {/* Gold shimmer accent line */}
        <div className="h-px w-full gold-shimmer" />
        <div
          className="border-b border-primary/15"
          style={{
            background: "oklch(0.99 0.01 45 / 0.96)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              to="/"
              data-ocid="nav.link"
              className="flex items-center gap-3 group hover:opacity-85 transition-opacity"
            >
              <img
                src="/assets/generated/envelope-icon.dim_256x256.png"
                alt="Love Letters"
                className="h-8 w-8 drop-shadow-sm"
              />
              <span className="font-script text-[1.6rem] text-primary leading-none tracking-wide italic">
                Love Letters
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                if (!link.public && !isAuthenticated) return null;
                const Icon = link.icon;
                const isActive = currentPath === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    data-ocid="nav.link"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body tracking-wide transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/8 font-semibold"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated && userProfile && (
                <span className="hidden sm:inline font-script italic text-base text-primary/70 leading-none">
                  ♡ {userProfile.name}
                </span>
              )}
              <LoginButton />
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden border-t border-primary/10">
            <nav className="container mx-auto px-4 py-2 flex items-center justify-around">
              {navLinks.map((link) => {
                if (!link.public && !isAuthenticated) return null;
                const Icon = link.icon;
                const isActive = currentPath === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    data-ocid="nav.link"
                    className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-body tracking-wide transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/8"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        {/* Bottom gold accent line */}
        <div className="h-px w-full gold-shimmer opacity-60" />
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer
        className="relative z-10 mt-auto border-t border-primary/15"
        style={{
          background: "oklch(0.97 0.02 22 / 0.98)",
        }}
      >
        {/* Gold accent top */}
        <div className="h-px w-full gold-shimmer opacity-50" />
        <div className="container mx-auto px-4 py-8">
          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-primary/12" />
            <Heart className="h-3 w-3 text-primary/40 fill-primary/25" />
            <div className="flex-1 h-px bg-primary/12" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <span>© {new Date().getFullYear()}</span>
              <span className="text-primary/30">•</span>
              <span className="flex items-center gap-1.5">
                Built with{" "}
                <Heart className="h-3 w-3 text-primary fill-primary/80" /> using{" "}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.hostname
                      : "love-letters",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary/70 hover:text-primary transition-colors"
                >
                  caffeine.ai
                </a>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <SiX className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
