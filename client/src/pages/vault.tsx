import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Save,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "../lib/hooks/use-toast";
import { Alert, AlertDescription } from "../components/ui/alert";
import type { VaultEntry as IVaultEntry } from "@/lib/api/vault";
import {
  useAddVaultEntry,
  useUnlockVault,
  useVaultEntries,
  useUpdateVaultEntry,
  useDeleteVaultEntry,
} from "@/lib/hooks/app-hooks";
import { useQueryClient } from "@tanstack/react-query";

interface VaultCredential {
  id: number;
  siteName: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export default function Vault() {
  const { toast } = useToast();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");

  const [pinError, setPinError] = useState(false);

  const unlockVaultMutation = useUnlockVault();

  const { data: vaultEntries = [], isLoading: vaultLoading } =
    useVaultEntries(isUnlocked);

  const addEntry = useAddVaultEntry();
  const updateEntry = useUpdateVaultEntry();
  const deleteEntry = useDeleteVaultEntry();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState<VaultCredential[]>([]);

  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(
    new Set()
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    siteName: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    unlockVaultMutation.mutate(
      {
        password: pin,
      },
      {
        onSuccess: () => {
          setIsUnlocked(true);
          setPinError(false);

          toast({
            title: "Vault unlocked",
            description: "Welcome to your secure vault.",
          });
        },
        onError: () => {
          setPinError(true);
          setPin("");
          toast({
            title: "Incorrect PIN",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  useEffect(() => {
    if (!vaultEntries) return;
    setCredentials((prevCreds) =>
      vaultEntries.map((e: IVaultEntry) => {
        const existing = prevCreds.find((c) => c.id === e.id);
        const password =
          existing && existing.password && existing.password !== "••••••••"
            ? existing.password
            : e.pin_or_password ?? "••••••••";

        return {
          id: e.id,
          siteName: e.domain,
          username: e.account_name,
          password,
          url: e.url,
          notes: e.notes || "",
        };
      })
    );
  }, [vaultEntries]);

  const handleViewPassword = (id: number) => {
    const entry = vaultEntries.find((e: IVaultEntry) => e.id === id);
    if (entry) {
      setCredentials((prev) =>
        prev.map((c) =>
          c.id === id
            ? (() => {
                const revealed =
                  entry.pin_or_password ?? c.password ?? "••••••••";
                return {
                  ...c,
                  password: revealed,
                  url: entry.url || c.url,
                  notes: entry.notes ?? c.notes,
                };
              })()
            : c
        )
      );
    } else {
      toast({
        title: "Unavailable",
        description:
          "Password not available in cache. Please unlock the vault or refresh entries.",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = async (id: number) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });

    const cred = credentials.find((c) => c.id === id);
    if (cred && cred.password === "••••••••") {
      await handleViewPassword(id);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const handleAdd = async () => {
    if (!formData.siteName || !formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    addEntry.mutate(
      {
        domain: formData.siteName,
        account_name: formData.username,
        pin_or_password: formData.password,
        url: formData.url || undefined,
        notes: formData.notes || "",
      },
      {
        onSuccess: () => {
          setFormData({
            siteName: "",
            username: "",
            password: "",
            url: "",
            notes: "",
          });
          setIsAddDialogOpen(false);
          toast({
            title: "Credential added",
            description: `Credentials for ${formData.siteName} have been saved securely.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add credential",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleEdit = (credential: VaultCredential) => {
    setEditingId(credential.id);
    setFormData({
      siteName: credential.siteName,
      username: credential.username,
      password: credential.password === "••••••••" ? "" : credential.password,
      url: credential.url || "",
      notes: credential.notes || "",
    });
  };

  const handleUpdate = async (id: number) => {
    setIsLoading(true);
    try {
      const original = credentials.find((c) => c.id === id);
      if (original) {
        const domainUnchanged = original.siteName === formData.siteName;
        const usernameUnchanged = original.username === formData.username;
        const urlUnchanged = (original.url || "") === (formData.url || "");
        const notesUnchanged =
          (original.notes || "") === (formData.notes || "");
        const passwordUnchanged =
          formData.password === "" || formData.password === original.password;

        if (
          domainUnchanged &&
          usernameUnchanged &&
          urlUnchanged &&
          notesUnchanged &&
          passwordUnchanged
        ) {
          setEditingId(null);
          setFormData({
            siteName: "",
            username: "",
            password: "",
            url: "",
            notes: "",
          });
          setIsLoading(false);
          toast({ title: "No changes", description: "No updates to save." });
          return;
        }
      }
      updateEntry.mutate(
        {
          id,
          updates: {
            domain: formData.siteName,
            account_name: formData.username,
            pin_or_password: formData.password || undefined,
            url: formData.url || undefined,
            notes: formData.notes || "",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vaultEntries"] });
            setEditingId(null);
            setFormData({
              siteName: "",
              username: "",
              password: "",
              url: "",
              notes: "",
            });
            toast({
              title: "Credential updated",
              description: "Your credentials have been updated successfully.",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update credential",
              variant: "destructive",
            });
          },
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update credential",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number, siteName: string) => {
    setIsLoading(true);
    deleteEntry.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Credential deleted",
            description: `Credentials for ${siteName} have been removed.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete credential",
            variant: "destructive",
          });
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      siteName: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    });
  };

  if (vaultLoading || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-card-border shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-primary/10">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl mb-2">Vault Locked</CardTitle>
              <CardDescription>
                Enter your vault password to access your secure credentials
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-6">
              {pinError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Incorrect PIN. Please try again.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your vault password"
                    className="text-center text-xl tracking-widest font-mono"
                    autoFocus
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!pin}>
                <Shield className="h-4 w-4 mr-2" />
                Unlock Vault
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Vault password reset feature coming soon....
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main vault UI
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Secure Vault
            </h1>
            <p className="text-muted-foreground">
              Your encrypted password manager
            </p>
          </div>
          <div className="flex gap-3">
            {/* Add Credential Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Credential</DialogTitle>
                  <DialogDescription>
                    Securely store a new password or credential
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {["siteName", "username", "password", "url", "notes"].map(
                    (field) => (
                      <div className="space-y-2" key={field}>
                        <Label htmlFor={field}>
                          {field === "siteName"
                            ? "Site Name *"
                            : field === "username"
                            ? "Username or Email *"
                            : field === "password"
                            ? "Password *"
                            : field === "url"
                            ? "Website URL"
                            : "Notes"}
                        </Label>
                        <Input
                          id={field}
                          type={field === "password" ? "password" : "text"}
                          placeholder={
                            field === "siteName"
                              ? "e.g., GitHub"
                              : field === "username"
                              ? "you@example.com or username"
                              : field === "url"
                              ? "https://..."
                              : field === "notes"
                              ? "Additional information"
                              : ""
                          }
                          value={(formData as any)[field]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field]: e.target.value,
                            })
                          }
                        />
                      </div>
                    )
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Save Credential</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => setIsUnlocked(false)}>
              <Lock className="h-4 w-4 mr-2" />
              Lock Vault
            </Button>
          </div>
        </div>

        {credentials.length === 0 ? (
          <Card className="border-card-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No credentials stored
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                Add your first credential to start using the vault
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Credential
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {credentials.map((credential) => {
              const isEditing = editingId === credential.id;
              const isPasswordVisible = visiblePasswords.has(credential.id);

              return (
                <Card
                  key={credential.id}
                  className="border-card-border transition-all duration-200"
                >
                  <CardContent className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["siteName", "username", "password", "url"].map(
                            (field) => (
                              <div className="space-y-2" key={field}>
                                <Label>
                                  {field === "siteName"
                                    ? "Site Name"
                                    : field === "username"
                                    ? "Username or Email"
                                    : field.charAt(0).toUpperCase() +
                                      field.slice(1)}
                                </Label>
                                <Input
                                  type={
                                    field === "password" ? "password" : "text"
                                  }
                                  value={(formData as any)[field]}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      [field]: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <textarea
                            className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm"
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Additional information about this credential"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={() => handleUpdate(credential.id)}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {credential.siteName}
                              </h3>
                              {credential.url && (
                                <a
                                  href={credential.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-primary"
                                >
                                  Visit site
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Username or Email
                          </Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono">
                              {credential.username}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                copyToClipboard(credential.username, "Username")
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Password
                          </Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono">
                              {isPasswordVisible
                                ? credential.password
                                : "••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                togglePasswordVisibility(credential.id)
                              }
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                copyToClipboard(credential.password, "Password")
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {credential.url && (
                          <div className="md:col-span-3">
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              Website URL
                            </Label>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono truncate max-w-[200px]">
                                {credential.url}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  copyToClipboard(credential.url ?? "", "URL")
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <a
                                href={credential.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80"
                              >
                                Visit site
                              </a>
                            </div>
                          </div>
                        )}

                        {credential.notes && (
                          <div className="md:col-span-9">
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              Notes
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {credential.notes}
                            </p>
                          </div>
                        )}

                        <div className="md:col-span-3 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(credential)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(credential.id, credential.siteName)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
