import { Link } from "wouter";
import { User, Link2, Shield, ArrowRight, Edit, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Profile, SocialLink, VaultCredential } from "@shared/schema";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: socialLinks = [], isLoading: linksLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const { data: credentials = [], isLoading: credentialsLoading } = useQuery<VaultCredential[]>({
    queryKey: ["/api/vault/credentials"],
  });

  const isLoading = profileLoading || linksLoading || credentialsLoading;

  const userName = profile?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("");

  const quickActions = [
    {
      title: "Profile",
      description: "Manage your personal information and handbook details",
      icon: User,
      href: "/profile",
      color: "bg-primary/10 text-primary",
      stats: profile?.biography ? "Profile complete" : "Complete your profile",
    },
    {
      title: "Social Links",
      description: "Connect and manage your social media presence",
      icon: Link2,
      href: "/social-links",
      color: "bg-chart-2/10 text-chart-2",
      stats: `${socialLinks.length} ${socialLinks.length === 1 ? 'link' : 'links'} connected`,
    },
    {
      title: "Vault",
      description: "Securely store and manage your passwords",
      icon: Shield,
      href: "/vault",
      color: "bg-chart-3/10 text-chart-3",
      stats: `${credentials.length} ${credentials.length === 1 ? 'credential' : 'credentials'} saved`,
    },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm border border-primary/20 p-8 md:p-12">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                  <AvatarImage src={profile?.profilePicture || ""} alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      Welcome back, {userName.split(" ")[0]}!
                    </h1>
                    <Badge variant="secondary" className="hidden md:inline-flex">
                      Active
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">
                    Your personal handbook is ready to help you stay organized and secure.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Profile complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">{socialLinks.length} social links</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-muted-foreground">Vault secured</span>
                    </div>
                  </div>
                </div>
                <Button asChild size="lg" data-testid="button-edit-profile">
                  <Link href="/profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="group hover-elevate active-elevate-2 transition-all duration-300 cursor-pointer border-card-border"
                data-testid={`card-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Link href={action.href}>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-xl">{action.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-muted-foreground">
                      {action.stats}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Profile updated</p>
                  <p className="text-xs text-muted-foreground">
                    You updated your biography and skills
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  2 hours ago
                </span>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Link2 className="h-4 w-4 text-chart-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Added social link</p>
                  <p className="text-xs text-muted-foreground">
                    Connected your GitHub profile
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  1 day ago
                </span>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <Shield className="h-4 w-4 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Vault secured</p>
                  <p className="text-xs text-muted-foreground">
                    Added 2 new credentials to vault
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  3 days ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
