# KIT Tinker Lab Management System

## Overview

This is a comprehensive web application for managing the KIT Engineering College Tinker Lab. The system facilitates equipment reservations, inventory tracking, user management, and administrative workflows for lab operations. Built for a hackathon challenge, it provides a complete solution for modern lab management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket support for live updates
- **API Design**: RESTful endpoints with proper error handling

### Database Layer
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-backed sessions table
- **Role-based Access**: Student, Faculty, Tech Secretary, Admin roles
- **Security**: HTTPS enforcement, secure cookies, CSRF protection

### Equipment Management
- **Categories**: Mechanical, Electronics, Testing, Printing, Machining
- **Status Tracking**: Available, In Use, Maintenance, Out of Order
- **Metadata**: Location, specifications, images, maintenance history
- **Search & Filter**: Real-time equipment discovery

### Reservation System
- **Multi-level Approval**: Configurable approval workflows
- **Email Notifications**: Automated alerts for stakeholders
- **Conflict Prevention**: Real-time availability checking
- **Usage Tracking**: Check-in/out logging with user attribution

### User Management
- **Profile Management**: User details, roles, permissions
- **Training Records**: Safety certifications and requirements
- **Activity Logging**: Comprehensive audit trails
- **Permission System**: Granular access control

## Data Flow

### Equipment Reservation Flow
1. Student searches and selects equipment
2. Reservation form captures purpose, duration, and requirements
3. System validates availability and conflicts
4. Email notifications sent to approval chain
5. Authorized personnel approve/reject via dashboard
6. Confirmation sent to requester
7. Check-in/out process tracked in usage logs

### Real-time Updates
- WebSocket connections for live status updates
- Equipment availability changes broadcast immediately
- Notification system for urgent alerts
- Dashboard metrics refresh automatically

### Authentication Flow
1. User redirects to Replit OAuth
2. Successful authentication creates/updates user record
3. Session established with role-based permissions
4. Protected routes enforce authorization checks
5. API endpoints validate user roles and permissions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **express**: Web server framework
- **passport**: Authentication middleware

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundling

### Third-party Services
- **Replit Auth**: OAuth authentication provider
- **Neon**: Serverless PostgreSQL hosting
- **WebSocket**: Real-time communication

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Local PostgreSQL or Neon development instance
- **Environment Variables**: Local .env file configuration
- **Debug Tools**: Replit development banner and error overlays

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: ESBuild compilation to ES modules
- **Database**: Production Neon PostgreSQL instance
- **Process Management**: Node.js application server

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPLIT_DOMAINS**: Allowed authentication domains
- **NODE_ENV**: Environment mode (development/production)

### Security Considerations
- HTTPS-only cookies in production
- Secure session configuration
- Input validation and sanitization
- Role-based access control enforcement
- SQL injection prevention via ORM

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```