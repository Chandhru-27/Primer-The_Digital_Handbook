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
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Save,
  X,
  Edit2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import { useToast } from "../lib/hooks/use-toast";
import { checkLoginStatus } from "@/lib/api/auth";
import {
  getUserProfile,
  UserProfile,
  updateUserProfile,
  getHandbookInfo,
  updateHandbookField,
  HandbookEntry,
} from "@/lib/api/user";
import {
  useFetchHandbook,
  useUpdateHandbook,
  useUpdateUserProfile,
  useUserProfile,
} from "@/lib/hooks/app-hooks";

export default function Profile() {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingHandbook, setIsEditingHandbook] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useUserProfile();
  const { data: handbookData, isLoading: handbookLoading } = useFetchHandbook();

  // const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (user) {
      setBasicInfo({
        name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age?.toString() || "",
        gender: user.gender || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (handbookData) {
      const map = Object.fromEntries(
        handbookData.map((data) => [data.field_name, data.field_value])
      );

      setHandbookInfo({
        biography: map.biography || "",
        hobbies: map.hobbies || "",
        skills: map.skills || "",
        goals: map.goals || "",
        notes: map.notes || "",
      });
    }
  }, [handbookData]);

  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const handleSaveBasic = async () => {
    try {
      const updateData: Partial<UserProfile> = {};

      // Compare against current `user` to avoid no-op updates
      if (user) {
        if (basicInfo.name && basicInfo.name !== user.full_name)
          updateData.full_name = basicInfo.name;
        if (basicInfo.email && basicInfo.email !== user.email)
          updateData.email = basicInfo.email;
        if (basicInfo.phone && basicInfo.phone !== user.phone)
          updateData.phone = basicInfo.phone;
        if (basicInfo.age && parseInt(basicInfo.age) !== user.age)
          updateData.age = parseInt(basicInfo.age);
        if ((basicInfo.gender || null) !== (user.gender || null))
          updateData.gender = basicInfo.gender || null;
        if (basicInfo.address && basicInfo.address !== user.address)
          updateData.address = basicInfo.address;
      } else {
        // Fallback: same behavior as before if user object missing
        if (basicInfo.name) updateData.full_name = basicInfo.name;
        if (basicInfo.email) updateData.email = basicInfo.email;
        if (basicInfo.phone) updateData.phone = basicInfo.phone;
        if (basicInfo.age) updateData.age = parseInt(basicInfo.age);
        updateData.gender = basicInfo.gender || null;
        if (basicInfo.address) updateData.address = basicInfo.address;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        toast({
          title: "Profile updated",
          description: "Your basic information has been saved successfully.",
        });
      } else {
        toast({ title: "No changes", description: "No updates to save." });
      }

      setIsEditingBasic(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { mutateAsync: updateHndbook } = useUpdateHandbook();

  const handleSaveHandbook = async () => {
    try {
      const updatePromises: Promise<any>[] = [];

      // Build a map of current handbook values to compare
      const currentMap = Object.fromEntries(
        (handbookData || []).map((d: HandbookEntry) => [
          d.field_name,
          d.field_value,
        ])
      );

      if (handbookInfo.biography !== (currentMap.biography || "")) {
        updatePromises.push(
          updateHndbook({
            field_name: "biography",
            field_value: handbookInfo.biography,
          })
        );
      }
      if (handbookInfo.hobbies !== (currentMap.hobbies || "")) {
        updatePromises.push(
          updateHndbook({
            field_name: "hobbies",
            field_value: handbookInfo.hobbies,
          })
        );
      }
      if (handbookInfo.skills !== (currentMap.skills || "")) {
        updatePromises.push(
          updateHndbook({
            field_name: "skills",
            field_value: handbookInfo.skills,
          })
        );
      }
      if (handbookInfo.goals !== (currentMap.goals || "")) {
        updatePromises.push(
          updateHndbook({
            field_name: "goals",
            field_value: handbookInfo.goals,
          })
        );
      }
      if (handbookInfo.notes !== (currentMap.notes || "")) {
        updatePromises.push(
          updateHndbook({
            field_name: "notes",
            field_value: handbookInfo.notes,
          })
        );
      }

      if (updatePromises.length === 0) {
        toast({
          title: "No changes",
          description: "No updates to save.",
          variant: "destructive",
        });
        return;
      }

      await Promise.all(updatePromises);

      toast({
        title: "Handbook updated",
        description: "Your personal handbook has been saved successfully.",
      });

      setIsEditingHandbook(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update handbook. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (userLoading || handbookLoading) {
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

        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={user?.profile_pic || ""} alt={user?.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                {(user?.full_name || user?.username || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full shadow-lg"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6 border-card-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your essential personal details
                </CardDescription>
              </div>
              {!isEditingBasic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingBasic(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {basicInfo.name || (
                      <span className="text-muted-foreground italic">
                        No data yet - configure soon
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Email */}
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
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, email: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {basicInfo.email || (
                      <span className="text-muted-foreground italic">
                        No data yet - configure soon
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="phone"
                    value={basicInfo.phone}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {basicInfo.phone || (
                      <span className="text-muted-foreground italic">
                        No data yet - configure soon
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Age */}
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
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, age: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {basicInfo.age || (
                      <span className="text-muted-foreground italic">
                        No data yet - configure soon
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Gender
                </Label>
                {isEditingBasic ? (
                  <Select
                    value={basicInfo.gender}
                    onValueChange={(value) =>
                      setBasicInfo({ ...basicInfo, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-foreground py-2">
                    {basicInfo.gender || (
                      <span className="text-muted-foreground italic">
                        No data yet - configure soon
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="address"
                    value={basicInfo.address}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, address: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {basicInfo.address || (
                      <span className="text-muted-foreground italic">
                        No data yet - configure soon
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Save & Cancel Buttons */}
            {isEditingBasic && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingBasic(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveBasic}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Handbook Section */}
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
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Biography */}
            <div className="space-y-2">
              <Label htmlFor="biography">Biography</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="biography"
                  value={handbookInfo.biography}
                  onChange={(e) =>
                    setHandbookInfo({
                      ...handbookInfo,
                      biography: e.target.value,
                    })
                  }
                  rows={4}
                />
              ) : (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {handbookInfo.biography || (
                    <span className="text-muted-foreground italic">
                      No data yet - configure soon
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Hobbies */}
            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies & Interests</Label>
              {isEditingHandbook ? (
                <Textarea
                  id="hobbies"
                  value={handbookInfo.hobbies}
                  onChange={(e) =>
                    setHandbookInfo({
                      ...handbookInfo,
                      hobbies: e.target.value,
                    })
                  }
                  rows={3}
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap">
                  {handbookInfo.hobbies || (
                    <span className="text-muted-foreground italic">
                      No data yet - configure soon
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Skills */}
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
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap">
                  {handbookInfo.skills || (
                    <span className="text-muted-foreground italic">
                      No data yet - configure soon
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Goals */}
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
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap">
                  {handbookInfo.goals || (
                    <span className="text-muted-foreground italic">
                      No data yet - configure soon
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Notes */}
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
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap">
                  {handbookInfo.notes || (
                    <span className="text-muted-foreground italic">
                      No data yet - configure soon
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Save & Cancel Buttons */}
            {isEditingHandbook && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingHandbook(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveHandbook}>
                  <Save className="h-4 w-4 mr-2" />
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
