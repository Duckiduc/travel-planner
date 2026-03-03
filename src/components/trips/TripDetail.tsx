"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TripForm } from "./TripForm";
import { StopList } from "@/components/itinerary/StopList";
import { DayPlanner } from "@/components/itinerary/DayPlanner";
import { BudgetItemList } from "@/components/budget/BudgetItemList";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { ReservationList } from "@/components/reservations/ReservationList";
import { DocumentList } from "@/components/documents/DocumentList";
import { ChecklistItemList } from "@/components/checklist/ChecklistItemList";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Calendar,
  MapPin,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Trip {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  currency: string;
  notes?: string | null;
  stops: Array<{ id: string; name: string; country?: string | null }>;
  travelers: Array<{ id: string; name: string }>;
  _count: { checklistItems: number; reservations: number; documents: number };
}

const statusColors: Record<string, "default" | "success" | "secondary"> = {
  PLANNING: "default",
  ACTIVE: "success",
  ARCHIVED: "secondary",
};

export function TripDetail({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  async function load() {
    const res = await fetch(`/api/trips/${tripId}`);
    if (res.ok) setTrip(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Trip deleted" });
      router.push("/dashboard");
    } else {
      toast({ title: "Failed to delete trip", variant: "destructive" });
    }
  }

  function formatDate(d: string | null | undefined) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading)
    return <div className="animate-pulse h-8 bg-gray-100 rounded w-48" />;
  if (!trip) return <p className="text-gray-500">Trip not found</p>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to trips
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
              <Badge variant={statusColors[trip.status] ?? "default"}>
                {trip.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {(trip.startDate || trip.endDate) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(trip.startDate)}
                  {trip.endDate && ` – ${formatDate(trip.endDate)}`}
                </span>
              )}
              {trip.stops.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.stops.map((s) => s.name).join(" → ")}
                </span>
              )}
            </div>
            {trip.description && (
              <p className="mt-2 text-sm text-gray-600">{trip.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/export/${tripId}/itinerary.pdf`} download>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  PDF
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/export/${tripId}/budget.csv`} download>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Budget CSV
                </a>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 mb-6">
          {[
            "overview",
            "itinerary",
            "budget",
            "reservations",
            "documents",
            "checklist",
          ].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize border border-gray-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Destinations</h3>
              <StopList tripId={tripId} onChanged={load} />
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">
                Budget Summary
              </h3>
              <BudgetSummary tripId={tripId} currency={trip.currency} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="itinerary">
          <DayPlanner tripId={tripId} stops={trip.stops} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetItemList tripId={tripId} currency={trip.currency} />
        </TabsContent>

        <TabsContent value="reservations">
          <ReservationList tripId={tripId} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentList tripId={tripId} />
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistItemList tripId={tripId} />
        </TabsContent>
      </Tabs>

      {editing && (
        <TripForm
          initial={{
            ...trip,
            startDate: trip.startDate ?? null,
            endDate: trip.endDate ?? null,
          }}
          onClose={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false);
            load();
          }}
        />
      )}
    </div>
  );
}
