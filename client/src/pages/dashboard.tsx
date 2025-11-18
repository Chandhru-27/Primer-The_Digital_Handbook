import { Link } from "wouter";
import { User, Link2, Shield, ArrowRight, Edit, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useDashboard } from "@/lib/hooks/app-hooks";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  const userName = data?.username;
  const vaultCount = data?.vault_count;
  const socialCount = data?.social_count;
  let userInitials = "U";

  if (userName) {
    userInitials = userName
      .split(" ")
      .map((n: string) => n[0])
      .join("");
  }

  const quickActions = [
    {
      title: "Profile",
      description: "Manage your personal information and handbook details",
      icon: User,
      href: "/profile",
      color: "bg-primary/10 text-primary",
      stats: userName ? "Profile complete" : "Complete your profile",
    },
    {
      title: "Social Links",
      description: "Connect and manage your social media presence",
      icon: Link2,
      href: "/social-links",
      color: "bg-chart-2/10 text-chart-2",
      stats: `${socialCount} Social Links `,
    },
    {
      title: "Vault",
      description: "Securely store and manage your passwords",
      icon: Shield,
      href: "/vault",
      color: "bg-chart-3/10 text-chart-3",
      stats: `${vaultCount} Vault Entries`,
    },
  ];
  console.log("Dashboard query executed", data);
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto ">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-12">
        {/* User Info Section */}
        <div className="mb-8 md:mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm border border-primary/20 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                <AvatarImage src={data?.profile_pic || ""} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-start">
                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Welcome back, {userName ?? "User"}!
                  </h1>
                </div>

                <p className="text-muted-foreground text-lg mb-4">
                  Primer - Your personal handbook is ready to help you stay
                  organized and secure.
                </p>

                <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">
                      Profile complete
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">
                      {socialCount} social links
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Vault secured</span>
                  </div>
                </div>
              </div>

              <Button asChild size="lg">
                <Link href="/profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <Link href={action.href}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-xl">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
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
      </div>
    </div>
  );
}
