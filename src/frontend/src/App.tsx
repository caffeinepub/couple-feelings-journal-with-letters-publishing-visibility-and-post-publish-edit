import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import ProfileSetupDialog from "./components/auth/ProfileSetupDialog";
import RequireAuth from "./components/auth/RequireAuth";
import AppShell from "./components/layout/AppShell";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import LetterEditorPage from "./pages/LetterEditorPage";
import MyLettersPage from "./pages/MyLettersPage";
import PublicFeedPage from "./pages/PublicFeedPage";
import SettingsPartnerPage from "./pages/SettingsPartnerPage";

function RootLayout() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      {showProfileSetup && <ProfileSetupDialog />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: PublicFeedPage,
});

const myLettersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-letters",
  component: () => (
    <RequireAuth>
      <MyLettersPage />
    </RequireAuth>
  ),
});

// Editor is open to all — unauthenticated users can write public letters
const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  component: LetterEditorPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <RequireAuth>
      <SettingsPartnerPage />
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  myLettersRoute,
  editorRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
