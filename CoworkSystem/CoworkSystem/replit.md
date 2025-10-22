# CoWorking Space Management System

## Overview

A comprehensive web-based management system for coworking spaces that handles member registration, space booking, payment tracking, and administrative reporting. The application streamlines coworking space operations by automating booking management, tracking payments, and providing role-based access control for administrators and staff members.

The system is designed as a productivity-focused business application with clean, efficient interfaces for managing day-to-day operations of a coworking space facility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI Components:** shadcn/ui component library built on Radix UI primitives
- Provides accessible, customizable components following the "New York" style variant
- Implements a consistent design system with dark/light mode support
- Uses Tailwind CSS for styling with custom theme variables

**State Management:** 
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- No global state management library (Redux, Zustand) - relies on server state synchronization

**Routing:** Wouter for client-side routing (lightweight alternative to React Router)

**Design Philosophy:**
- Productivity-focused design inspired by Linear and Notion
- Professional, trustworthy appearance with minimal cognitive load
- Information-dense layouts suitable for business operations
- Consistent color palette for semantic states (available, occupied, reserved spaces)

### Backend Architecture

**Runtime:** Node.js with Express.js web framework

**Language:** TypeScript with ES modules

**API Pattern:** RESTful API endpoints under `/api` namespace
- Endpoint groups: `/api/auth`, `/api/members`, `/api/spaces`, `/api/bookings`, `/api/payments`
- JSON request/response format
- Activity logging for audit trail

**Authentication & Authorization:**
- Replit OpenID Connect (OIDC) authentication
- Session-based authentication using express-session
- Role-based access control (Admin and Staff roles)
- Admin-only routes protected with middleware
- Sessions stored in PostgreSQL via connect-pg-simple

**ORM:** Drizzle ORM for type-safe database interactions
- Schema-first approach with TypeScript definitions
- Zod integration for runtime validation via drizzle-zod
- Shared schema between client and server for type consistency

### Database Design

**Database:** PostgreSQL (via Neon serverless driver)

**Core Tables:**
- `users` - Authentication and user management with role-based access (admin/staff)
- `members` - Coworking space members with membership types and contact information
- `spaces` - Rentable spaces (rooms, desks, meeting areas) with capacity and pricing
- `bookings` - Space reservations with time slots and status tracking
- `payments` - Payment records linked to bookings with status tracking
- `activity_logs` - Audit trail of system actions
- `sessions` - Session storage for authentication

**Data Integrity:**
- Booking conflict detection to prevent double-booking
- Foreign key relationships between bookings, members, spaces, and payments
- Status enums for consistent state management (e.g., booking status: pending/confirmed/cancelled)

### Key Architectural Decisions

**Monorepo Structure:**
- Single repository with client, server, and shared code
- `/client` - React frontend
- `/server` - Express backend
- `/shared` - Shared TypeScript types and schemas
- Enables code reuse and type safety across full stack

**Type Safety:**
- End-to-end TypeScript for compile-time safety
- Shared schema definitions ensure client-server contract
- Zod schemas for runtime validation of API inputs
- Drizzle ORM provides type-safe database queries

**Development vs Production:**
- Vite dev server with HMR for development
- Express serves compiled static assets in production
- Middleware mode integration between Vite and Express

**Session Management:**
- PostgreSQL-backed sessions for scalability
- 7-day session lifetime with automatic cleanup
- HTTP-only, secure cookies for security

**Error Handling:**
- Centralized error responses with appropriate HTTP status codes
- Activity logging for administrative audit
- User-friendly toast notifications on the frontend

## External Dependencies

### Third-Party Services

**Replit Authentication:**
- OpenID Connect (OIDC) provider for user authentication
- Handles user identity, profile information, and session management
- Required environment variables: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`

**Neon Database:**
- Serverless PostgreSQL database hosting
- WebSocket-based connection pooling
- Required environment variable: `DATABASE_URL`

### Major NPM Dependencies

**Frontend:**
- `react` & `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Client-side routing
- `@radix-ui/*` - Headless UI component primitives
- `tailwindcss` - Utility-first CSS framework
- `zod` - Schema validation
- `react-hook-form` - Form state management
- `date-fns` - Date manipulation

**Backend:**
- `express` - Web server framework
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` - PostgreSQL client
- `passport` & `openid-client` - Authentication
- `express-session` - Session middleware
- `connect-pg-simple` - PostgreSQL session store

**Development:**
- `vite` - Build tool and dev server
- `typescript` - Type system
- `tsx` - TypeScript execution for development
- `esbuild` - Production bundler for server code
- `drizzle-kit` - Database schema migrations

### Build and Deployment

**Build Process:**
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild bundles server code to `dist/index.js`
3. Production serves static files from Express

**Environment Requirements:**
- Node.js with ES module support
- PostgreSQL database (provisioned via Neon)
- Replit environment for authentication (or compatible OIDC provider)