"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChecklistItem {
  id: string;
  title: string;
  category?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  completed: boolean;
  dueDate?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
}

const priorityColors: Record<string, "default" | "warning" | "destructive"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "destructive",
};

export function ChecklistItemList({ tripId }: { tripId: string }) {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
  });

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/checklist-items`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/checklist-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
          assignedTo: form.assignedTo || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Item added" });
      setShowForm(false);
      setForm({
        title: "",
        category: "",
        priority: "MEDIUM",
        dueDate: "",
        assignedTo: "",
      });
      load();
    } catch {
      toast({ title: "Failed to add item", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(item: ChecklistItem) {
    const res = await fetch(`/api/trips/${tripId}/checklist-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, completed: !i.completed } : i,
        ),
      );
    }
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/trips/${tripId}/checklist-items/${id}`, {
      method: "DELETE",
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const completed = items.filter((i) => i.completed).length;
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    const key = item.category ?? "Uncategorized";
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {completed}/{items.length} completed
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/export/${tripId}/checklist.csv`} download>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </a>
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400">No checklist items yet</p>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {cat}
            </h4>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${item.completed ? "bg-gray-50 opacity-70" : ""}`}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleComplete(item)}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${item.completed ? "line-through text-gray-400" : "text-gray-900"}`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant={priorityColors[item.priority]}
                        className="text-xs py-0"
                      >
                        {item.priority}
                      </Badge>
                      {item.assignedTo && (
                        <span className="text-xs text-gray-400">
                          {item.assignedTo}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 p-1 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Checklist Item</DialogTitle>
              <DialogDescription className="sr-only">
                Add a checklist item with optional category, due date, assignee,
                and priority.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Pack sunscreen"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="e.g. Health"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Priority</Label>
                  <Select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Assigned To</Label>
                  <Input
                    value={form.assignedTo}
                    onChange={(e) =>
                      setForm({ ...form, assignedTo: e.target.value })
                    }
                    placeholder="Name"
                  />
                </div>
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
