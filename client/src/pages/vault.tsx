import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Lock, Eye, EyeOff, Plus, Copy, Trash2, Edit2, Save, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { VaultCredential, VaultSetting } from "@shared/schema";

export default function Vault() {
  const { toast } = useToast();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const { data: credentials = [], isLoading: credentialsLoading } = useQuery<VaultCredential[]>({
    queryKey: ["/api/vault/credentials"],
    enabled: isUnlocked,
  });

  const { data: vaultSetting, isLoading: settingLoading } = useQuery<VaultSetting>({
    queryKey: ["/api/vault/setting"],
  });

  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    siteName: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<VaultCredential, "id">) => {
      return await apiRequest("POST", "/api/vault/credentials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault/credentials"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VaultCredential> }) => {
      return await apiRequest("PATCH", `/api/vault/credentials/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault/credentials"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vault/credentials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault/credentials"] });
    },
  });

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = vaultSetting?.pin || "1234";
    
    if (pin === correctPin) {
      setIsUnlocked(true);
      setPinError(false);
      toast({
        title: "Vault unlocked",
        description: "Welcome to your secure vault.",
      });
    } else {
      setPinError(true);
      setPin("");
      toast({
        title: "Incorrect PIN",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleAdd = () => {
    if (!formData.siteName || !formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      siteName: formData.siteName,
      username: formData.username,
      password: formData.password,
      url: formData.url || null,
      notes: formData.notes || null,
    });

    setFormData({ siteName: "", username: "", password: "", url: "", notes: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Credential added",
      description: `Credentials for ${formData.siteName} have been saved securely.`,
    });
  };

  const handleEdit = (credential: VaultCredential) => {
    setEditingId(credential.id);
    setFormData({
      siteName: credential.siteName,
      username: credential.username,
      password: credential.password,
      url: credential.url || "",
      notes: credential.notes || "",
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      data: {
        siteName: formData.siteName,
        username: formData.username,
        password: formData.password,
        url: formData.url || null,
        notes: formData.notes || null,
      },
    });
    setEditingId(null);
    setFormData({ siteName: "", username: "", password: "", url: "", notes: "" });
    toast({
      title: "Credential updated",
      description: "Your credentials have been updated successfully.",
    });
  };

  const handleDelete = (id: string, siteName: string) => {
    deleteMutation.mutate(id);
    toast({
      title: "Credential deleted",
      description: `Credentials for ${siteName} have been removed.`,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ siteName: "", username: "", password: "", url: "", notes: "" });
  };

  if (settingLoading) {
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
                Enter your 4-digit PIN to access your secure credentials
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
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ""));
                      setPinError(false);
                    }}
                    placeholder="••••"
                    className="text-center text-2xl tracking-widest font-mono"
                    data-testid="input-pin"
                    autoFocus
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={pin.length !== 4}
                data-testid="button-unlock"
              >
                <Shield className="h-4 w-4 mr-2" />
                Unlock Vault
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                For demo purposes, the PIN is: {vaultSetting?.pin || "1234"}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (credentialsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-credential">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-add-credential">
                <DialogHeader>
                  <DialogTitle>Add New Credential</DialogTitle>
                  <DialogDescription>
                    Securely store a new password or credential
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      placeholder="e.g., GitHub"
                      value={formData.siteName}
                      onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                      data-testid="input-site-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="username or email"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      data-testid="input-credential-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      data-testid="input-credential-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="https://..."
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      data-testid="input-credential-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Additional information"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      data-testid="input-credential-notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={createMutation.isPending} data-testid="button-save-credential">
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      "Save Credential"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={() => setIsUnlocked(false)}
              data-testid="button-lock-vault"
            >
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
              <h3 className="text-lg font-semibold mb-2">No credentials stored</h3>
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
                  className="border-card-border hover-elevate transition-all duration-200"
                  data-testid={`card-credential-${credential.id}`}
                >
                  <CardContent className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Site Name</Label>
                            <Input
                              value={formData.siteName}
                              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                              data-testid={`input-edit-site-${credential.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              data-testid={`input-edit-username-${credential.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              data-testid={`input-edit-password-${credential.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={formData.url}
                              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                              data-testid={`input-edit-url-${credential.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            data-testid={`button-cancel-edit-${credential.id}`}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleUpdate(credential.id)}
                            disabled={updateMutation.isPending}
                            data-testid={`button-save-edit-${credential.id}`}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
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
                              <h3 className="font-semibold text-foreground">{credential.siteName}</h3>
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
                          <Label className="text-xs text-muted-foreground mb-1 block">Username</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-foreground">{credential.username}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(credential.username, "Username")}
                              data-testid={`button-copy-username-${credential.id}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <Label className="text-xs text-muted-foreground mb-1 block">Password</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-foreground">
                              {isPasswordVisible ? credential.password : "••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => togglePasswordVisibility(credential.id)}
                              data-testid={`button-toggle-password-${credential.id}`}
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
                              onClick={() => copyToClipboard(credential.password, "Password")}
                              data-testid={`button-copy-password-${credential.id}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(credential)}
                            data-testid={`button-edit-credential-${credential.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(credential.id, credential.siteName)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-credential-${credential.id}`}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
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
