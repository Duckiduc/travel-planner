"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TemplateItem {
  id: string;
  title: string;
  category?: string | null;
  priority: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  description?: string | null;
  items: TemplateItem[];
}

export function ChecklistTemplateList() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [items, setItems] = useState<
    Array<{ title: string; category: string; priority: string }>
  >([{ title: "", category: "", priority: "MEDIUM" }]);

  async function load() {
    const res = await fetch("/api/checklist-templates");
    if (res.ok) setTemplates(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checklist-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          items: items
            .filter((i) => i.title.trim())
            .map((i, idx) => ({
              title: i.title,
              category: i.category || null,
              priority: i.priority,
              order: idx,
            })),
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Template created" });
      setShowForm(false);
      setForm({ name: "", description: "" });
      setItems([{ title: "", category: "", priority: "MEDIUM" }]);
      load();
    } catch {
      toast({ title: "Failed to create template", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 && (
        <p className="text-sm text-gray-400">No templates yet</p>
      )}

      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 text-left"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                {t.description && (
                  <p className="text-sm text-gray-500">{t.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {t.items.length} items
                </span>
                {expanded === t.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>
            {expanded === t.id && (
              <div className="px-4 pb-4 border-t bg-gray-50">
                <div className="mt-3 space-y-2">
                  {t.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Badge
                        variant={
                          item.priority === "HIGH"
                            ? "destructive"
                            : item.priority === "LOW"
                              ? "secondary"
                              : "warning"
                        }
                        className="text-xs shrink-0"
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-gray-800">{item.title}</span>
                      {item.category && (
                        <span className="text-gray-400 text-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Checklist Template</DialogTitle>
              <DialogDescription className="sr-only">
                Create a checklist template and add reusable items with
                categories and priorities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label>Template Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Beach Holiday Packing"
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label className="mb-2 block">Items</Label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <Input
                        className="col-span-2"
                        placeholder="Item title"
                        value={item.title}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, title: e.target.value } : it,
                            ),
                          )
                        }
                      />
                      <Input
                        placeholder="Category"
                        value={item.category}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? { ...it, category: e.target.value }
                                : it,
                            ),
                          )
                        }
                      />
                      <Select
                        value={item.priority}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? { ...it, priority: e.target.value }
                                : it,
                            ),
                          )
                        }
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setItems((prev) => prev.filter((_, i) => i !== idx))
                        }
                        disabled={items.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    setItems((prev) => [
                      ...prev,
                      { title: "", category: "", priority: "MEDIUM" },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Item
                </Button>
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
                  {loading ? "Saving…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
