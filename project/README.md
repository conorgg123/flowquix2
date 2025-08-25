# PulseHub - Modern Team Collaboration Platform

PulseHub is a comprehensive team collaboration platform built with React, TypeScript, and Supabase, designed to streamline team workflows and boost productivity.

## Features

### 🎯 Task Management
- Drag-and-drop Kanban board with custom columns
- Task dependencies and recurring tasks
- Priority scoring and AI-powered suggestions
- Voice input support for task creation
- Progress tracking and time estimation

### 👥 Team Collaboration
- Real-time chat with threaded discussions
- File sharing and version control
- Project workspaces with role-based access
- Team member achievements and gamification
- Integrated calendar for scheduling

### 📊 Analytics & Insights
- Project progress dashboards
- Time tracking analytics
- Team performance metrics
- AI-powered workflow suggestions
- Custom report generation

### 🔒 Security & Administration
- Role-based access control (RBAC)
- Audit logging for all actions
- Two-factor authentication support
- Granular permission settings
- Data backup and recovery

## Technology Stack

### Frontend
- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.2
- TailwindCSS 3.4.1
- Lucide React (icons)
- React Router DOM 6.22.3
- DND Kit (drag-and-drop)
- Socket.IO Client (real-time features)
- Zustand (state management)

### Backend
- Supabase (PostgreSQL database)
- Node.js/Express server
- Socket.IO (WebSocket server)
- JWT authentication
- Supabase Storage (file storage)

### Development Tools
- ESLint 9.9.1
- PostCSS 8.4.35
- Autoprefixer 10.4.18

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── achievements/    # Achievement system
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── assets/         # Digital asset management
│   │   ├── calendar/       # Calendar integration
│   │   ├── chat/          # Real-time chat
│   │   ├── files/         # File management
│   │   ├── kanban/        # Kanban board
│   │   ├── notifications/ # Notification system
│   │   ├── projects/      # Project management
│   │   ├── settings/      # User settings
│   │   ├── tasks/         # Task management
│   │   ├── team/          # Team management
│   │   └── time/          # Time tracking
│   ├── lib/               # Utility functions
│   └── main.tsx          # Application entry
├── server/               # Express server
│   ├── routes/          # API routes
│   └── middleware/      # Server middleware
├── supabase/            # Database migrations
└── public/              # Static assets
```

## Database Schema

The application uses a comprehensive PostgreSQL database with the following key tables:

- `users`: User accounts and profiles
- `projects`: Project management
- `tasks`: Task tracking and management
- `time_entries`: Time tracking records
- `files`: File metadata storage
- `chat_rooms`: Team chat functionality
- `achievements`: User achievements
- `notifications`: System notifications

## Features in Detail

### Task Management
- Custom Kanban board columns with WIP limits
- Task dependencies and blocking relationships
- Recurring task patterns using RRule
- AI-powered task prioritization
- Voice transcription for task creation
- Progress tracking and burndown charts

### File Management
- Hierarchical folder structure
- File versioning and history
- Access control per project
- Preview generation for media files
- Bulk operations support

### Team Communication
- Real-time chat with rooms
- Thread support for discussions
- File sharing in conversations
- @mentions and notifications
- Chat search and history

### Time Tracking
- Automatic time tracking
- Manual time entry
- Project-based tracking
- Reports and analytics
- Billable hours calculation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Start the Express server:
   ```bash
   npm run server
   ```

## Deployment

The application can be deployed to Netlify for the frontend, with the following considerations:

- Frontend is built using `npm run build`
- Express server should be deployed to a Node.js hosting service
- Supabase provides the database and authentication
- Environment variables must be configured on the hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Pricing

### Starter Plan ($20/month)
- Up to 5 users
- Basic task management
- File storage (5GB)
- Team chat
- Mobile access

### Professional Plan ($50/month)
- Up to 25 users
- Advanced task management
- Unlimited file storage
- Time tracking
- Analytics dashboard
- Priority support

### Enterprise Plan ($150/month)
- Unlimited users
- Custom integrations
- Advanced security
- Dedicated support
- All features included

### Add-on Packs
- Collaboration Pack (+$10/month)
- Productivity Pack (+$10/month)
- Business Pack (+$15/month)
- Automation Pack (+$10/month)
- Compliance Pack (+$10/month)

## Support

For support inquiries:
- Email: support@pulsehub.com
- Documentation: docs.pulsehub.com
- Community Forum: community.pulsehub.com