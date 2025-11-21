# School Scheduling Application

## Overview

This is a school timetable management system designed to help schools efficiently manage teacher availability and generate optimized class schedules. The application allows administrators to:

- Manage teachers, classes, and subjects
- Track teacher availability across weekly time slots
- Create and visualize timetables for all classes
- Detect and resolve scheduling conflicts
- Generate automated timetables based on constraints

The system is built as a full-stack web application with a data-heavy, productivity-focused interface optimized for efficient schedule management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with the following main routes:
- Dashboard (`/`) - Overview statistics and conflict monitoring
- Teachers (`/teachers`) - Teacher management and availability editing
- Classes (`/classes`) - Class/grade management
- Subjects (`/subjects`) - Subject catalog management
- Timetables (`/timetables`) - Schedule visualization and generation

**UI Component System**: shadcn/ui components based on Radix UI primitives with Tailwind CSS styling
- Material Design-inspired approach optimized for data-dense interfaces
- Custom theme using CSS variables for consistent color system
- Inter font family for optimal readability in data-heavy views

**State Management**: TanStack Query (React Query) for server state management
- Centralized API request handling through `queryClient`
- Automatic cache invalidation on mutations
- Optimistic UI updates for better user experience

**Form Handling**: React Hook Form with Zod schema validation
- Type-safe form validation using Drizzle-Zod generated schemas
- Consistent error handling and user feedback

### Backend Architecture

**Runtime**: Node.js with Express framework

**API Design**: RESTful JSON API with the following resource endpoints:
- `/api/teachers` - Teacher CRUD operations
- `/api/classes` - Class CRUD operations
- `/api/subjects` - Subject CRUD operations
- `/api/availability` - Teacher availability management
- `/api/timetable` - Timetable entry management
- `/api/timetable/generate` - Automated schedule generation
- `/api/conflicts` - Conflict detection and reporting

**Development Setup**: Vite middleware for HMR in development, static file serving in production

**Storage Layer**: Interface-based storage abstraction (`IStorage` in `server/storage.ts`)
- Currently implemented with in-memory storage for development
- Designed to be swapped with PostgreSQL implementation via Drizzle ORM
- All database operations return Promises for async compatibility

### Data Architecture

**Schema Definition**: Shared TypeScript types and Zod schemas (`shared/schema.ts`)

**Core Entities**:
- **Teachers**: Name, email, array of subject IDs they can teach
- **Classes**: Name, grade level, student count
- **Subjects**: Name and color code for visual identification
- **Availability**: Teacher ID, day (Monday-Friday), period (8 time slots), available flag
- **Timetable Entries**: Links class, teacher, subject for specific day/period
- **Conflicts**: Detected scheduling issues (teacher double-booking, etc.)

**Time Structure**:
- 5-day week (Monday through Friday)
- 8 fixed time periods (8:00-16:00 in 1-hour blocks)
- Represented as string constants for type safety

**ORM**: Drizzle ORM configured for PostgreSQL
- Schema defined using Drizzle's table definitions
- Zod schemas auto-generated from Drizzle schema for validation
- Migration files output to `./migrations` directory

### Design System

**Visual Design**: Material Design principles adapted for productivity tools
- Focus on information density and clear hierarchy
- Color-coded subjects for quick visual scanning
- Conflict indicators using red borders and warning icons

**Layout Structure**:
- Fixed left sidebar (16rem width) with main navigation
- Collapsible sidebar for mobile responsiveness
- Max-width content area (7xl) with responsive padding
- Grid-based dashboard with stat cards and conflict panels

**Interactive Components**:
- Drag-to-select availability grid for efficient time slot editing
- Inline timetable editing with modal dialogs
- Real-time conflict detection with visual feedback
- Toast notifications for action confirmations

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Serverless PostgreSQL database (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe ORM and query builder
- **Drizzle Kit**: Database migration management tool

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
  - Dialog, Dropdown, Popover, Select, Checkbox, and 20+ other components
- **shadcn/ui**: Pre-built component implementations using Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Form & Validation
- **React Hook Form**: Performant form state management
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Bridge between React Hook Form and Zod

### State Management
- **TanStack Query**: Server state synchronization and caching
- **Wouter**: Lightweight client-side routing

### Development Tools
- **Vite**: Fast build tool and dev server with HMR
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

### Additional Utilities
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: CSS class variant management
- **clsx & tailwind-merge**: Conditional CSS class utilities
- **nanoid**: Unique ID generation