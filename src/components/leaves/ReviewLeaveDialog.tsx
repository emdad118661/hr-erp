// src/components/leaves/ReviewLeaveDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onSuccess: () => void;
}

export default function ReviewLeaveDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (open) {
      setShowRejectForm(false);
      setRejectionReason("");
    }
  }, [open]);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!request) return;

    // Reject করলে reason চেক
    if (action === "REJECT" && rejectionReason.trim() === "") {
      toast.error("Please write the rejection reason");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/leaves/${request._id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: action === "REJECT" ? rejectionReason : undefined,
        }),
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

  const days =
    Math.ceil(
      (new Date(request.endDate).getTime() -
        new Date(request.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Leave Request</DialogTitle>
          <DialogDescription>
            Approve or reject this leave request
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p className="font-medium">{request.userId?.name}</p>
            </div>
            <Badge variant="outline">Attempt {request.attemptCount}/2</Badge>
          </div>

          <div>
            <p className="text-sm text-gray-500">Leave Type</p>
            <p className="font-medium">{request.type}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">
                {new Date(request.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="font-medium">
                {new Date(request.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{days} day(s)</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Employee's Reason</p>
            <p className="font-medium bg-gray-50 p-3 rounded-lg text-sm">
              {request.reason}
            </p>
          </div>

          {/* ✅ Reject form — Reject বাটনে ক্লিক করলে textarea দেখাবে */}
          {showRejectForm && (
            <div className="grid gap-2 pt-2 border-t">
              <Label className="text-red-600">
                Rejection Reason (Required)
              </Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why are you rejecting this leave request?"
                rows={3}
                className="border-red-300 focus-visible:ring-red-400"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!showRejectForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleAction("APPROVE")}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Processing..." : "Approve"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction("REJECT")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Rejection"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}