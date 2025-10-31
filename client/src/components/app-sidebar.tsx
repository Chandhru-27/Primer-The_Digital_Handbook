import { Home, User, Link2, Shield, ChevronRight, LogIn, LogOut } from "lucide-react";
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
import { UserProfile, getUserProfile } from "../lib/api/user";
import { logout } from "../lib/api/auth";
import { useEffect, useState } from "react";
import { useToast } from "../lib/hooks/use-toast";

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

  const [user, setUser] = useState<UserProfile>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (authToken && userId) {
      setIsAuthenticated(true);
      getUserProfile(parseInt(userId)).then((data) => {
        if ('userName' in data) {
          setUser(data);
        }
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const userName = user?.userName || "Username";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-sidebar-border">
            <AvatarImage src={user?.profileImage || ""} alt={userName} />
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
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  setIsAuthenticated(false);
                  setUser(undefined);
                  toast({
                    title: "Logged out",
                    description: "You have been successfully logged out.",
                  });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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
