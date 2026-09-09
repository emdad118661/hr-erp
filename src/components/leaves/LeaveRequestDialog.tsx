// src/components/leaves/LeaveRequestDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  resubmitData?: any; // Resubmit করার সময় পুরনো ডাটা prefill হবে
}

export default function LeaveRequestDialog({
  open,
  onOpenChange,
  onSuccess,
  resubmitData,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (open) {
      if (resubmitData) {
        // Resubmit mode — পুরনো তথ্য prefill
        setForm({
          type: resubmitData.type || "CASUAL",
          startDate: resubmitData.startDate
            ? new Date(resubmitData.startDate).toISOString().split("T")[0]
            : "",
          endDate: resubmitData.endDate
            ? new Date(resubmitData.endDate).toISOString().split("T")[0]
            : "",
          reason: "",
        });
      } else {
        setForm({ type: "CASUAL", startDate: "", endDate: "", reason: "" });
      }
    }
  }, [open, resubmitData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.reason.trim() === "") {
      toast.error("Please write the reason for your leave");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resubmitData ? "Resubmit Leave Request" : "Request Leave"}
          </DialogTitle>
          <DialogDescription>
            {resubmitData
              ? "Your previous request was rejected. You have one more attempt."
              : "Fill in the details of your leave request"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Leave Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASUAL">Casual Leave</SelectItem>
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                  <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Reason</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Why do you need this leave?"
                rows={3}
                required
              />
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
            <Button type="submit" disabled={loading}>
              {loading
                ? "Submitting..."
                : resubmitData
                ? "Resubmit Request"
                : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}