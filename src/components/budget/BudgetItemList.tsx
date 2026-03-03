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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  "TRANSPORT",
  "LODGING",
  "FOOD",
  "ACTIVITY",
  "SHOPPING",
  "HEALTH",
  "ADMIN",
  "OTHER",
] as const;
type Category = (typeof CATEGORIES)[number];

const categoryColors: Record<
  Category,
  "default" | "secondary" | "success" | "warning"
> = {
  TRANSPORT: "default",
  LODGING: "secondary",
  FOOD: "success",
  ACTIVITY: "warning",
  SHOPPING: "secondary",
  HEALTH: "default",
  ADMIN: "secondary",
  OTHER: "secondary",
};

interface BudgetItem {
  id: string;
  category: Category;
  description: string;
  planned: number;
  actual?: number | null;
  currency?: string | null;
  stop?: { name: string } | null;
  notes?: string | null;
}

export function BudgetItemList({
  tripId,
  currency,
}: {
  tripId: string;
  currency: string;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "OTHER" as Category,
    description: "",
    planned: "",
    actual: "",
    notes: "",
  });

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/budget-items`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/budget-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          description: form.description,
          planned: parseFloat(form.planned),
          actual: form.actual ? parseFloat(form.actual) : null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Budget item added" });
      setShowForm(false);
      setForm({
        category: "OTHER",
        description: "",
        planned: "",
        actual: "",
        notes: "",
      });
      load();
    } catch {
      toast({ title: "Failed to add budget item", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual = items.reduce((s, i) => s + (i.actual ?? 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">
            Planned:{" "}
            <strong>
              {currency} {totalPlanned.toFixed(2)}
            </strong>
          </span>
          <span className="text-gray-500">
            Actual:{" "}
            <strong>
              {currency} {totalActual.toFixed(2)}
            </strong>
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/export/${tripId}/budget.csv`} download>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </a>
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No budget items yet</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Diff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const diff = (item.actual ?? 0) - item.planned;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge
                      variant={categoryColors[item.category] ?? "secondary"}
                      className="text-xs"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {item.stop?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.planned.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.actual != null ? item.actual.toFixed(2) : "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right text-sm font-medium ${diff > 0 ? "text-red-500" : diff < 0 ? "text-green-600" : "text-gray-400"}`}
                  >
                    {item.actual != null
                      ? diff > 0
                        ? `+${diff.toFixed(2)}`
                        : diff.toFixed(2)
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Item</DialogTitle>
              <DialogDescription className="sr-only">
                Enter budget details such as category, planned amount, and
                optional notes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Category *</Label>
                  <Select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Category })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Planned ({currency}) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.planned}
                    onChange={(e) =>
                      setForm({ ...form, planned: e.target.value })
                    }
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description *</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                  placeholder="e.g. Flights Paris CDG"
                />
              </div>
              <div className="space-y-1">
                <Label>Actual ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.actual}
                  onChange={(e) => setForm({ ...form, actual: e.target.value })}
                  placeholder="0.00"
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
