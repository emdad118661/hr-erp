# HR Management Dashboard (Mini ERP) 🚀

A comprehensive HR Management System built with Next.js 15, TypeScript, and MongoDB. This application streamlines employee management, attendance tracking, and leave request workflows for modern organizations.

![HR ERP Dashboard](./screenshots/dashboard.png)

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login/logout with NextAuth.js
- Role-based access control (Admin, HR, Employee)
- Protected routes and API endpoints

### 👥 Employee Management
- Add, edit, delete employees
- View all employees in a searchable table
- Role assignment (Admin, HR, Employee)
- Profile management

### 📅 Attendance Tracking
- Employee check-in request system
- HR approval/rejection workflow
- Automatic late detection (after 10 AM)
- View attendance history with filters
- Check-in/Check-out time tracking
- Working hours calculation

### ️ Leave Request Management
- Submit leave requests with reason
- Multiple leave types (Casual, Sick, Annual, Unpaid)
- HR approval/rejection with comments
- Maximum 2 attempts per date range
- Search and filter leave requests
- Bulk delete functionality
- Status update (Approved ↔ Rejected)

### 📊 Dashboard Analytics
- Total employees count
- Present/absent today
- On leave count
- Pending leave requests
- Recent attendance records
- Recent leave requests

### 📱 Responsive Design
- Mobile-first approach
- Works on mobile, tablet, and desktop
- Hamburger menu for mobile
- Responsive tables and forms

## ️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui |
| **Database** | MongoDB Atlas |
| **ORM** | Mongoose |
| **Authentication** | NextAuth.js (Auth.js) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier works)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hr-erp.git
   cd hr-erp
2. **Install dependencies**

Bash

npm install
3. **Set up environment variables**

Create a .env file in the root directory:

env

MONGODB_URI="your-mongodb-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
4. **Run the development server**

Bash

npm run dev
5. **Open your browser**

Navigate to http://localhost:3000

Default Admin Credentials
After running the seed script:

Email: admin@hrerp.com
Password: admin123

**Project Structure**
hr-erp/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   └── leaves/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   └── leaves/
│   │   └── login/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ── leaves/
│   ├── lib/
│   ├── models/
│   └── types/
├── public/
├── .env
├── next.config.ts
── package.json
└── README.md
