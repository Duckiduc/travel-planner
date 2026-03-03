"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  dayId: string;
  itemId?: string;
  initialValues?: {
    title: string;
    description?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    type?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function ItineraryItemForm({
  dayId,
  itemId,
  initialValues,
  onClose,
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const isEditMode = Boolean(itemId);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    startTime: initialValues?.startTime ?? "",
    endTime: initialValues?.endTime ?? "",
    type: initialValues?.type ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        isEditMode
          ? `/api/days/${dayId}/items/${itemId}`
          : `/api/days/${dayId}/items`,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description || null,
            startTime: form.startTime || null,
            endTime: form.endTime || null,
            type: form.type || null,
          }),
        },
      );
      if (!res.ok) throw new Error();
      toast({ title: isEditMode ? "Activity updated" : "Activity added" });
      onSuccess();
    } catch {
      toast({
        title: isEditMode
          ? "Failed to update activity"
          : "Failed to add activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Activity" : "Add Activity"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode
              ? "Edit an itinerary activity with optional time, type, and notes."
              : "Add an itinerary activity with optional time, type, and notes."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Visit Eiffel Tower"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="">— Select —</option>
              <option value="SIGHTSEEING">Sightseeing</option>
              <option value="FOOD">Food & Dining</option>
              <option value="TRANSPORT">Transport</option>
              <option value="ACTIVITY">Activity</option>
              <option value="LEISURE">Leisure</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEditMode ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
