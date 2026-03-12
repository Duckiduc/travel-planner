"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";

interface Props {
  tripId: string;
  reservationId?: string;
  initialValues?: {
    type: "TRANSPORT" | "LODGING" | "ACTIVITY";
    title: string;
    provider?: string | null;
    confirmRef?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    amount?: number | null;
    currency?: string | null;
    status?: string | null;
    notes?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const currencyOptions = ["EUR", "USD", "GBP", "JPY", "IDR", "PHP"];

export function ReservationForm({
  tripId,
  reservationId,
  initialValues,
  onClose,
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const isEditMode = Boolean(reservationId);

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    return value.slice(0, 10);
  };

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: initialValues?.type ?? "TRANSPORT",
    title: initialValues?.title ?? "",
    provider: initialValues?.provider ?? "",
    confirmRef: initialValues?.confirmRef ?? "",
    startDate: formatDate(initialValues?.startDate),
    endDate: formatDate(initialValues?.endDate),
    amount: initialValues?.amount != null ? String(initialValues.amount) : "",
    currency: initialValues?.currency ?? "EUR",
    status: initialValues?.status ?? "",
    notes: initialValues?.notes ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        isEditMode
          ? `/api/trips/${tripId}/reservations/${reservationId}`
          : `/api/trips/${tripId}/reservations`,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: form.type,
            title: form.title,
            provider: form.provider || null,
            confirmRef: form.confirmRef || null,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
            amount: form.amount ? parseFloat(form.amount) : null,
            currency: form.currency || null,
            status: form.status || null,
            notes: form.notes || null,
          }),
        },
      );
      if (!res.ok) throw new Error();
      toast({
        title: isEditMode ? "Reservation updated" : "Reservation added",
      });
      onSuccess();
    } catch {
      toast({
        title: isEditMode
          ? "Failed to update reservation"
          : "Failed to add reservation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Reservation" : "Add Reservation"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode
              ? "Edit reservation details including type, provider, dates, and booking reference."
              : "Add reservation details including type, provider, dates, and booking reference."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="TRANSPORT">Transport</option>
                <option value="LODGING">Lodging</option>
                <option value="ACTIVITY">Activity</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Input
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                placeholder="Confirmed, Pending…"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Paris CDG → Rome FCO"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Provider</Label>
              <Input
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                placeholder="e.g. Air France"
              />
            </div>
            <div className="space-y-1">
              <Label>Confirmation Ref</Label>
              <Input
                value={form.confirmRef}
                onChange={(e) =>
                  setForm({ ...form, confirmRef: e.target.value })
                }
                placeholder="e.g. ABC123"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option value="">— Select —</option>
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
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
