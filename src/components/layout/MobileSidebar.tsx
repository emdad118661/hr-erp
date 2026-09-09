// src/components/layout/MobileSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MobileSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Employees", icon: Users, href: "/dashboard/employees" },
  { name: "Attendance", icon: Calendar, href: "/dashboard/attendance" },
  { name: "Leave Requests", icon: FileText, href: "/dashboard/leaves" },
];

export default function MobileSidebar({ user }: MobileSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* ✅ বাটনটি এখন সরাসরি স্টেট নিয়ন্ত্রণ করবে (Nested button বা asChild এর ঝামেলা নেই) */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex h-full flex-col">
                  {/* Logo */}
                  <div className="flex h-14 items-center border-b px-6">
                    <h1 className="text-lg font-bold">HR ERP</h1>
                  </div>

                  {/* User Info */}
                  <div className="border-b p-4">
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-10 w-10 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                                isActive
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Logout */}
                  <div className="border-t p-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        signOut({ callbackUrl: "/login" });
                        setOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-bold">HR ERP</h1>
          </div>

          <div className="flex items-center gap-2">
            <UserCircle className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white lg:fixed lg:inset-y-0">
        <div className="flex h-14 items-center border-b px-6">
          <h1 className="text-lg font-bold">HR ERP</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg border-b pb-4">
              <UserCircle className="h-10 w-10 text-gray-400" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>

            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}