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
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentForm({ tripId, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "PASSPORT",
    title: "",
    issuedTo: "",
    issueDate: "",
    expiryDate: "",
    fileUrl: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          issuedTo: form.issuedTo || null,
          issueDate: form.issueDate || null,
          expiryDate: form.expiryDate || null,
          fileUrl: form.fileUrl || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Document added" });
      onSuccess();
    } catch {
      toast({ title: "Failed to add document", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription className="sr-only">
            Add a travel document with type, dates, and optional reference
            details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Type *</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="PASSPORT">Passport</option>
              <option value="VISA">Visa</option>
              <option value="INSURANCE">Insurance</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. John Passport"
            />
          </div>
          <div className="space-y-1">
            <Label>Issued To</Label>
            <Input
              value={form.issuedTo}
              onChange={(e) => setForm({ ...form, issuedTo: e.target.value })}
              placeholder="Name on document"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={form.issueDate}
                onChange={(e) =>
                  setForm({ ...form, issueDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>File URL</Label>
            <Input
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://…"
              type="url"
            />
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
              {loading ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
