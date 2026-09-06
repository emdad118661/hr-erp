// src/app/(dashboard)/dashboard/leaves/page.tsx
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { LeaveRequest } from "@/models/LeaveRequest";
import { User } from "@/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export default async function LeavesPage() {
  const session = await auth();
  await connectDB();

  const leaves = await LeaveRequest.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leave Requests</h1>
        <Button className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Request Leave
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell className="font-medium">
                      {leave.userId?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        leave.status === "APPROVED" ? "default" :
                        leave.status === "REJECTED" ? "destructive" : "secondary"
                      }>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.status === "PENDING" && session?.user?.role !== "EMPLOYEE" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-green-500">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No leave requests yet
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