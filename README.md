# Aviation Safety Management System (SMS)

A comprehensive web-based Safety Management System for flight schools and aero clubs, built with Next.js 15, React, and Supabase.

## Features

- **Occurrence Reporting System**
  - Submit new occurrence reports with detailed information
  - Classify occurrences (incident, accident, hazard, observation)
  - Track status (reported, in review, under investigation, closed)
  - Upload attachments (photos, documents)

- **Investigation Management**
  - Workflow stages for each investigation
  - Assignment of investigators
  - Evidence collection and documentation
  - Root cause analysis tools
  - Corrective action tracking
  - Sign-off and closure process

- **Dashboard**
  - Overview of recent occurrences
  - Status of ongoing investigations
  - Safety metrics and KPIs
  - Alerts for overdue actions
  - Filterable/sortable lists of reports

- **User Management**
  - Role-based access control (admin, safety officer, investigator, reporter)
  - User profile management
  - Notification system

## Tech Stack

- **Frontend**
  - Next.js 15 with App Router
  - React Server Components
  - TailwindCSS for styling
  - TypeScript for type safety

- **Backend**
  - Supabase for authentication and database
  - PostgreSQL database with RLS policies
  - Next.js API routes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/aviation-sms.git
cd aviation-sms
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. Set up the database
Run the `database.sql` file in your Supabase SQL editor to create all necessary tables, functions, and policies.

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/src
  /app                 # Next.js App Router
    /(auth)            # Authentication routes
    /(site)            # Main site routes
      /dashboard       # Dashboard and protected routes
  /components          # React components
    /dashboard         # Dashboard components
    /occurrences       # Occurrence-related components
    /investigations    # Investigation-related components
  /lib                 # Utility functions and libraries
  /types               # TypeScript type definitions
  /hooks               # Custom React hooks
  /providers           # React context providers
```

## Database Schema

The database includes the following main tables:
- `profiles` - User profiles
- `aircraft` - Aircraft registry
- `occurrences` - Safety occurrence reports
- `investigations` - Investigation records
- `investigation_updates` - Investigation notes and updates
- `corrective_actions` - Actions to address findings
- `attachments` - Files attached to occurrences or investigations
- `notifications` - User notifications

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
