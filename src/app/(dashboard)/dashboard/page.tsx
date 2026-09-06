// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Attendance } from "@/models/Attendance";
import { LeaveRequest } from "@/models/LeaveRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock, UserCheck, FileText } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  await connectDB();

  // Fetch real data from database
  const totalEmployees = await User.countDocuments({ role: { $ne: "ADMIN" } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const presentToday = await Attendance.countDocuments({
    date: { $gte: today, $lt: tomorrow },
    status: "PRESENT"
  });

  const onLeave = await LeaveRequest.countDocuments({
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    status: "APPROVED"
  });

  const pendingRequests = await LeaveRequest.countDocuments({
    status: "PENDING"
  });

  const recentAttendances = await Attendance.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  const recentLeaves = await LeaveRequest.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </p>
      </div>

      {/* Welcome Message */}
      <div className="mb-8">
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold">{session?.user?.name}</span>!
        </p>
        <p className="text-sm text-gray-500">Role: {session?.user?.role}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-gray-500 mt-1">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Present Today
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-gray-500 mt-1">Checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              On Leave
            </CardTitle>
            <Calendar className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onLeave}</div>
            <p className="text-xs text-gray-500 mt-1">Currently on leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Requests
            </CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-gray-500 mt-1">Leave approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendances.length > 0 ? (
              <div className="space-y-3">
                {recentAttendances.map((attendance: any) => (
                  <div key={attendance._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{attendance.userId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(attendance.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      attendance.status === "PRESENT" ? "bg-green-100 text-green-700" :
                      attendance.status === "ABSENT" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {attendance.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No attendance records yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeaves.length > 0 ? (
              <div className="space-y-3">
                {recentLeaves.map((leave: any) => (
                  <div key={leave._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{leave.userId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{leave.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      leave.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      leave.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No leave requests yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}