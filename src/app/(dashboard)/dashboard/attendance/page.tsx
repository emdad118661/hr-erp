// src/app/(dashboard)/dashboard/attendance/page.tsx
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

export default async function AttendancePage() {
  const session = await auth();
  await connectDB();

  const attendances = await Attendance.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <Button className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Mark Attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length > 0 ? (
                attendances.map((attendance: any) => (
                  <TableRow key={attendance._id}>
                    <TableCell className="font-medium">
                      {attendance.userId?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(attendance.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        attendance.status === "PRESENT" ? "default" :
                        attendance.status === "ABSENT" ? "destructive" : "secondary"
                      }>
                        {attendance.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attendance.checkIn 
                        ? new Date(attendance.checkIn).toLocaleTimeString() 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {attendance.checkOut 
                        ? new Date(attendance.checkOut).toLocaleTimeString() 
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No attendance records yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}