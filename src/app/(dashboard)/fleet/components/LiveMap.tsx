"use client";

import * as React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type TruckStatus = "en-route" | "idle" | "offline";

interface FleetTruck {
  id: string;
  driver: string;
  status: TruckStatus;
  zone: string;
  nextStop: string;
  lat: number;
  lng: number;
}

// Custom Leaflet DivIcon for trucks
const getTruckIcon = (status: TruckStatus, isSelected: boolean) => {
  const color =
    status === "en-route"
      ? "bg-emerald-500"
      : status === "idle"
      ? "bg-amber-500"
      : "bg-slate-400 dark:bg-slate-500";
  const pulse = status === "en-route" ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" : "";
  const size = isSelected ? "w-8 h-8" : "w-6 h-6";
  const innerSize = isSelected ? "w-3 h-3" : "w-2 h-2";
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center ${size}">
        ${pulse ? `<span class="${pulse}"></span>` : ""}
        <div class="relative flex items-center justify-center ${size} rounded-full ${color} border-2 border-white dark:border-[#0a0e14] shadow-md transition-all duration-300">
          <div class="${innerSize} rounded-full bg-white"></div>
        </div>
      </div>
    `,
    className: "",
    iconSize: isSelected ? [32, 32] : [24, 24],
    iconAnchor: isSelected ? [16, 16] : [12, 12],
  });
};

// Component to dynamically pan the map to the selected truck
function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveMap({
  trucks,
  selectedTruckId,
  onSelectTruck,
}: {
  trucks: FleetTruck[];
  selectedTruckId: string | null;
  onSelectTruck: (id: string) => void;
}) {
  const cairoCenter: [number, number] = [30.0444, 31.2357];

  const selectedTruck = React.useMemo(() => {
    return trucks.find((t) => t.id === selectedTruckId);
  }, [trucks, selectedTruckId]);

  const mapCenter = React.useMemo<[number, number]>(() => {
    if (selectedTruck && typeof selectedTruck.lat === "number" && typeof selectedTruck.lng === "number") {
      return [selectedTruck.lat, selectedTruck.lng];
    }
    return cairoCenter;
  }, [selectedTruck]);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner relative z-10">
      <MapContainer
        center={cairoCenter}
        zoom={12}
        style={{ width: "100%", height: "100%", background: "#0a0e14" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:invert dark:opacity-85 dark:hue-rotate-[200deg]"
        />

        {selectedTruck && (
          <ChangeMapCenter center={mapCenter} />
        )}

        {trucks.map((t) => {
          if (typeof t.lat !== "number" || typeof t.lng !== "number") return null;
          const isSelected = selectedTruckId === t.id;
          return (
            <Marker
              key={t.id}
              position={[t.lat, t.lng]}
              icon={getTruckIcon(t.status, isSelected)}
              eventHandlers={{
                click: () => onSelectTruck(t.id),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 min-w-[150px] text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm">{t.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                      t.status === "en-route"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : t.status === "idle"
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-slate-500/10 text-slate-700"
                    }`}>
                      {t.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">{t.driver}</p>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Zone:</span>
                      <span className="font-medium text-slate-700">{t.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel:</span>
                      <span className="font-medium text-slate-700">{t.fuel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Stop:</span>
                      <span className="font-medium text-slate-700">{t.nextStop}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
