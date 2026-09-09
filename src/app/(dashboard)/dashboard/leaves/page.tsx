// src/app/(dashboard)/dashboard/leaves/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Plus,
  XCircle,
  Search,
  Trash2,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import LeaveRequestDialog from "@/components/leaves/LeaveRequestDialog";

interface Leave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  attemptNumber: number;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  reviewedBy?: {
    _id?: string;
    name?: string;
  };
}

type FilterType = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const leaveTypeLabel: Record<string, string> = {
  CASUAL: "Casual Leave",
  SICK: "Sick Leave",
  ANNUAL: "Annual Leave",
  UNPAID: "Unpaid Leave",
};

export default function LeavesPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("ALL");
  const [selectedLeaves, setSelectedLeaves] = useState<Set<string>>(
    new Set()
  );
  const [isSelectAll, setIsSelectAll] = useState(false);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "">("");
  const [rejectionReason, setRejectionReason] = useState("");

  const isEmployee = session?.user?.role === "EMPLOYEE";
  const isReviewer =
    session?.user?.role === "ADMIN" || session?.user?.role === "HR";

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm && isReviewer) {
        params.set("search", searchTerm);
      }
      if (filter !== "ALL") {
        params.set("status", filter);
      }
      if (leaveTypeFilter !== "ALL") {
        params.set("leaveType", leaveTypeFilter);
      }

      const response = await fetch(`/api/leaves?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch leave requests");
      }

      if (result.success) {
        setLeaves(result.data);
        setSelectedLeaves(new Set());
        setIsSelectAll(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch leave requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchLeaves();
    }
  }, [sessionStatus, filter, leaveTypeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || filter !== "ALL" || leaveTypeFilter !== "ALL") {
        fetchLeaves();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredLeaves = useMemo(() => {
    return leaves;
  }, [leaves]);

  const pendingCount = leaves.filter(
    (leave) => leave.status === "PENDING"
  ).length;

  const getStatusBadge = (status: Leave["status"]) => {
    if (status === "APPROVED") {
      return (
        <Badge className="bg-green-600 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          APPROVED
        </Badge>
      );
    }
    if (status === "REJECTED") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          REJECTED
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock3 className="h-3 w-3 mr-1" />
        PENDING
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedLeaves(new Set());
    } else {
      setSelectedLeaves(new Set(filteredLeaves.map((l) => l._id)));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectLeave = (id: string) => {
    const newSelected = new Set(selectedLeaves);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeaves(newSelected);
    setIsSelectAll(newSelected.size === filteredLeaves.length);
  };

  const handleBulkDelete = async () => {
    if (selectedLeaves.size === 0) return;

    setDeleteLoading(true);
    try {
      const response = await fetch("/api/leaves", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedLeaves) }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete");
      }

      toast.success(result.message);
      fetchLeaves();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSingleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete");
      }

      toast.success(result.message);
      fetchLeaves();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedLeave) return;

    if (reviewAction === "REJECT" && rejectionReason.trim().length < 5) {
      toast.error("Rejection reason must be at least 5 characters");
      return;
    }

    try {
      const response = await fetch(`/api/leaves/${selectedLeave._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          rejectionReason: reviewAction === "REJECT" ? rejectionReason : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update");
      }

      toast.success(result.message);
      fetchLeaves();
      setReviewDialogOpen(false);
      setReviewAction("");
      setRejectionReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update"
      );
    }
  };

  const openReviewDialog = (leave: Leave, action?: "APPROVE" | "REJECT") => {
    setSelectedLeave(leave);
    setReviewAction(action || "");
    setRejectionReason(leave.rejectionReason || "");
    setReviewDialogOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEmployee ? "Submit and track" : "Review and manage"}
          </p>
        </div>

        {isEmployee && (
          <Button
            onClick={() => setRequestDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        )}
      </div>

      {/* HR Pending Card */}
      {isReviewer && pendingCount > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock3 className="h-6 w-6 text-yellow-700" />
            <div>
              <p className="font-semibold text-yellow-900">
                {pendingCount} Pending Leave Request
                {pendingCount > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-yellow-800">
                Review pending leave requests from the table below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Bar */}
      {isReviewer && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Search..." className="pl-10" />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={leaveTypeFilter} onValueChange={(val) => setLeaveTypeFilter(val || "ALL")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="CASUAL">Casual</SelectItem>
                    <SelectItem value="SICK">Sick</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={fetchLeaves}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {isReviewer && selectedLeaves.size > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-blue-800">
              {selectedLeaves.size} leave request(s) selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLeaves(new Set())}
              >
                Cancel Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterType[]).map(
          (item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
            >
              {item === "ALL" ? "All" : item}
            </Button>
          )
        )}
      </div>

      {/* Leave Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {isEmployee ? "My Leave History" : "All Leave Requests"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isReviewer && (
                    <TableHead className="w-[50px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleSelectAll}
                      >
                        {isSelectAll ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                  )}
                  {!isEmployee && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review Details</TableHead>
                  {isReviewer && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <TableRow key={leave._id}>
                      {isReviewer && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSelectLeave(leave._id)}
                          >
                            {selectedLeaves.has(leave._id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      )}

                      {!isEmployee && (
                        <TableCell className="font-medium">
                          <div>{leave.userId?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">
                            {leave.userId?.email || ""}
                          </div>
                        </TableCell>
                      )}

                      <TableCell>
                        {leaveTypeLabel[leave.leaveType] || leave.leaveType}
                      </TableCell>

                      <TableCell>
                        <div className="whitespace-nowrap">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          to {formatDate(leave.endDate)}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[200px] truncate">
                        {leave.reason}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {leave.attemptNumber || 1} / 2
                        </Badge>
                      </TableCell>

                      <TableCell>{getStatusBadge(leave.status)}</TableCell>

                      <TableCell className="max-w-[200px]">
                        {leave.status === "REJECTED" ? (
                          <div>
                            <p className="flex items-center gap-1 text-sm font-medium text-red-600">
                              <XCircle className="h-4 w-4" />
                              Rejected
                            </p>
                            <p className="mt-1 text-xs text-red-500 truncate">
                              {leave.rejectionReason || "No reason provided"}
                            </p>
                          </div>
                        ) : leave.status === "APPROVED" ? (
                          <div>
                            <p className="flex items-center gap-1 text-sm font-medium text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Approved
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              By {leave.reviewedBy?.name || "HR/Admin"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Waiting for review
                          </span>
                        )}
                      </TableCell>

                      {isReviewer && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {leave.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() =>
                                    openReviewDialog(leave, "APPROVE")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    openReviewDialog(leave, "REJECT")
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {leave.status !== "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReviewDialog(leave)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isEmployee ? 6 : 9}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-6 w-6" />
                        No leave requests found
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Leave Request Dialog */}
      <LeaveRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSuccess={fetchLeaves}
      />

      {/* HR Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVE"
                ? "Approve Leave Request"
                : reviewAction === "REJECT"
                  ? "Reject Leave Request"
                  : "Update Leave Status"}
            </DialogTitle>
            <DialogDescription>
              {selectedLeave?.userId?.name &&
                `${selectedLeave.userId.name}'s leave request`}
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4 py-3">
              <div className="rounded-md bg-muted p-4 text-sm">
                <p>
                  <span className="font-semibold">Leave Type:</span>{" "}
                  {leaveTypeLabel[selectedLeave.leaveType]}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Date:</span>{" "}
                  {formatDate(selectedLeave.startDate)} -{" "}
                  {formatDate(selectedLeave.endDate)}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Attempt:</span>{" "}
                  {selectedLeave.attemptNumber} of 2
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Reason:</span>{" "}
                  {selectedLeave.reason}
                </p>
                {selectedLeave.status !== "PENDING" && (
                  <p className="mt-2">
                    <span className="font-semibold">Current Status:</span>{" "}
                    {selectedLeave.status}
                  </p>
                )}
              </div>

              {(reviewAction === "REJECT" || !reviewAction) && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Rejection Reason{" "}
                    {(reviewAction === "REJECT" || !reviewAction) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Write rejection reason..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setReviewAction("");
                setRejectionReason("");
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>

            {!reviewAction && selectedLeave?.status !== "PENDING" && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setReviewAction("REJECT");
                  }}
                  disabled={deleteLoading}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setReviewAction("APPROVE");
                    handleReview();
                  }}
                  disabled={deleteLoading}
                >
                  Approve
                </Button>
              </>
            )}

            {reviewAction && (
              <Button
                type="button"
                variant={reviewAction === "REJECT" ? "destructive" : "default"}
                onClick={handleReview}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Processing..." : "Confirm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedLeaves.size > 1
                ? "Delete Multiple Leave Requests"
                : "Delete Leave Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedLeaves.size > 1
                ? `Are you sure you want to delete ${selectedLeaves.size} leave requests? This action cannot be undone.`
                : "Are you sure you want to delete this leave request? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={selectedLeaves.size > 1 ? handleBulkDelete : () => selectedLeave && handleSingleDelete(selectedLeave._id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}