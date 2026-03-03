"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TripForm } from "./TripForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Calendar, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Trip {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: "PLANNING" | "ACTIVE" | "ARCHIVED";
  currency: string;
  stops: Array<{ id: string; name: string }>;
  _count: { travelers: number; checklistItems: number };
}

const statusColors: Record<
  string,
  "default" | "success" | "secondary" | "outline"
> = {
  PLANNING: "default",
  ACTIVE: "success",
  ARCHIVED: "secondary",
};

export function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function loadTrips() {
      try {
        const res = await fetch("/api/trips");
        if (res.ok && mounted) {
          setTrips(await res.json());
        }
      } catch (error) {
        if (mounted) {
          toast({ title: "Error loading trips", variant: "destructive" });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = async () => {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) setTrips(await res.json());
    } catch {
      toast({ title: "Error loading trips", variant: "destructive" });
    }
  };

  function formatDate(d: string | null | undefined) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No trips yet</p>
          <p className="text-sm mt-1">Create your first trip to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 text-base leading-tight">
                      {trip.title}
                    </h2>
                    <Badge
                      variant={statusColors[trip.status]}
                      className="ml-2 shrink-0 text-xs"
                    >
                      {trip.status}
                    </Badge>
                  </div>
                  {trip.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {(trip.startDate || trip.endDate) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDate(trip.startDate)}
                          {trip.endDate && ` – ${formatDate(trip.endDate)}`}
                        </span>
                      </div>
                    )}
                    {trip.stops.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{trip.stops.map((s) => s.name).join(", ")}</span>
                      </div>
                    )}
                    {trip._count.travelers > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {trip._count.travelers} traveler
                          {trip._count.travelers !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <TripForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
