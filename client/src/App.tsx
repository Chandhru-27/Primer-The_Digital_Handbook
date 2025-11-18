import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import SocialLinks from "@/pages/social-links";
import Vault from "@/pages/vault";
import SigninSignup from "@/pages/signin-signup";
import { useAuthForContext } from "./lib/auth/auth-context";

function Router() {
  const { isLoggedIn } = useAuthForContext();

  return isLoggedIn ? (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/social-links" component={SocialLinks} />
      <Route path="/vault" component={Vault} />
      {/* If logged in user tries to go to /auth, maybe redirect them home? */}
      <Route path="/auth">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  ) : (
    <Switch>
      <Route path="/auth" component={SigninSignup} />
      <Route>
        <Redirect to="/auth" />
      </Route>
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b border-border bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-hidden ">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
