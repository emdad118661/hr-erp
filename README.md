# HR Management Dashboard (Mini ERP) 🚀

A comprehensive HR Management System built with Next.js 15, TypeScript, and MongoDB. This application streamlines employee management, attendance tracking, and leave request workflows for modern organizations.

![HR ERP Dashboard](https://github.com/user-attachments/assets/7122b496-d230-4842-a88a-15a01ab91c80)

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

# HR ERP

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hr-erp.git
cd hr-erp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Create a `.env` file in the root directory and add the following:

```env
MONGODB_URI="your-mongodb-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Open your browser

Navigate to:

```text
http://localhost:3000
```

## Default Admin Credentials

After running the seed script:

- **Email:** `admin@hrerp.com`
- **Password:** `admin123`

## Project Structure

```text
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
│   │   │   │   └── [...nextauth]/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ── leaves/
│   │   └── login/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MobileSidebar.tsx
│   │   │   ── Sidebar.tsx
│   │   ├── ui/
│   │   ├── employees/
│   │   ├── attendance/
│   │   └── leaves/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── mongodb.ts
│   │   └── utils.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Attendance.ts
│   │   └── LeaveRequest.ts
│   ── types/
│       └── next-auth.d.ts
├── public/
├── .env
├── .gitignore
├── next.config.ts
├── package.json
── tailwind.config.ts
└── README.md
```

## Screenshots

### 1. Dashboard

![Dashboard](https://github.com/user-attachments/assets/7122b496-d230-4842-a88a-15a01ab91c80)

### 2. Employee List & Management

![Employee List](https://github.com/user-attachments/assets/8ae8f284-866c-46d0-8c78-a06dbce657b1)

### 3. Attendance Request & Management

![Attendance Management](https://github.com/user-attachments/assets/422a12eb-d0d1-430c-827a-43e0daeb64a6)

### 4. Leave Request & Management

![Leave Management](https://github.com/user-attachments/assets/d451bac6-b052-4e72-9f8e-20b4140dca6a)
