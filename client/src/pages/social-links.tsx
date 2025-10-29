import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ExternalLink, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";
import { SiGithub, SiLinkedin, SiX, SiInstagram, SiFacebook, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SocialLink } from "@shared/schema";

const platformIcons: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  GitHub: { icon: SiGithub, color: "text-gray-900 dark:text-gray-100" },
  LinkedIn: { icon: SiLinkedin, color: "text-blue-600" },
  Twitter: { icon: SiX, color: "text-gray-900 dark:text-gray-100" },
  Instagram: { icon: SiInstagram, color: "text-pink-600" },
  Facebook: { icon: SiFacebook, color: "text-blue-600" },
  YouTube: { icon: SiYoutube, color: "text-red-600" },
};

export default function SocialLinks() {
  const { toast } = useToast();
  const { data: links = [], isLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    username: "",
    url: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: { platform: string; username: string; url: string; icon: string }) => {
      return await apiRequest("POST", "/api/social-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SocialLink> }) => {
      return await apiRequest("PATCH", `/api/social-links/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/social-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
    },
  });

  const handleAdd = () => {
    if (!formData.platform || !formData.username || !formData.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      platform: formData.platform,
      username: formData.username,
      url: formData.url,
      icon: formData.platform.toLowerCase(),
    });

    setFormData({ platform: "", username: "", url: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Link added",
      description: `Your ${formData.platform} profile has been added successfully.`,
    });
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      username: link.username,
      url: link.url,
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      data: {
        platform: formData.platform,
        username: formData.username,
        url: formData.url,
      },
    });
    setEditingId(null);
    setFormData({ platform: "", username: "", url: "" });
    toast({
      title: "Link updated",
      description: "Your social link has been updated successfully.",
    });
  };

  const handleDelete = (id: string, platform: string) => {
    deleteMutation.mutate(id);
    toast({
      title: "Link removed",
      description: `Your ${platform} profile has been removed successfully.`,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ platform: "", username: "", url: "" });
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold mb-2">Social Links</h1>
            <p className="text-muted-foreground">
              Connect and manage your social media presence
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-link">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-link">
              <DialogHeader>
                <DialogTitle>Add Social Link</DialogTitle>
                <DialogDescription>
                  Connect a new social media profile to your handbook
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(platformIcons).map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="@username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Profile URL</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    data-testid="input-url"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={createMutation.isPending} data-testid="button-save-link">
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Add Link"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {links.length === 0 ? (
          <Card className="border-card-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No social links yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Add your first social media profile to get started
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => {
              const IconComponent = platformIcons[link.platform]?.icon;
              const isEditing = editingId === link.id;

              return (
                <Card
                  key={link.id}
                  className="group hover-elevate active-elevate-2 transition-all duration-300 border-card-border"
                  data-testid={`card-link-${link.id}`}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-muted">
                        {IconComponent && (
                          <IconComponent className={`h-8 w-8 ${platformIcons[link.platform]?.color}`} />
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(link)}
                            data-testid={`button-edit-${link.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(link.id, link.platform)}
                            data-testid={`button-delete-${link.id}`}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          data-testid={`input-edit-username-${link.id}`}
                        />
                        <Input
                          placeholder="URL"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          data-testid={`input-edit-url-${link.id}`}
                        />
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">{link.platform}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {link.username}
                        </CardDescription>
                      </>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={handleCancel}
                          data-testid={`button-cancel-edit-${link.id}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUpdate(link.id)}
                          disabled={updateMutation.isPending}
                          data-testid={`button-save-edit-${link.id}`}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                        data-testid={`button-visit-${link.id}`}
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          Visit Profile
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
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
