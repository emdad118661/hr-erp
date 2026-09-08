// src/app/(dashboard)/dashboard/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  UserCheck,
  Plus,
  Check,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import MarkAttendanceDialog from "@/components/attendance/MarkAttendanceDialog";
import ApproveAttendanceDialog from "@/components/attendance/ApproveAttendanceDialog";

interface Attendance {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  requestStatus: "PENDING" | "APPROVED" | "REJECTED";
  checkIn?: string;
  checkOut?: string;
  reviewedBy?: {
    name: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Attendance | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchAttendances = async (status?: "all" | "pending" | "approved") => {
    try {
      let url = "/api/attendance";

      // HR/Admin যখন Filter এ ক্লিক করবে, তখন API তে status পাঠাবে
      if (status && status !== "all" && session?.user?.role !== "EMPLOYEE") {
        url += `?requestStatus=${status.toUpperCase()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      console.log("Fetched Data:", result); // ✅ Debugging

      if (result.success) {
        setAttendances(result.data);
      }
    } catch (error) {
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "all" | "pending" | "approved") => {
    setFilter(newFilter);
    fetchAttendances(newFilter);
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/attendance?requestStatus=PENDING");
      const result = await response.json();
      if (result.success) {
        setPendingRequests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending requests");
    }
  };

  useEffect(() => {
    fetchAttendances();
    if (session?.user.role !== "EMPLOYEE") {
      fetchPendingRequests();
    }
  }, [session]);

  const handleApproveClick = (request: Attendance) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PRESENT: "default",
      ABSENT: "destructive",
      LATE: "secondary",
      HALF_DAY: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getRequestStatusBadge = (status: string) => {
    const variants: any = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status}
      </Badge>
    );
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAttendances = attendances.filter((att) => {
    if (filter === "all") return true;
    return att.requestStatus.toLowerCase() === filter;
  });

  // useEffect
  useEffect(() => {
    fetchAttendances(filter);
    if (session?.user?.role !== "EMPLOYEE") {
      fetchPendingRequests();
    }
  }, [session, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>

        <div className="flex gap-2">
          {/* Employee: Request Check-in */}
          {session?.user?.role === "EMPLOYEE" && (
            <Button
              onClick={() => setMarkDialogOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Request Check-in
            </Button>
          )}

          {/* HR/Admin: Mark Attendance & View Pending */}
          {session?.user?.role !== "EMPLOYEE" && (
            <>
              <Button
                variant="secondary"
                onClick={() => setMarkDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Mark Attendance
              </Button>
              {pendingRequests.length > 0 && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 relative"
                  onClick={fetchPendingRequests}
                >
                  <Eye className="w-4 h-4" />
                  Pending Requests
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pending Requests Card (HR/Admin Only) */}
      {session?.user?.role !== "EMPLOYEE" && pendingRequests.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              Pending Approval Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{request.userId?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApproveClick(request)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("all")}
        >
          All
        </Button>
        {session?.user?.role !== "EMPLOYEE" && (
          <>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("approved")}
            >
              Approved
            </Button>
          </>
        )}
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendances.length > 0 ? (
                  filteredAttendances.map((attendance) => (
                    <TableRow key={attendance._id}>
                      <TableCell className="font-medium">
                        {attendance.userId?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {new Date(attendance.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {attendance.requestStatus === "APPROVED" ? (
                          getStatusBadge(attendance.status)
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRequestStatusBadge(attendance.requestStatus)}
                      </TableCell>
                      <TableCell>
                        {formatTime(attendance.checkIn)}
                      </TableCell>
                      <TableCell>
                        {attendance.reviewedBy?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {attendance.requestStatus === "PENDING" &&
                          session?.user?.role !== "EMPLOYEE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveClick(attendance)}
                            >
                              Review
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MarkAttendanceDialog
        open={markDialogOpen}
        onOpenChange={setMarkDialogOpen}
        onSuccess={() => {
          fetchAttendances();
          fetchPendingRequests();
        }}
      />

      <ApproveAttendanceDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        request={selectedRequest}
        onSuccess={() => {
          fetchAttendances();
          fetchPendingRequests();
        }}
      />
    </div>
  );
}