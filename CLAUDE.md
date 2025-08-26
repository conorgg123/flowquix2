# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (starts Vite dev server on http://localhost:5173)
- **Backend server**: `npm run server` (starts Express server on http://localhost:3000)
- **Build**: `npm run build` (builds for production)
- **Lint**: `npm run lint` (runs ESLint)
- **Preview**: `npm run preview` (preview production build)

## Project Architecture

PulseHub is a full-stack React TypeScript application with the following key architectural components:

### Frontend Structure
- **Framework**: React 18.3.1 with TypeScript 5.5.3, bundled with Vite
- **State Management**: Zustand for global state, React Context for authentication
- **Styling**: TailwindCSS with theme support via `next-themes`
- **Routing**: React Router DOM with protected routes
- **Real-time**: Socket.IO client for chat and collaboration features

### Component Organization
```
src/components/
├── achievements/    # Achievement and gamification system
├── analytics/      # Data visualization and metrics dashboards
├── assets/         # Digital asset management
├── auth/          # Login/Register components
├── calendar/      # Calendar and scheduling
├── chat/          # Real-time messaging
├── files/         # File management and storage
├── kanban/        # Drag-and-drop task boards
├── notifications/ # Notification system
├── projects/      # Project management
├── settings/      # User preferences and configuration
├── support/       # Help and support pages
├── tasks/         # Task management and comments
├── team/          # Team collaboration features
└── time/          # Time tracking
```

### Backend Architecture
- **Server**: Express.js with Socket.IO for WebSocket support
- **Database**: Supabase (PostgreSQL) with comprehensive migrations
- **Authentication**: Supabase Auth with JWT middleware
- **Real-time**: Socket.IO for chat rooms and live collaboration
- **File Storage**: Supabase Storage with access controls

### Key Libraries and Integrations
- **@dnd-kit**: Drag-and-drop functionality for Kanban boards
- **@tiptap**: Rich text editing for comments and descriptions
- **react-big-calendar**: Calendar component for scheduling
- **vis-network**: Network visualization for project dependencies
- **yjs + y-webrtc**: Real-time collaborative editing
- **rrule**: Recurring task patterns
- **socket.io**: WebSocket communication

### Database Schema
The application uses a comprehensive PostgreSQL schema including:
- User management and profiles
- Project and task hierarchies
- Time tracking and analytics
- File metadata and permissions
- Chat rooms and messages
- Achievement and notification systems

### Development Workflow
1. Frontend development uses Vite proxy to connect to Express server on port 3000
2. Supabase handles database operations and authentication
3. Socket.IO manages real-time features like chat and live updates
4. ESLint configuration includes React Hooks and TypeScript rules

### Authentication Flow
- Uses Supabase Auth with email/password
- AuthContext provides user state throughout the app
- Protected routes redirect unauthenticated users to login
- JWT middleware protects API endpoints

### Key Technical Considerations
- The app supports both light and dark themes
- Real-time collaboration uses Yjs for conflict-free operations
- File uploads are handled through Supabase Storage
- The Kanban system supports custom columns and drag-and-drop
- Time tracking integrates with project and task management
- Achievement system gamifies user engagement