import {
  type Profile,
  type InsertProfile,
  type SocialLink,
  type InsertSocialLink,
  type VaultCredential,
  type InsertVaultCredential,
  type VaultSetting,
  type InsertVaultSetting,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;

  getSocialLinks(): Promise<SocialLink[]>;
  getSocialLink(id: string): Promise<SocialLink | undefined>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: string, link: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: string): Promise<boolean>;

  getVaultCredentials(): Promise<VaultCredential[]>;
  getVaultCredential(id: string): Promise<VaultCredential | undefined>;
  createVaultCredential(credential: InsertVaultCredential): Promise<VaultCredential>;
  updateVaultCredential(id: string, credential: Partial<InsertVaultCredential>): Promise<VaultCredential | undefined>;
  deleteVaultCredential(id: string): Promise<boolean>;

  getVaultSetting(): Promise<VaultSetting | undefined>;
  createVaultSetting(setting: InsertVaultSetting): Promise<VaultSetting>;
  updateVaultSetting(id: string, setting: Partial<InsertVaultSetting>): Promise<VaultSetting | undefined>;
}

export class MemStorage implements IStorage {
  private profile: Profile | undefined;
  private socialLinks: Map<string, SocialLink>;
  private vaultCredentials: Map<string, VaultCredential>;
  private vaultSetting: VaultSetting | undefined;

  constructor() {
    this.socialLinks = new Map();
    this.vaultCredentials = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const profileId = randomUUID();
    this.profile = {
      id: profileId,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      age: 28,
      gender: "Male",
      address: "123 Main St, San Francisco, CA 94105",
      biography: "Passionate software developer with a love for creating elegant solutions to complex problems. I enjoy working with modern web technologies and building user-centric applications.",
      hobbies: "Photography, hiking, reading sci-fi novels, playing guitar, cooking international cuisines",
      skills: "JavaScript, TypeScript, React, Node.js, Python, UI/UX Design, Project Management",
      goals: "Launch my own SaaS product by end of year, contribute more to open source, learn advanced system design patterns",
      notes: "Remember to update portfolio quarterly. Schedule regular skill assessments. Keep learning and stay curious.",
      profilePicture: null,
    };

    const link1: SocialLink = {
      id: randomUUID(),
      platform: "GitHub",
      username: "@johndoe",
      url: "https://github.com/johndoe",
      icon: "github",
    };
    const link2: SocialLink = {
      id: randomUUID(),
      platform: "LinkedIn",
      username: "John Doe",
      url: "https://linkedin.com/in/johndoe",
      icon: "linkedin",
    };
    const link3: SocialLink = {
      id: randomUUID(),
      platform: "Twitter",
      username: "@john_doe",
      url: "https://twitter.com/john_doe",
      icon: "twitter",
    };

    this.socialLinks.set(link1.id, link1);
    this.socialLinks.set(link2.id, link2);
    this.socialLinks.set(link3.id, link3);

    const cred1: VaultCredential = {
      id: randomUUID(),
      siteName: "GitHub",
      username: "john.doe@example.com",
      password: "SecurePass123!",
      url: "https://github.com",
      notes: null,
    };
    const cred2: VaultCredential = {
      id: randomUUID(),
      siteName: "LinkedIn",
      username: "johndoe",
      password: "MyLinkedIn2024",
      url: "https://linkedin.com",
      notes: null,
    };
    const cred3: VaultCredential = {
      id: randomUUID(),
      siteName: "Gmail",
      username: "john.doe@gmail.com",
      password: "Gmail$ecure456",
      url: "https://gmail.com",
      notes: null,
    };
    const cred4: VaultCredential = {
      id: randomUUID(),
      siteName: "Amazon",
      username: "john.doe@example.com",
      password: "Shop@mazon789",
      url: "https://amazon.com",
      notes: null,
    };
    const cred5: VaultCredential = {
      id: randomUUID(),
      siteName: "Netflix",
      username: "john.doe@example.com",
      password: "Watch&Chill99",
      url: "https://netflix.com",
      notes: null,
    };

    this.vaultCredentials.set(cred1.id, cred1);
    this.vaultCredentials.set(cred2.id, cred2);
    this.vaultCredentials.set(cred3.id, cred3);
    this.vaultCredentials.set(cred4.id, cred4);
    this.vaultCredentials.set(cred5.id, cred5);

    const settingId = randomUUID();
    this.vaultSetting = {
      id: settingId,
      pin: "1234",
    };
  }

  async getProfile(): Promise<Profile | undefined> {
    return this.profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { ...insertProfile, id };
    this.profile = profile;
    return profile;
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    if (!this.profile || this.profile.id !== id) {
      return undefined;
    }
    this.profile = { ...this.profile, ...updates };
    return this.profile;
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values());
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    return this.socialLinks.get(id);
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    const id = randomUUID();
    const link: SocialLink = { ...insertLink, id };
    this.socialLinks.set(id, link);
    return link;
  }

  async updateSocialLink(id: string, updates: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const link = this.socialLinks.get(id);
    if (!link) {
      return undefined;
    }
    const updatedLink = { ...link, ...updates };
    this.socialLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    return this.socialLinks.delete(id);
  }

  async getVaultCredentials(): Promise<VaultCredential[]> {
    return Array.from(this.vaultCredentials.values());
  }

  async getVaultCredential(id: string): Promise<VaultCredential | undefined> {
    return this.vaultCredentials.get(id);
  }

  async createVaultCredential(insertCredential: InsertVaultCredential): Promise<VaultCredential> {
    const id = randomUUID();
    const credential: VaultCredential = { ...insertCredential, id };
    this.vaultCredentials.set(id, credential);
    return credential;
  }

  async updateVaultCredential(id: string, updates: Partial<InsertVaultCredential>): Promise<VaultCredential | undefined> {
    const credential = this.vaultCredentials.get(id);
    if (!credential) {
      return undefined;
    }
    const updatedCredential = { ...credential, ...updates };
    this.vaultCredentials.set(id, updatedCredential);
    return updatedCredential;
  }

  async deleteVaultCredential(id: string): Promise<boolean> {
    return this.vaultCredentials.delete(id);
  }

  async getVaultSetting(): Promise<VaultSetting | undefined> {
    return this.vaultSetting;
  }

  async createVaultSetting(insertSetting: InsertVaultSetting): Promise<VaultSetting> {
    const id = randomUUID();
    const setting: VaultSetting = { ...insertSetting, id };
    this.vaultSetting = setting;
    return setting;
  }

  async updateVaultSetting(id: string, updates: Partial<InsertVaultSetting>): Promise<VaultSetting | undefined> {
    if (!this.vaultSetting || this.vaultSetting.id !== id) {
      return undefined;
    }
    this.vaultSetting = { ...this.vaultSetting, ...updates };
    return this.vaultSetting;
  }
}

export const storage = new MemStorage();
