import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  speed: number | null;
}

interface UseGPSTrackingOptions {
  bookingId: string | null;
  enabled: boolean;
}

export const useGPSTracking = ({ bookingId, enabled }: UseGPSTrackingOptions) => {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const positionsRef = useRef<GPSPosition[]>([]);

  const startTracking = useCallback(() => {
    if (!bookingId || !user || !navigator.geolocation) {
      setError("Géolocalisation non disponible");
      return;
    }

    // Create broadcast channel for this booking
    const channel = supabase.channel(`gps-tracking-${bookingId}`);
    channel.subscribe();
    channelRef.current = channel;

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos: GPSPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed,
        };
        setCurrentPosition(pos);
        positionsRef.current.push(pos);
        setError(null);

        // Broadcast position to owner
        channel.send({
          type: "broadcast",
          event: "position",
          payload: {
            walkerId: user.id,
            bookingId,
            position: pos,
          },
        });
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setTracking(true);
  }, [bookingId, user]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setTracking(false);
  }, []);

  // Auto start/stop based on enabled prop
  useEffect(() => {
    if (enabled && bookingId) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [enabled, bookingId, startTracking, stopTracking]);

  return {
    currentPosition,
    tracking,
    error,
    positions: positionsRef.current,
    startTracking,
    stopTracking,
  };
};

// Hook for owner to watch walker's GPS position
export const useWatchWalkerPosition = (bookingId: string | null) => {
  const [walkerPosition, setWalkerPosition] = useState<GPSPosition | null>(null);
  const [trail, setTrail] = useState<GPSPosition[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const channel = supabase
      .channel(`gps-tracking-${bookingId}`)
      .on("broadcast", { event: "position" }, (payload) => {
        const pos = payload.payload.position as GPSPosition;
        setWalkerPosition(pos);
        setTrail((prev) => [...prev, pos]);
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [bookingId]);

  return { walkerPosition, trail, connected };
};
