// src/components/attendance/MarkAttendanceDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ExistingRequest {
  _id: string;
  date: string;
  status: string;
  requestStatus: "PENDING" | "APPROVED" | "REJECTED";
  checkIn?: string;
  reviewedAt?: string;
}

export default function MarkAttendanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<ExistingRequest | null>(null);
  const [form, setForm] = useState({
    userId: "",
    status: "PRESENT",
    date: new Date().toISOString().split("T")[0],
  });

  // Check for existing request when date changes
  useEffect(() => {
    if (open && session?.user?.role === "EMPLOYEE") {
      checkExistingRequest(form.date);
    }
  }, [open, form.date, session]);

  useEffect(() => {
    if (open) {
      if (session?.user?.role !== "EMPLOYEE") {
        fetch("/api/employees")
          .then((res) => res.json())
          .then((result) => {
            if (result.success) setEmployees(result.data);
          });
      }
      setForm({
        userId: "",
        status: "PRESENT",
        date: new Date().toISOString().split("T")[0],
      });
      setExistingRequest(null);
    }
  }, [open, session]);

  const checkExistingRequest = async (date: string) => {
    try {
      const response = await fetch(`/api/attendance?date=${date}`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setExistingRequest(result.data[0]);
      } else {
        setExistingRequest(null);
      }
    } catch (error) {
      console.error("Failed to check existing request");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId || undefined,
          status: form.status,
          date: form.date,
          checkIn: new Date().toISOString(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");

      toast.success(result.message || "Success");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {session?.user?.role === "EMPLOYEE"
              ? "Request Check-in"
              : "Mark Attendance"}
          </DialogTitle>
          <DialogDescription>
            {session?.user?.role === "EMPLOYEE"
              ? "Submit a check-in request for HR approval"
              : "Mark attendance for an employee"}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Show existing request status for Employee */}
        {session?.user?.role === "EMPLOYEE" && existingRequest && (
          <div className={`p-3 rounded-lg border ${
            existingRequest.requestStatus === "REJECTED" 
              ? "bg-red-50 border-red-200" 
              : existingRequest.requestStatus === "PENDING"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-center gap-2">
              {existingRequest.requestStatus === "REJECTED" && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {existingRequest.requestStatus === "PENDING" && (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              {existingRequest.requestStatus === "APPROVED" && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {existingRequest.requestStatus === "REJECTED" 
                    ? "Previous Request Rejected"
                    : existingRequest.requestStatus === "PENDING"
                    ? "Pending Approval"
                    : "Already Approved"}
                </p>
                <p className="text-xs text-gray-500">
                  {existingRequest.requestStatus === "REJECTED"
                    ? "You can submit a new request"
                    : existingRequest.requestStatus === "PENDING"
                    ? "Wait for HR approval"
                    : "Attendance already marked"}
                </p>
              </div>
              <Badge variant={
                existingRequest.requestStatus === "REJECTED" ? "destructive" :
                existingRequest.requestStatus === "PENDING" ? "secondary" : "default"
              }>
                {existingRequest.requestStatus}
              </Badge>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {session?.user?.role !== "EMPLOYEE" && (
              <div className="grid gap-2">
                <Label>Employee</Label>
                <Select
                  value={form.userId}
                  onValueChange={(v) => setForm({ ...form, userId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (session?.user?.role === "EMPLOYEE" && existingRequest?.requestStatus === "PENDING")}
            >
              {loading
                ? "Submitting..."
                : session?.user?.role === "EMPLOYEE"
                ? existingRequest?.requestStatus === "REJECTED"
                  ? "Resubmit Request"
                  : existingRequest?.requestStatus === "PENDING"
                  ? "Pending Approval"
                  : "Submit Request"
                : "Mark Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}