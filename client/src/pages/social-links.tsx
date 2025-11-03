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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import {
  SiGithub,
  SiLinkedin,
  SiX,
  SiInstagram,
  SiFacebook,
  SiYoutube,
} from "react-icons/si";
import { useToast } from "../lib/hooks/use-toast";
import {
  getSocialLinks,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  SocialLink,
} from "../lib/api/user";

const platformIcons: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  GitHub: { icon: SiGithub, color: "text-gray-900 dark:text-gray-100" },
  LinkedIn: { icon: SiLinkedin, color: "text-blue-600" },
  Twitter: { icon: SiX, color: "text-gray-900 dark:text-gray-100" },
  Instagram: { icon: SiInstagram, color: "text-pink-600" },
  Facebook: { icon: SiFacebook, color: "text-blue-600" },
  YouTube: { icon: SiYoutube, color: "text-red-600" },
};

export default function SocialLinks() {
  const { toast } = useToast();

  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    username: "",
    url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        const socialLinks = await getSocialLinks();
        setLinks(socialLinks);
      } catch (error) {
        console.error("Failed to load social links:", error);
      }

      setLoading(false);
    };

    loadSocialLinks();
  }, []);

  const handleAdd = async () => {
    if (!formData.platform || !formData.username || !formData.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await addSocialLink(
        formData.platform,
        formData.username,
        formData.url
      );

      if (response) {
        const updatedLinks = await getSocialLinks();
        setLinks(updatedLinks);

        setFormData({ platform: "", username: "", url: "" });
        setIsAddDialogOpen(false);

        toast({
          title: "Link added",
          description: `Your ${formData.platform} profile has been added successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add social link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform_name,
      username: link.username || "",
      url: link.profile_link,
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      setLoading(true);
      const response = await updateSocialLink(
        id,
        formData.platform,
        formData.username,
        formData.url
      );

      if (response) {
        // Reload social links to get updated data
        const updatedLinks = await getSocialLinks();
        setLinks(updatedLinks);

        setEditingId(null);
        setFormData({ platform: "", username: "", url: "" });

        toast({
          title: "Link updated",
          description: "Your social link has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update social link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, platform: string) => {
    try {
      const response = await deleteSocialLink(id);

      if (response) {
        // Reload social links to reflect the deletion
        const updatedLinks = await getSocialLinks();
        setLinks(updatedLinks);

        toast({
          title: "Link removed",
          description: `Your ${platform} profile has been removed successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete social link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ platform: "", username: "", url: "" });
  };

  if (loading) {
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Link</DialogTitle>
                <DialogDescription>
                  Connect a new social media profile to your handbook
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger>
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
                  <Label>Username</Label>
                  <Input
                    placeholder="@username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profile URL</Label>
                  <Input
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add Link</Button>
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
              <h3 className="text-lg font-semibold mb-2">
                No social links yet
              </h3>
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
              const IconComponent = platformIcons[link.platform_name]?.icon;
              const isEditing = editingId === link.id;

              return (
                <Card
                  key={link.id}
                  className="group hover-elevate active-elevate-2 transition-all duration-300 border-card-border"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-muted">
                        {IconComponent && (
                          <IconComponent
                            className={`h-8 w-8 ${
                              platformIcons[link.platform_name]?.color
                            }`}
                          />
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(link)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(link.id, link.platform_name)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Username"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="URL"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData({ ...formData, url: e.target.value })
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">
                          {link.platform_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {link.username || link.platform_name}
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
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUpdate(link.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={link.profile_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
