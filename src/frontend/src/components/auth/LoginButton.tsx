import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import React from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const text =
    loginStatus === "logging-in"
      ? "Logging in…"
      : isAuthenticated
        ? "Logout"
        : "Login";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? "outline" : "default"}
      size="sm"
      className={`gap-2 rounded-full font-body font-semibold text-sm ${
        isAuthenticated
          ? "border-primary/28 text-primary hover:bg-primary/8"
          : "bg-primary text-primary-foreground hover:bg-primary/85 shadow-paper"
      }`}
      data-ocid="nav.button"
    >
      {isAuthenticated ? (
        <LogOut className="h-4 w-4" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      {text}
    </Button>
  );
}
