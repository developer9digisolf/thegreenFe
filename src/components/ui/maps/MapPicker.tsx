"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, MapPin } from "lucide-react";

// Fix default marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange?: (val: { lat: number; lng: number }) => void;
  disabled?: boolean;
}

// ─── Sub-component: handle map click & marker drag ────────────────────────────
function LocationMarker({ value, onChange, disabled }: MapPickerProps) {
  const markerRef = useRef<any>(null);

  const map = useMapEvents({
    click(e) {
      if (!disabled && onChange) {
        onChange(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker && onChange) {
          onChange(marker.getLatLng());
        }
      },
    }),
    [onChange],
  );

  const hasValidValue =
    value &&
    typeof value.lat === "number" &&
    !isNaN(value.lat) &&
    typeof value.lng === "number" &&
    !isNaN(value.lng);

  return hasValidValue ? (
    <Marker
      draggable={!disabled}
      eventHandlers={eventHandlers}
      position={[value!.lat, value!.lng]}
      ref={markerRef}
    />
  ) : null;
}

// ─── Sub-component: pan map when value changes from outside (manual input) ───
function SyncMap({ center }: { center: [number, number] }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!center || center.length !== 2 || isNaN(center[0]) || isNaN(center[1]))
      return;

    const currentCenter = map.getCenter();
    const deltaLat = Math.abs(currentCenter.lat - center[0]);
    const deltaLng = Math.abs(currentCenter.lng - center[1]);

    if (deltaLat > 0.0001 || deltaLng > 0.0001) {
      map.panTo(center);
    }
  }, [center[0], center[1], map]);

  return null;
}

// ─── Sub-component: invalidate map size when fullscreen toggles ───────────────
function InvalidateOnResize({ trigger }: { trigger: boolean }) {
  const map = useMap();

  useEffect(() => {
    // Wait for CSS transition to finish before invalidating
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 320);
    return () => clearTimeout(t);
  }, [trigger, map]);

  return null;
}

// ─── Main MapPicker ───────────────────────────────────────────────────────────
export default function MapPicker({
  value,
  onChange,
  disabled,
}: MapPickerProps) {
  const defaultCenter: [number, number] = [3.5952, 98.6722]; // Medan, Indonesia
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getValidCenter = (): [number, number] => {
    if (value?.lat && value?.lng && !isNaN(value.lat) && !isNaN(value.lng)) {
      return [value.lat, value.lng];
    }
    return defaultCenter;
  };

  const position = getValidCenter();

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen((prev) => !prev);
  }, []);

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const mapContent = (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="pointer-events-auto"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker value={value} onChange={onChange} disabled={disabled} />
      {!disabled && <SyncMap center={position} />}
      <InvalidateOnResize trigger={isFullscreen} />
    </MapContainer>
  );

  // ── Normal (inline) mode ──────────────────────────────────────────────────
  if (!isFullscreen) {
    return (
      <div
        className={`
          w-full h-[300px] rounded-xl overflow-hidden
          border-2 border-gray-100 relative z-0
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {mapContent}

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Buka Fullscreen"
          className="
            absolute top-2 right-2 z-[1000]
            w-9 h-9 rounded-lg bg-white shadow-md border border-slate-100
            flex items-center justify-center
            text-emerald-500 hover:text-emerald-600
            hover:bg-emerald-50 hover:scale-105
            transition-all duration-150
          "
        >
          <Maximize2 size={16} />
        </button>

        {/* Hint when no marker placed yet */}
        {!disabled && !value?.lat && (
          <div
            className="
              absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000]
              flex items-center gap-1.5
              bg-white/90 backdrop-blur-sm
              text-slate-500 text-xs font-medium
              px-3 py-1.5 rounded-full shadow-sm
              pointer-events-none whitespace-nowrap
            "
          >
            <MapPin size={12} className="text-emerald-500" />
            Klik peta untuk menandai lokasi
          </div>
        )}

        {/* Disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-white/20 z-[1000] cursor-not-allowed backdrop-blur-[1px]" />
        )}
      </div>
    );
  }

  // ── Fullscreen mode (rendered via fixed overlay) ──────────────────────────
  return (
    <>
      {/* Inline placeholder so layout doesn't collapse */}
      <div
        className={`
          w-full h-[300px] rounded-xl
          border-2 border-emerald-200 bg-emerald-50/50
          flex items-center justify-center
          text-emerald-400 text-sm font-medium gap-2
        `}
      >
        <Maximize2 size={16} />
        Peta dibuka dalam fullscreen
      </div>

      {/* Backdrop - higher z-index to ensure it's above all modals */}
      <div
        className="fixed inset-0 z-[20000] bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={() => setIsFullscreen(false)}
      />

      {/* Fullscreen map panel - even higher z-index to be above backdrop */}
      <div
        className="
          fixed z-[20001]
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[min(92vw,960px)] h-[min(88vh,640px)]
          rounded-2xl overflow-hidden
          shadow-2xl border-2 border-emerald-400
          animate-in fade-in zoom-in-95 duration-200
          cursor-pointer
        "
        onClick={(e) => e.stopPropagation()}
      >
        {mapContent}

        {/* Close / minimize button - higher z-index for accessibility */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Tutup Fullscreen (Esc)"
          className="
            absolute top-3 right-3 z-[20002]
            w-9 h-9 rounded-lg bg-white shadow-lg border border-slate-100
            flex items-center justify-center
            text-emerald-500 hover:text-emerald-600
            hover:bg-emerald-50 hover:scale-105
            transition-all duration-150
            cursor-pointer
          "
        >
          <Minimize2 size={16} />
        </button>

        {/* ESC hint - higher z-index */}
        <div
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2 z-[20002]
            flex items-center gap-1.5
            bg-white/90 backdrop-blur-sm
            text-slate-400 text-xs font-medium
            px-3 py-1.5 rounded-full shadow-sm
            pointer-events-none
          "
        >
          Tekan{" "}
          <kbd className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">
            Esc
          </kbd>{" "}
          untuk menutup
        </div>

        {/* Disabled overlay (fullscreen) - highest z-index */}
        {disabled && (
          <div className="absolute inset-0 bg-white/20 z-[20003] cursor-not-allowed backdrop-blur-[1px]" />
        )}
      </div>
    </>
  );
}
