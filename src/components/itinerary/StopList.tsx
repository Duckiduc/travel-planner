"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Stop {
  id: string;
  name: string;
  country?: string | null;
  arrivalDate?: string | null;
  departureDate?: string | null;
  order: number;
  notes?: string | null;
}

export function StopList({
  tripId,
  onChanged,
}: {
  tripId: string;
  onChanged?: () => void;
}) {
  const { toast } = useToast();
  const [stops, setStops] = useState<Stop[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    country: "",
    arrivalDate: "",
    departureDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/stops`);
    if (res.ok) setStops(await res.json());
  }

  useEffect(() => {
    load();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          country: form.country || null,
          arrivalDate: form.arrivalDate || null,
          departureDate: form.departureDate || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Destination added" });
      setShowForm(false);
      setForm({
        name: "",
        country: "",
        arrivalDate: "",
        departureDate: "",
        notes: "",
      });
      load();
      onChanged?.();
    } catch {
      toast({ title: "Failed to add destination", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/trips/${tripId}/stops/${id}`, { method: "DELETE" });
    setStops((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Destination removed" });
    onChanged?.();
  }

  function fmt(d: string | null | undefined) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="space-y-2 mb-3">
        {stops.length === 0 && (
          <p className="text-sm text-gray-400">No destinations added yet</p>
        )}
        {stops.map((stop) => (
          <div
            key={stop.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
          >
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">{stop.name}</p>
              {stop.country && (
                <p className="text-xs text-gray-500">{stop.country}</p>
              )}
              {(stop.arrivalDate || stop.departureDate) && (
                <p className="text-xs text-gray-400">
                  {fmt(stop.arrivalDate)}{" "}
                  {stop.departureDate && `→ ${fmt(stop.departureDate)}`}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(stop.id)}
              className="text-gray-300 hover:text-red-500 p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Destination
      </Button>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Destination</DialogTitle>
              <DialogDescription className="sr-only">
                Add a destination with location details, travel dates, and
                optional notes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <Label>City / Place *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Arrival</Label>
                  <Input
                    type="date"
                    value={form.arrivalDate}
                    onChange={(e) =>
                      setForm({ ...form, arrivalDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Departure</Label>
                  <Input
                    type="date"
                    value={form.departureDate}
                    onChange={(e) =>
                      setForm({ ...form, departureDate: e.target.value })
                    }
                  />
                </div>
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
                  {loading ? "Saving…" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
