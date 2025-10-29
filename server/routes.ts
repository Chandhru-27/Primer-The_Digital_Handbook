import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProfileSchema,
  insertSocialLinkSchema,
  insertVaultCredentialSchema,
  insertVaultSettingSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(id, validatedData);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/social-links", async (req, res) => {
    try {
      const links = await storage.getSocialLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/social-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const link = await storage.getSocialLink(id);
      if (!link) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/social-links", async (req, res) => {
    try {
      const validatedData = insertSocialLinkSchema.parse(req.body);
      const link = await storage.createSocialLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/social-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSocialLinkSchema.partial().parse(req.body);
      const link = await storage.updateSocialLink(id, validatedData);
      if (!link) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/social-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSocialLink(id);
      if (!deleted) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/vault/credentials", async (req, res) => {
    try {
      const credentials = await storage.getVaultCredentials();
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/vault/credentials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const credential = await storage.getVaultCredential(id);
      if (!credential) {
        return res.status(404).json({ message: "Credential not found" });
      }
      res.json(credential);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/vault/credentials", async (req, res) => {
    try {
      const validatedData = insertVaultCredentialSchema.parse(req.body);
      const credential = await storage.createVaultCredential(validatedData);
      res.status(201).json(credential);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/vault/credentials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertVaultCredentialSchema.partial().parse(req.body);
      const credential = await storage.updateVaultCredential(id, validatedData);
      if (!credential) {
        return res.status(404).json({ message: "Credential not found" });
      }
      res.json(credential);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/vault/credentials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteVaultCredential(id);
      if (!deleted) {
        return res.status(404).json({ message: "Credential not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/vault/setting", async (req, res) => {
    try {
      const setting = await storage.getVaultSetting();
      if (!setting) {
        return res.status(404).json({ message: "Vault setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/vault/setting", async (req, res) => {
    try {
      const validatedData = insertVaultSettingSchema.parse(req.body);
      const setting = await storage.createVaultSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/vault/setting/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertVaultSettingSchema.partial().parse(req.body);
      const setting = await storage.updateVaultSetting(id, validatedData);
      if (!setting) {
        return res.status(404).json({ message: "Vault setting not found" });
      }
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/vault/verify-pin", async (req, res) => {
    try {
      const { pin } = req.body;
      const setting = await storage.getVaultSetting();
      if (!setting) {
        return res.status(404).json({ message: "Vault setting not found" });
      }
      const isValid = setting.pin === pin;
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
