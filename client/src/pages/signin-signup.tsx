import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useToast } from "../lib/hooks/use-toast";
import { setVaultPassword } from "../lib/api/auth";
import { useSignIn, useSignUp } from "../lib/hooks/app-hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function SigninSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [Location, setLocation] = useLocation();
  const { toast } = useToast();
  const signinMutation = useSignIn();
  const signupMutation = useSignUp();
  const queryClient = useQueryClient();

  const [signinForm, setSigninForm] = useState({
    username: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    vaultPin: "",
    confirmVaultPin: "",
  });

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signinMutation.mutateAsync(signinForm);

      if (response.error) {
        toast({
          title: "Sign in failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: response.message,
        });
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        window.dispatchEvent(new Event("auth-change"));
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupForm.vaultPin !== signupForm.confirmVaultPin) {
      toast({
        title: "Validation Error",
        description: "Vault PINs do not match",
        variant: "destructive",
      });
      return;
    }

    if (signupForm.vaultPin.length < 4) {
      toast({
        title: "Validation Error",
        description: "Vault PIN must be at least 4 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
      };

      const signupResponse = await signupMutation.mutateAsync(signupData);

      if (signupResponse.error) {
        toast({
          title: "Sign up failed",
          description: signupResponse.error,
          variant: "destructive",
        });
        return;
      }
      const signinResponse = await signinMutation.mutateAsync({
        username: signupForm.username,
        password: signupForm.password,
      });

      if (signinResponse.error) {
        toast({
          title: "Account created but signin failed",
          description: "Please try signing in manually",
          variant: "destructive",
        });
        return;
      }

      try {
        await setVaultPassword(signupForm.vaultPin);
        toast({
          title: "Account created!",
          description: "Your account and vault have been set up successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        window.dispatchEvent(new Event("auth-change"));
        setLocation("/");
      } catch (vaultError) {
        console.error("Vault setup error:", vaultError);
        toast({
          title: "Account created with warning",
          description:
            "Account created but vault setup failed. Please try setting your vault password again.",
          variant: "destructive",
        });
        setLocation("/vault");
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLocation("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen flex justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4 overflow-y-auto">
      <div className="w-full max-w-md h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Primer</h1>
          <p className="text-muted-foreground">Your personal handbook</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-center gap-1 text-center my-5 bg-[#8C1717] p-2 border-1 rounded-md">
            <AlertCircle size={20} color="white" />
            <p className="text-sm text-white/90">
              Our server may be waking up🥱. If your login fails, please wait a
              minute and try again .
            </p>
          </div>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      type="text"
                      placeholder="Enter your username"
                      value={signinForm.username}
                      onChange={(e) =>
                        setSigninForm({
                          ...signinForm,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signinForm.password}
                        onChange={(e) =>
                          setSigninForm({
                            ...signinForm,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>
                  Sign up to get started with Primer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signupForm.username}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-vault-pin">Vault PIN</Label>
                    <Input
                      id="signup-vault-pin"
                      type="password"
                      placeholder="Create a vault PIN (min 4 characters)"
                      value={signupForm.vaultPin}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          vaultPin: e.target.value,
                        })
                      }
                      required
                      minLength={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-vault-pin">
                      Confirm Vault PIN
                    </Label>
                    <Input
                      id="signup-confirm-vault-pin"
                      type="password"
                      placeholder="Confirm your vault PIN"
                      value={signupForm.confirmVaultPin}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          confirmVaultPin: e.target.value,
                        })
                      }
                      required
                      minLength={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6 ">
          <p className="text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
