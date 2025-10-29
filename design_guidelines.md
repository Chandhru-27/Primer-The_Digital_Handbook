# Personal User Handbook - Design Guidelines

## Design Approach
**Design System Foundation:** Apple HIG + Linear Design Principles
This productivity-focused application combines Apple's minimalist elegance with Linear's purposeful clarity. The interface prioritizes content clarity, smooth interactions, and efficient workflows.

## Core Design Elements

### Typography System
**Primary Font:** Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- Small text: 400 weight

**Hierarchy:**
- Page titles: text-3xl (desktop) / text-2xl (mobile)
- Section headers: text-xl / text-lg
- Card titles: text-lg / text-base
- Body text: text-base / text-sm
- Labels/captions: text-sm / text-xs

### Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 (cards), p-4 (compact elements)
- Section spacing: space-y-8 (desktop) / space-y-6 (mobile)
- Page containers: px-6 py-8 (mobile), px-8 py-12 (desktop)
- Grid gaps: gap-6 (desktop) / gap-4 (mobile)

**Container Strategy:**
- Max-width: max-w-7xl for main content area
- Cards: max-w-md to max-w-2xl depending on content density
- Form inputs: max-w-lg for optimal readability

## Navigation Architecture

### Sidebar (Desktop)
- Fixed left sidebar (w-64)
- Logo/avatar at top with user name
- Vertical navigation links with icons
- Active state: subtle background with left border accent
- Sticky positioning for persistent access

### Mobile Navigation
- Bottom tab bar (h-16) with 4 main sections
- Icons with labels below
- Active state indicated by accent underline
- Hide on scroll down, reveal on scroll up

## Page-Specific Guidelines

### Home/Dashboard Page
**Layout:** 2-column grid on desktop, single column on mobile

**Hero Section:**
- Profile picture (rounded-full, w-24 h-24 with subtle ring)
- Welcome message with user name (text-3xl font-semibold)
- Quick stats cards showing activity overview
- No background image - use subtle gradient overlay

**Quick Actions Grid:**
- 3-column grid on desktop (grid-cols-3)
- Single column on mobile
- Each action card: icon + title + brief description
- Hover state: subtle lift (translate-y-1) with shadow increase

### Profile Page
**Structure:** Single column, card-based layout

**Information Cards:**
- Basic Info Card: 2-column grid (labels left, values right) on desktop
- In-Depth Handbook Card: Full-width sections for biography, hobbies, skills, goals
- Each field has edit icon on hover (desktop) or always visible (mobile)

**Edit Mode:**
- Inline editing with input fields replacing text
- Save/Cancel buttons appear at card bottom
- Subtle highlight indicating editable state

### Social Links Page
**Layout:** Masonry-style grid

**Grid Configuration:**
- Desktop: grid-cols-3
- Tablet: grid-cols-2
- Mobile: grid-cols-1

**Link Cards:**
- Platform icon (w-12 h-12) in brand colors
- Username/handle below icon
- External link indicator
- Hover: scale-105 transform with shadow lift

**Add Link Modal:**
- Centered modal (max-w-md)
- Dropdown for platform selection with icon preview
- Input fields for username/URL
- Validation messaging inline below inputs

### Vault Page
**Theme:** Darker, security-focused aesthetic

**PIN Lock Screen:**
- Centered lock icon (w-16 h-16)
- 4-digit PIN input with individual boxes
- Numeric keypad below (3x4 grid on mobile)
- Security message: "Enter PIN to unlock vault"

**Credential List (Post-unlock):**
- Table layout on desktop, card stack on mobile
- Each row/card: site favicon + name + masked password + actions
- Show/hide toggle per password (eye icon)
- Quick copy button for credentials

**Add/Edit Credential Modal:**
- Site name with optional favicon URL
- Username field
- Password field with strength indicator
- Generate password button
- Tags/categories selector

## Component Library

### Card Component
- Background: subtle elevated surface
- Border radius: rounded-2xl
- Padding: p-6
- Shadow: shadow-sm with hover:shadow-md
- Border: 1px subtle outline

### Button Component
**Primary:**
- Rounded-lg, px-6 py-3
- Bold text (font-semibold)
- Hover: slight brightness increase + shadow
- Active: scale-98 with deeper shadow

**Secondary:**
- Outlined style with transparent background
- Border: 2px solid
- Hover: filled background with border color

**Destructive:**
- Reserved for delete actions
- Clear visual differentiation

### Input Component
- Border radius: rounded-lg
- Padding: px-4 py-3
- Border: 2px solid neutral
- Focus: ring-2 ring-offset-2 with accent
- Label above input with text-sm

### Modal Component
- Backdrop: backdrop-blur-sm with semi-transparent overlay
- Container: rounded-2xl, max-w-lg, shadow-2xl
- Header: text-xl font-semibold with close button (top-right)
- Body: p-6 with scrollable content
- Footer: action buttons aligned right

### ProtectedInput (Vault)
- Password field with toggle visibility icon
- Monospace font when revealed
- Copy button appears on hover
- Strength indicator bar below input

## Visual Effects

### Glassmorphism Treatment
Apply to dashboard hero section and vault cards:
- backdrop-blur-md
- Semi-transparent background
- Subtle border with slight opacity
- Shadow layering for depth

### Transitions
- Duration: 200ms for micro-interactions, 300ms for modals
- Easing: ease-in-out for natural feel
- Properties: transform, opacity, shadow

### Hover States
- Cards: translate-y-1 + shadow-lg
- Buttons: brightness-110
- Links: underline + slight color shift
- Icons: scale-110

## Responsive Breakpoints
- Mobile: base (< 768px)
- Tablet: md (768px - 1024px)
- Desktop: lg (> 1024px)

**Mobile-First Approach:**
- Stack all grid layouts vertically
- Full-width cards with reduced padding
- Bottom navigation replaces sidebar
- Simplified header with hamburger menu

## Form Validation & Feedback
- Inline validation messages (text-sm below inputs)
- Success states: green accent with checkmark
- Error states: red accent with error icon
- Loading states: skeleton loaders for data fetching

## Images
**Profile Pictures:**
- User avatar on dashboard (large, rounded-full)
- Smaller avatar in sidebar/navbar
- Upload flow with crop functionality
- Fallback: initials on gradient background

**Social Platform Icons:**
- Use Font Awesome or Heroicons via CDN
- Platform brand colors for recognition
- Consistent sizing (w-8 h-8 for list, w-12 h-12 for cards)

**Vault Security Visual:**
- Lock icon illustration on PIN screen
- Subtle shield/security badge elements
- No hero image - focus on functional security UI

This design system creates a cohesive, professional personal productivity application that feels polished and purposeful while maintaining excellent usability across all devices.