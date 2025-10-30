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

// Mock profile data
const mockProfile = {
  id: 1,
  name: "Chandhru Loganathan",
  email: "chandhru@example.com",
  phone: "+91 9876543210",
  age: 21,
  gender: "Male",
  address: "Chennai, India",
  biography:
    "I am a passionate engineering student pursuing AI & Data Science. I love coding and building creative projects.",
  hobbies: "Gaming, Coding, Reading, Traveling",
  skills: "C, C++, Python, React, MySQL, WordPress",
  goals: "Become a full-stack developer and a game developer.",
  notes: "Always keep learning and stay consistent.",
  profilePicture: "",
};

export default function Profile() {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingHandbook, setIsEditingHandbook] = useState(false);
  const { toast } = useToast();

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

  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading (mock)
  useEffect(() => {
    const timer = setTimeout(() => {
      setBasicInfo({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        age: mockProfile.age.toString(),
        gender: mockProfile.gender,
        address: mockProfile.address,
      });
      setHandbookInfo({
        biography: mockProfile.biography,
        hobbies: mockProfile.hobbies,
        skills: mockProfile.skills,
        goals: mockProfile.goals,
        notes: mockProfile.notes,
      });
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveBasic = () => {
    toast({
      title: "Profile updated",
      description: "Your basic information has been saved successfully.",
    });
    setIsEditingBasic(false);
  };

  const handleSaveHandbook = () => {
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

        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={mockProfile.profilePicture || ""} alt={basicInfo.name} />
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
                <CardDescription>Your essential personal details</CardDescription>
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
                  <p className="text-foreground py-2">{basicInfo.name}</p>
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
                  <p className="text-foreground py-2">{basicInfo.email}</p>
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
                  <p className="text-foreground py-2">{basicInfo.phone}</p>
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
                  <p className="text-foreground py-2">{basicInfo.age}</p>
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
                  <p className="text-foreground py-2">{basicInfo.gender}</p>
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
                  <p className="text-foreground py-2">{basicInfo.address}</p>
                )}
              </div>
            </div>

            {/* Save & Cancel Buttons */}
            {isEditingBasic && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsEditingBasic(false)}>
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
                    setHandbookInfo({ ...handbookInfo, biography: e.target.value })
                  }
                  rows={4}
                />
              ) : (
                <p className="text-foreground leading-relaxed">
                  {handbookInfo.biography}
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
                    setHandbookInfo({ ...handbookInfo, hobbies: e.target.value })
                  }
                  rows={3}
                />
              ) : (
                <p className="text-foreground">{handbookInfo.hobbies}</p>
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
                <p className="text-foreground">{handbookInfo.skills}</p>
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
                <p className="text-foreground">{handbookInfo.goals}</p>
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
                <p className="text-foreground">{handbookInfo.notes}</p>
              )}
            </div>

            {/* Save & Cancel Buttons */}
            {isEditingHandbook && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsEditingHandbook(false)}>
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
