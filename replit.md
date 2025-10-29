# User Handbook - Personal Digital Companion

## Overview
A modern, responsive personal handbook system built with React, TypeScript, and TailwindCSS. This application allows users to manage their profile information, social media links, and secure credentials in one beautiful, unified interface.

## Recent Changes
- **October 29, 2025**: Initial implementation of all core features
  - Complete schema design for Profile, Social Links, and Vault
  - Dashboard with glassmorphism hero section and quick action cards
  - Profile page with editable basic info and personal handbook sections
  - Social Links page with CRUD operations and responsive grid layout
  - Vault page with PIN protection and password management
  - Sidebar navigation with theme toggle
  - Full dark mode support

## Project Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: TailwindCSS 4 with custom design tokens
- **UI Components**: Shadcn UI component library
- **State Management**: React Query for server state, React hooks for local state
- **Icons**: Lucide React for UI icons, React Icons for brand logos
- **Backend**: Express.js with in-memory storage

### Key Features
1. **Dashboard**
   - Welcome hero section with user avatar and stats
   - Quick action cards for navigation
   - Recent activity feed

2. **Profile Management**
   - Basic information (name, email, phone, age, gender, address)
   - Personal handbook (biography, hobbies, skills, goals, notes)
   - Inline editing with save/cancel actions
   - Avatar with upload placeholder

3. **Social Links**
   - Add, edit, and delete social media profiles
   - Support for GitHub, LinkedIn, Twitter, Instagram, Facebook, YouTube
   - Platform-specific icons and colors
   - Responsive grid layout (3 cols desktop, 2 cols tablet, 1 col mobile)
   - External link functionality

4. **Secure Vault**
   - PIN-protected access (demo PIN: 1234)
   - Password credential management
   - Show/hide password toggle
   - Copy to clipboard functionality
   - CRUD operations for credentials
   - Lock/unlock vault functionality

5. **Theme Support**
   - Light and dark mode toggle
   - Persistent theme preference in localStorage
   - Seamless theme switching

### Data Models
- **Profile**: User personal information and handbook details
- **Social Links**: Platform, username, URL, icon
- **Vault Credentials**: Site name, username, password, URL, notes
- **Vault Settings**: PIN code for vault access

### Design System
- **Color Palette**: Muted blue accents, neutral grays, soft backgrounds
- **Typography**: Inter font family (400, 500, 600, 700 weights)
- **Spacing**: Consistent 6-8px base unit system
- **Border Radius**: Rounded-2xl (16px) for cards, rounded-lg for inputs
- **Shadows**: Subtle elevation system with hover states
- **Glassmorphism**: Applied to dashboard hero section
- **Interactions**: Smooth transitions (200-300ms), hover elevations

### File Structure
```
client/
  src/
    components/
      ui/                    # Shadcn UI components
      app-sidebar.tsx        # Main navigation sidebar
      theme-provider.tsx     # Theme context provider
      theme-toggle.tsx       # Dark/light mode toggle
    pages/
      dashboard.tsx          # Home page with overview
      profile.tsx            # Profile management
      social-links.tsx       # Social media links
      vault.tsx              # Password manager with PIN
      not-found.tsx          # 404 page
    App.tsx                  # Main app with routing
    index.css               # Global styles and Tailwind

shared/
  schema.ts                 # TypeScript types and Zod schemas

server/
  storage.ts                # In-memory storage interface
  routes.ts                 # API endpoints (to be implemented)
```

### User Preferences
- **Design Philosophy**: Clean, modern, minimalistic (Apple/Notion/Linear inspired)
- **Layout**: Sidebar navigation on desktop, responsive on mobile
- **Interactions**: Subtle animations, smooth transitions
- **Security**: PIN protection for sensitive data

### Current State
- ✅ Frontend UI complete with all pages
- ✅ Component library fully implemented
- ✅ Routing and navigation working
- ✅ Theme system with dark mode
- ✅ Responsive design across all breakpoints
- ⏳ Backend API endpoints (pending)
- ⏳ Data persistence (pending)
- ⏳ API integration (pending)

### Next Steps
1. Implement backend API routes for all CRUD operations
2. Connect frontend to backend with React Query
3. Add loading and error states
4. Test all user flows
5. Polish and optimize

### Notes
- Demo PIN for vault: 1234
- All data currently uses mock/dummy values
- Focus on exceptional visual quality and user experience
- Mobile-first responsive design approach
