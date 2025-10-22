# CoWorking Space Management System - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Productivity-Focused)

**Primary References:** Linear, Notion, Material Design

**Justification:** This is a utility-focused business application requiring efficient data management, clear workflows, and professional aesthetics. The design prioritizes usability, information density, and task completion over visual flair.

**Core Design Principles:**
- Clarity and efficiency in data presentation
- Consistent, predictable interactions
- Professional, trustworthy appearance
- Role-appropriate information architecture
- Minimal cognitive load for frequent tasks

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary:**
- Background: 222 10% 10% (deep charcoal)
- Surface: 222 10% 15% (elevated panels)
- Surface Elevated: 222 10% 18% (cards, modals)
- Border: 222 10% 25% (subtle separators)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%

**Light Mode Primary:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 220 13% 91%
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%

**Brand/Accent:**
- Primary: 262 83% 58% (vibrant purple - CTA buttons, active states)
- Primary Hover: 262 83% 52%
- Success: 142 71% 45% (completed bookings, paid status)
- Warning: 38 92% 50% (pending payments)
- Danger: 0 84% 60% (cancellations, deletions)
- Info: 217 91% 60% (informational badges)

**Semantic Colors:**
- Available Space: 142 71% 45%
- Occupied Space: 0 84% 60%
- Reserved: 38 92% 50%

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - body, UI elements
- Monospace: 'JetBrains Mono' (Google Fonts) - booking IDs, timestamps, codes

**Type Scale:**
- Display: text-4xl font-bold (dashboard headers)
- H1: text-3xl font-semibold (page titles)
- H2: text-2xl font-semibold (section headers)
- H3: text-xl font-semibold (card titles)
- H4: text-lg font-medium (form labels, table headers)
- Body: text-base (main content)
- Small: text-sm (secondary info, captions)
- XSmall: text-xs (badges, timestamps)

**Font Weights:**
- Regular (400): body text
- Medium (500): emphasized text, labels
- Semibold (600): headings, active nav
- Bold (700): display text, statistics

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 1, 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-1 (within components)
- Standard spacing: p-4, gap-4 (between related elements)
- Section spacing: p-8, gap-8 (major sections)
- Page margins: p-12, p-16 (outer containers)

**Grid System:**
- Sidebar: 64px (collapsed) / 240px (expanded)
- Main content: max-w-7xl mx-auto
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Tables: full-width with horizontal scroll on mobile

**Breakpoints (Tailwind defaults):**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### D. Component Library

**Navigation:**
- Sidebar: Collapsible vertical nav with icons and labels
- Top bar: User profile, notifications, search, role indicator
- Breadcrumbs: Show current location in hierarchy
- Active state: Left border accent + bold text + background highlight

**Dashboard Components:**
- Stat Cards: Large number + label + trend indicator (↑↓) + comparison text
- Quick Actions: Icon buttons grid (4-6 common tasks)
- Activity Feed: Timeline-style list with timestamps and user avatars
- Occupancy Chart: Visual bar chart showing space utilization
- Revenue Summary: Line/bar chart with time period selector

**Data Tables:**
- Header: Sticky with sort indicators, filters
- Row actions: Hover to reveal edit/delete/view icons on right
- Pagination: Bottom-aligned with page size selector
- Empty state: Centered icon + message + CTA
- Loading: Skeleton rows matching table structure
- Row selection: Checkbox on left, selected row highlight

**Forms:**
- Field groups: Vertical stack with 4-6 gap
- Labels: Above inputs, text-sm font-medium
- Inputs: h-10, px-4, rounded-md border
- Required indicator: Red asterisk
- Validation: Inline error messages below fields in red
- Submit actions: Right-aligned with primary/secondary buttons
- Multi-step forms: Progress indicator at top

**Modals:**
- Overlay: backdrop-blur-sm bg-black/50
- Container: Centered, max-w-2xl, rounded-lg shadow-2xl
- Header: Title + close button
- Body: p-6 with scroll if needed
- Footer: Actions right-aligned

