// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  LogIn,
  Shield,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">HR ERP</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/emdad118661/hr-erp"
              target="_blank"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GitHub
            </Link>
            <Link href="/login">
              <Button className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
          🚀 Professional HR Management System
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Manage Your Team{" "}
          <span className="text-blue-600">Effortlessly</span>
        </h1>

        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          A complete HR ERP solution with employee management, attendance
          tracking, leave requests, and real-time analytics. Built with Next.js
          15, TypeScript, and MongoDB.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href="https://github.com/emdad118661/hr-erp"
            target="_blank"
          >
            <Button size="lg" variant="outline">
              View on GitHub
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your HR operations efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Employee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add, edit, delete employees with role-based access control
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Attendance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Check-in/out system with HR approval workflow
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Leave Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Request, approve, and track leave with comments
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Dashboard Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time insights and reporting for better decisions
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Try It Yourself!</CardTitle>
            <CardDescription>
              Login with the demo credentials to explore the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-500 mb-2">Admin</p>
                <p className="font-mono text-sm font-semibold">
                  admin@hrerp.com
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  admin123
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-500 mb-2">HR</p>
                <p className="font-mono text-sm font-semibold">
                  hr@hrerp.com
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  hr123
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-500 mb-2">Employee</p>
                <p className="font-mono text-sm font-semibold">
                  employee@hrerp.com
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  emp123
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login">
                <Button className="flex items-center gap-2 mx-auto">
                  <LogIn className="h-4 w-4" />
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built With Modern Tech
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Using the latest technologies for best performance and developer
            experience
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
          >
            Next.js 15
          </Badge>
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200"
          >
            TypeScript
          </Badge>
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm bg-cyan-100 hover:bg-cyan-200"
          >
            Tailwind CSS
          </Badge>
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm bg-green-100 hover:bg-green-200"
          >
            MongoDB
          </Badge>
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200"
          >
            NextAuth.js
          </Badge>
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm bg-orange-100 hover:bg-orange-200"
          >
            shadcn/ui
          </Badge>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>
            Built with ❤️ using Next.js 15, TypeScript, and MongoDB
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} HR ERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}