"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import { ItineraryItemForm } from "./ItineraryItemForm";
import { useToast } from "@/components/ui/use-toast";

interface Stop {
  id: string;
  name: string;
}
interface ItineraryItem {
  id: string;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  type?: string | null;
  description?: string | null;
}
interface Day {
  id: string;
  date: string;
  pace: "LIGHT" | "MODERATE" | "BUSY";
  notes?: string | null;
  stop?: Stop | null;
  items: ItineraryItem[];
}

function timeToMinutes(time?: string | null) {
  if (!time) return Number.POSITIVE_INFINITY;
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes))
    return Number.POSITIVE_INFINITY;
  return hours * 60 + minutes;
}

const paceColor: Record<string, "success" | "warning" | "destructive"> = {
  LIGHT: "success",
  MODERATE: "warning",
  BUSY: "destructive",
};

export function DayPlanner({
  tripId,
  stops,
}: {
  tripId: string;
  stops: Stop[];
}) {
  const { toast } = useToast();
  const [days, setDays] = useState<Day[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [addItemDay, setAddItemDay] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{
    dayId: string;
    item: ItineraryItem;
  } | null>(null);
  const [form, setForm] = useState({
    date: "",
    stopId: "",
    pace: "MODERATE",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/days`);
    if (res.ok) setDays(await res.json());
  }

  useEffect(() => {
    load();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddDay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          stopId: form.stopId || null,
          pace: form.pace,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Day added" });
      setShowForm(false);
      setForm({ date: "", stopId: "", pace: "MODERATE", notes: "" });
      load();
    } catch {
      toast({ title: "Failed to add day", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDay(dayId: string) {
    if (!confirm("Delete this itinerary day?")) return;

    const res = await fetch(`/api/trips/${tripId}/days/${dayId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast({ title: "Failed to delete day", variant: "destructive" });
      return;
    }

    setExpandedDay((prev) => (prev === dayId ? null : prev));
    toast({ title: "Day deleted" });
    load();
  }

  async function handleDeleteItem(dayId: string, itemId: string) {
    if (!confirm("Delete this activity?")) return;

    const res = await fetch(`/api/days/${dayId}/items/${itemId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast({ title: "Failed to delete activity", variant: "destructive" });
      return;
    }

    toast({ title: "Activity deleted" });
    load();
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Itinerary Days</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Day
        </Button>
      </div>

      {days.length === 0 && (
        <p className="text-sm text-gray-400">No days planned yet</p>
      )}

      <div className="space-y-3">
        {days.map((day) => (
          <div key={day.id} className="border rounded-lg overflow-hidden">
            <div
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() =>
                setExpandedDay(expandedDay === day.id ? null : day.id)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedDay(expandedDay === day.id ? null : day.id);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm text-gray-900">
                  {fmt(day.date)}
                </span>
                {day.stop && (
                  <span className="text-xs text-gray-500">
                    @ {day.stop.name}
                  </span>
                )}
                <Badge variant={paceColor[day.pace]} className="text-xs">
                  {day.pace}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDay(day.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {day.items.length} item{day.items.length !== 1 ? "s" : ""}
                </span>
                {expandedDay === day.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            {expandedDay === day.id && (
              <div className="p-4 space-y-2">
                {day.notes && (
                  <p className="text-sm text-gray-500 mb-3">{day.notes}</p>
                )}
                {[...day.items]
                  .sort(
                    (a, b) =>
                      timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {item.startTime && (
                          <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">
                            {item.startTime}
                            {item.endTime && `–${item.endTime}`}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-gray-500 text-xs">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setEditItem({ dayId: day.id, item })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteItem(day.id, item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 text-xs"
                  onClick={() => setAddItemDay(day.id)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Activity
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Day</DialogTitle>
              <DialogDescription className="sr-only">
                Add a day to the itinerary with date, destination, pace, and
                notes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDay} className="space-y-3">
              <div className="space-y-1">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Destination</Label>
                <Select
                  value={form.stopId}
                  onChange={(e) => setForm({ ...form, stopId: e.target.value })}
                >
                  <option value="">— None —</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Pace</Label>
                <Select
                  value={form.pace}
                  onChange={(e) => setForm({ ...form, pace: e.target.value })}
                >
                  <option value="LIGHT">Light</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="BUSY">Busy</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Add Day"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {addItemDay && (
        <ItineraryItemForm
          dayId={addItemDay}
          onClose={() => setAddItemDay(null)}
          onSuccess={() => {
            setAddItemDay(null);
            load();
          }}
        />
      )}

      {editItem && (
        <ItineraryItemForm
          dayId={editItem.dayId}
          itemId={editItem.item.id}
          initialValues={{
            title: editItem.item.title,
            description: editItem.item.description,
            startTime: editItem.item.startTime,
            endTime: editItem.item.endTime,
            type: editItem.item.type,
          }}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            setEditItem(null);
            load();
          }}
        />
      )}
    </div>
  );
}
