import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Edit2, User, Mail, Phone, MapPin, Calendar, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";

export default function Profile() {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingHandbook, setIsEditingHandbook] = useState(false);
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
  });

  const [handbookInfo, setHandbookInfo] = useState({
    biography: "",
    hobbies: "",
    skills: "",
    goals: "",
    notes: "",
  });

  useEffect(() => {
    if (profile) {
      setBasicInfo({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        address: profile.address || "",
      });
      setHandbookInfo({
        biography: profile.biography || "",
        hobbies: profile.hobbies || "",
        skills: profile.skills || "",
        goals: profile.goals || "",
        notes: profile.notes || "",
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      if (!profile) throw new Error("No profile found");
      return await apiRequest("PATCH", `/api/profile/${profile.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const handleSaveBasic = () => {
    updateMutation.mutate({
      name: basicInfo.name,
      email: basicInfo.email,
      phone: basicInfo.phone,
      age: basicInfo.age ? parseInt(basicInfo.age) : null,
      gender: basicInfo.gender,
      address: basicInfo.address,
    });
    toast({
      title: "Profile updated",
      description: "Your basic information has been saved successfully.",
    });
    setIsEditingBasic(false);
  };

  const handleSaveHandbook = () => {
    updateMutation.mutate({
      biography: handbookInfo.biography,
      hobbies: handbookInfo.hobbies,
      skills: handbookInfo.skills,
      goals: handbookInfo.goals,
      notes: handbookInfo.notes,
    });
    toast({
      title: "Handbook updated",
      description: "Your personal handbook has been saved successfully.",
    });
    setIsEditingHandbook(false);
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
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and handbook details
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={profile?.profilePicture || ""} alt={basicInfo.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                {basicInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full shadow-lg"
              data-testid="button-upload-avatar"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-card-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Your essential personal details</CardDescription>
              </div>
              {!isEditingBasic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingBasic(true)}
                  data-testid="button-edit-basic"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    data-testid="input-name"
                  />
                ) : (
                  <p className="text-foreground py-2">{basicInfo.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="email"
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    data-testid="input-email"
                  />
                ) : (
                  <p className="text-foreground py-2">{basicInfo.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="phone"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                ) : (
                  <p className="text-foreground py-2">{basicInfo.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Age
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="age"
                    type="number"
                    value={basicInfo.age}
                    onChange={(e) => setBasicInfo({ ...basicInfo, age: e.target.value })}
                    data-testid="input-age"
                  />
                ) : (
                  <p className="text-foreground py-2">{basicInfo.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Gender
                </Label>
                {isEditingBasic ? (
                  <Select
                    value={basicInfo.gender}
                    onValueChange={(value) => setBasicInfo({ ...basicInfo, gender: value })}
                  >
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-foreground py-2">{basicInfo.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="address"
                    value={basicInfo.address}
                    onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                    data-testid="input-address"
                  />
                ) : (
                  <p className="text-foreground py-2">{basicInfo.address}</p>
                )}
              </div>
            </div>

            {isEditingBasic && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingBasic(false)}
                  data-testid="button-cancel-basic"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveBasic} disabled={updateMutation.isPending} data-testid="button-save-basic">
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Handbook</CardTitle>
                <CardDescription>
                  Your in-depth information, aspirations, and notes
                </CardDescription>
              </div>
              {!isEditingHandbook && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingHandbook(true)}
                  data-testid="button-edit-handbook"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="biography">Biography</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="biography"
                  value={handbookInfo.biography}
                  onChange={(e) =>
                    setHandbookInfo({ ...handbookInfo, biography: e.target.value })
                  }
                  rows={4}
                  data-testid="input-biography"
                />
              ) : (
                <p className="text-foreground leading-relaxed">{handbookInfo.biography}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies & Interests</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="hobbies"
                  value={handbookInfo.hobbies}
                  onChange={(e) =>
                    setHandbookInfo({ ...handbookInfo, hobbies: e.target.value })
                  }
                  rows={3}
                  data-testid="input-hobbies"
                />
              ) : (
                <p className="text-foreground">{handbookInfo.hobbies}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Expertise</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="skills"
                  value={handbookInfo.skills}
                  onChange={(e) =>
                    setHandbookInfo({ ...handbookInfo, skills: e.target.value })
                  }
                  rows={3}
                  data-testid="input-skills"
                />
              ) : (
                <p className="text-foreground">{handbookInfo.skills}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Goals & Aspirations</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="goals"
                  value={handbookInfo.goals}
                  onChange={(e) =>
                    setHandbookInfo({ ...handbookInfo, goals: e.target.value })
                  }
                  rows={3}
                  data-testid="input-goals"
                />
              ) : (
                <p className="text-foreground">{handbookInfo.goals}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Personal Notes</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="notes"
                  value={handbookInfo.notes}
                  onChange={(e) =>
                    setHandbookInfo({ ...handbookInfo, notes: e.target.value })
                  }
                  rows={3}
                  data-testid="input-notes"
                />
              ) : (
                <p className="text-foreground">{handbookInfo.notes}</p>
              )}
            </div>

            {isEditingHandbook && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingHandbook(false)}
                  data-testid="button-cancel-handbook"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveHandbook} disabled={updateMutation.isPending} data-testid="button-save-handbook">
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