**Booking Calendar:**
- Week/month view with grid layout
- Time slots: Vertical rows, spaces as columns
- Booking blocks: Colored rectangles with member name + time
- Interactive: Click slot to create booking
- Legend: Color coding for booking status

**Status Badges:**
- Pill-shaped, px-3 py-1, text-xs font-medium, rounded-full
- Available: green background with green text
- Occupied: red background with red text
- Reserved: yellow background with yellow text
- Paid: green outline
- Pending: yellow outline
- Overdue: red outline

**Buttons:**
- Primary: bg-primary text-white h-10 px-6 rounded-md font-medium
- Secondary: bg-surface border text-foreground
- Danger: bg-danger text-white
- Ghost: Transparent with hover background
- Icon-only: Square with centered icon

**Search & Filters:**
- Search bar: Leading icon, placeholder, w-full max-w-md
- Filter chips: Removable tags showing active filters
- Advanced filters: Dropdown panel with multiple criteria
- Clear all: Text button to reset

### E. Animations

**Minimal Motion Philosophy:**
- Use animations only for feedback and state changes
- Duration: 150-200ms for micro-interactions
- Easing: ease-in-out for smooth transitions

**Approved Animations:**
- Button hover: Slight background darkening (no transform)
- Modal open/close: Fade + scale (0.95 to 1)
- Dropdown: Slide down with fade
- Toast notifications: Slide in from top-right
- Loading states: Skeleton shimmer effect
- Page transitions: Fade between routes

**Explicitly Avoid:**
- Parallax effects
- Continuous animations
- Hover lift/float effects
- Confetti or celebratory animations
- Auto-playing carousels

---

## Application-Specific Layouts

### Login Page
- Centered card (max-w-md) on neutral background
- Logo at top
- Form: Username, password, remember me checkbox
- Primary login button (full-width)
- Minimal decorative elements

### Admin Dashboard
- Three-column stat cards: Total Revenue, Active Bookings, Members
- Two-column layout below: Occupancy Chart (left) + Activity Feed (right)
- Quick actions toolbar with icon buttons (Add Member, New Booking, etc.)

### Staff Dashboard
- Simplified two-column stats: Today's Bookings, Pending Payments
- Calendar view showing today's schedule
- Quick booking form

### Member Management
- Table view with columns: Name, Email, Phone, Membership Type, Status, Actions
- Top bar: Search + Add Member button + Filter dropdown
- Row actions: View, Edit, Deactivate

### Booking Management
- Calendar as primary view
- Sidebar with booking details on selection
- Toggle between week/month view
- Color-coded by space type
- Filter by member, space, date range

### Space Management
- Card grid showing each space
- Each card: Space name, type, capacity, hourly/daily rate, current status
- Quick toggle for available/occupied
- Modal for edit with form

### Payment Management
- Table: Booking ID, Member, Amount, Date, Status, Actions
- Summary cards at top: Total Collected, Pending, Overdue
- Export to CSV button
- Mark as paid action

### Reports Page
- Date range selector at top
- Tabs: Revenue, Bookings, Occupancy, Members
- Charts with export/print options
- Data table below chart for details

---

## Images

**No hero images** - This is a business application, not a marketing site.

**Icons Only:**
- Use Heroicons (outline style) throughout
- Dashboard: chart-bar, users, calendar, currency-dollar icons
- Navigation: home, users-group, building-office, document-text
- Actions: pencil, trash, eye, plus-circle, check-circle

**User Avatars:**
- Circular, 32px or 40px
- Display initials if no photo
- Use in activity feed, user menu, member lists

**Empty States:**
- Simple line illustrations (via Heroicons or similar)
- Centered with descriptive text
- Used when tables/lists have no data

---

This design system ensures the CoWorking Space Management System is professional, efficient, and scalable while maintaining excellent usability for Admin and Staff roles.