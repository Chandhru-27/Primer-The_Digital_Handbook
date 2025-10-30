import { Home, User, Link2, Shield, ChevronRight } from "lucide-react";
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
import { ThemeToggle } from "../components/theme-toggle";
import UserProfile, { getUserProfile } from "../lib/api/user";
import { useEffect, useState } from "react";

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
  const [location] = useLocation();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserProfile();
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
          <p className="text-xl text-muted-foreground">Primer</p>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
