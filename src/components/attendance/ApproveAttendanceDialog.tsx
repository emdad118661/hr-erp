// src/components/attendance/ApproveAttendanceDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Attendance {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  status: string;
  checkIn?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Attendance | null;
  onSuccess: () => void;
}

export default function ApproveAttendanceDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!request) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/${request._id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");

      toast.success(result.message);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Attendance Request</DialogTitle>
          <DialogDescription>
            Approve or reject this check-in request
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div>
            <p className="text-sm text-gray-500">Employee</p>
            <p className="font-medium">{request.userId?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">
              {new Date(request.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Requested Status</p>
            <p className="font-medium">{request.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Request Time</p>
            <p className="font-medium">
              {request.checkIn
                ? new Date(request.checkIn).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleAction("REJECT")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Reject"}
          </Button>
          <Button
            onClick={() => handleAction("APPROVE")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Processing..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}