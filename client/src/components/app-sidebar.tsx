import {
  Home,
  User,
  Link2,
  Shield,
  ChevronRight,
  LogIn,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "../components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/theme-toggle";
import { useToast } from "../lib/hooks/use-toast";
import { useAuth, useUserProfile, useLogout } from "../lib/hooks/app-hooks";
import { useQueryClient } from "@tanstack/react-query";

export function AppSidebar() {
  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      title: "Social Links",
      url: "/social-links",
      icon: Link2,
    },
    {
      title: "Vault",
      url: "/vault",
      icon: Shield,
    },
  ];

  const [location] = useLocation();
  const { toast } = useToast();
  const { data: loggedIn } = useAuth();
  const { data: user } = useUserProfile(!!loggedIn);
  const logout = useLogout();
  const queryClient = useQueryClient();

  const userName = user?.username || "Username";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-sidebar-border">
            <AvatarImage src={user?.profile_pic || ""} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 mi n-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Your Handbook
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {location === item.url && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout.mutateAsync().then(() => {
                    queryClient.invalidateQueries({ queryKey: ["auth"] });
                    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                    queryClient.invalidateQueries({ queryKey: ["vaultEntries"] });
                    queryClient.invalidateQueries({queryKey: ["socialLinks"]});
                    queryClient.invalidateQueries({queryKey: ["dashboard"]});
                    queryClient.invalidateQueries({queryKey: ["handbook"]});
                    toast({
                      title: "Logged out",
                      description: "You have been successfully logged out.",
                    });
                    window.dispatchEvent(new Event('auth-change'));
                    window.location.reload();
                  });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : (
              <Link href="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
