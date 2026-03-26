import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { CalendarDays, MapPin, RefreshCcw, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";

dayjs.extend(customParseFormat);

const GOOGLE_MAP_SCRIPT_ID = "foodverse-order-map-script";
const DEFAULT_CENTER = { lat: 22.9445, lng: 90.8282 };

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b" },
  "accept by rider": { label: "Accept By Rider", color: "#2563eb" },
  "accept by restaurant": { label: "Accept By Restaurant", color: "#06b6d4" },
  "ready for pickup": { label: "Ready For Pickup", color: "#7c3aed" },
  "picked up": { label: "Picked Up", color: "#4338ca" },
  delivered: { label: "Delivered", color: "#16a34a" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  "cancelled by restaurant": {
    label: "Cancelled By Restaurant",
    color: "#b91c1c",
  },
};

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function getStatusConfig(status) {
  const normalized = normalizeStatus(status);
  return (
    STATUS_CONFIG[normalized] || {
      label: status || "Unknown",
      color: "#64748b",
    }
  );
}

function getStatusBadgeClass(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "pending") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (normalized === "accept by rider") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (normalized === "accept by restaurant") {
    return "bg-cyan-100 text-cyan-700 border-cyan-200";
  }
  if (normalized === "ready for pickup") {
    return "bg-violet-100 text-violet-700 border-violet-200";
  }
  if (normalized === "picked up") {
    return "bg-indigo-100 text-indigo-700 border-indigo-200";
  }
  if (normalized === "delivered") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (normalized === "cancelled" || normalized === "cancelled by restaurant") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return `৳${amount.toFixed(0)}`;
}

function formatDistance(value) {
  const distance = Number(value || 0);
  return `${distance.toFixed(2)} km`;
}

function formatOrderReference(id) {
  if (!id) return "N/A";
  return String(id).slice(-6).toUpperCase();
}

function getPaymentMethod(order) {
  const raw =
    order?.paymentMethod ||
    order?.paymentType ||
    order?.payment_mode ||
    order?.payment;

  if (!raw) return "N/A";

  return String(raw).replaceAll("_", " ").toUpperCase();
}

function parseRawDate(value) {
  if (!value) return null;

  if (dayjs.isDayjs(value) && value.isValid()) return value;

  if (typeof value === "string") {
    const formats = [
      "DD/MM/YY",
      "DD/MM/YYYY",
      "MM/DD/YY",
      "MM/DD/YYYY",
      "YYYY-MM-DD",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DDTHH:mm:ssZ",
      "YYYY-MM-DD HH:mm:ss",
      "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ",
    ];

    for (const format of formats) {
      const parsed = dayjs(value, format, true);
      if (parsed.isValid()) return parsed;
    }
  }

  const direct = dayjs(value);
  if (direct.isValid()) return direct;

  return null;
}

function getOrderDate(order) {
  const candidateFields = [
    order?.orderDate,
    order?.createdAt,
    order?.date,
    order?.created_at,
    order?.updatedAt,
  ];

  for (const value of candidateFields) {
    const parsed = parseRawDate(value);
    if (parsed) return parsed;
  }

  return null;
}

function getOrderCoords(order) {
  const rawLat =
    order?.coords?.lat ??
    order?.coords?.latitude ??
    order?.lat ??
    order?.latitude;

  const rawLng =
    order?.coords?.long ??
    order?.coords?.lng ??
    order?.coords?.longitude ??
    order?.long ??
    order?.lng ??
    order?.longitude;

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

function createPinIcon(color) {
  const svg = `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 43C18 43 32 29.5 32 17C32 9.26801 25.732 3 18 3C10.268 3 4 9.26801 4 17C4 29.5 18 43 18 43Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="17" r="5.5" fill="white"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(36, 44),
    anchor: new window.google.maps.Point(18, 44),
  };
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAP_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google.maps));
      existingScript.addEventListener("error", () =>
        reject(new Error("Google Maps failed to load")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAP_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Google Maps failed to load"));

    document.head.appendChild(script);
  });
}

async function fetchAllOrders(zoneId) {
  const limit = 100;
  const maxPages = 50;

  let page = 1;
  let allOrders = [];
  let totalCount = 0;

  while (page <= maxPages) {
    const response = await api.post(`/zone/order-list?page=${page}&limit=${limit}`, {
      zoneId,
    });

    const payload = response?.data;
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    totalCount = Number(payload?.totalCount || totalCount || 0);

    allOrders = [...allOrders, ...rows];

    if (!rows.length) break;
    if (rows.length < limit) break;
    if (totalCount && allOrders.length >= totalCount) break;

    page += 1;
  }

  const uniqueOrders = Array.from(
    new Map(allOrders.map((item) => [item._id, item])).values(),
  );

  return uniqueOrders;
}

function InfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b border-slate-200 text-sm last:border-b-0">
      <div className="bg-slate-50 px-4 py-3 font-medium text-slate-500">{label}</div>
      <div className={`px-4 py-3 text-slate-900 ${valueClassName}`}>{value}</div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const parsedDate = getOrderDate(order);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-slate-900">
            <MapPin size={16} className="text-blue-500" />
            <h3 className="text-base font-semibold">
              Order Reference: {formatOrderReference(order._id)}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Payment Method
              </p>
              <span className="inline-flex rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                {getPaymentMethod(order)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-right">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Order Status
              </p>
              <span
                className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${getStatusBadgeClass(
                  order.status,
                )}`}
              >
                {getStatusConfig(order.status).label}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <InfoRow label="Customer" value={order.customerPhone || "N/A"} />
            <InfoRow
              label="Total Amount"
              value={formatMoney(order.totalAmount)}
              valueClassName="font-bold text-emerald-600"
            />
            <InfoRow label="Restaurant" value={order.restaurantName || "N/A"} />
            <InfoRow label="Drop Location" value={order.dropLocation || "N/A"} />
            <InfoRow label="Rider ID" value={order.riderId || "N/A"} />
            <InfoRow label="Distance" value={formatDistance(order.distance)} />
            <InfoRow
              label="Order Time"
              value={parsedDate ? parsedDate.format("DD MMM YYYY, hh:mm A") : "N/A"}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderMap() {
  const { user } = useAuth();
  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const { data: apiOrders = [], isFetching, refetch } = useQuery({
    queryKey: ["order-map-orders", zoneId],
    queryFn: () => fetchAllOrders(zoneId),
    enabled: !!zoneId,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!apiKey) {
      setMapError("Google Maps API key is missing.");
      return;
    }

    let cancelled = false;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!cancelled) {
          setMapsReady(true);
          setMapError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMapError("Google Maps failed to load.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapsReady || !mapContainerRef.current || mapRef.current) return;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      gestureHandling: "greedy",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapRef.current = map;

    const timer = setTimeout(() => {
      if (window.google?.maps && mapRef.current) {
        window.google.maps.event.trigger(mapRef.current, "resize");
        mapRef.current.setCenter(DEFAULT_CENTER);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [mapsReady]);

  const filteredOrders = useMemo(() => {
    if (!selectedDate) return apiOrders;

    return apiOrders.filter((order) => {
      const parsedDate = getOrderDate(order);
      if (!parsedDate) return false;
      return parsedDate.format("YYYY-MM-DD") === selectedDate;
    });
  }, [apiOrders, selectedDate]);

  const ordersWithCoords = useMemo(() => {
    return filteredOrders
      .map((order) => ({
        ...order,
        _coords: getOrderCoords(order),
      }))
      .filter((order) => order._coords);
  }, [filteredOrders]);

  useEffect(() => {
    if (selectedOrder) {
      const stillExists = ordersWithCoords.some((order) => order._id === selectedOrder._id);
      if (!stillExists) {
        setSelectedOrder(null);
      }
    }
  }, [ordersWithCoords, selectedOrder]);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !window.google?.maps) return;

    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const drawMarkers = () => {
      if (!ordersWithCoords.length) {
        map.setCenter(DEFAULT_CENTER);
        map.setZoom(12);
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();

      ordersWithCoords.forEach((order) => {
        const statusStyle = getStatusConfig(order.status);

        const marker = new window.google.maps.Marker({
          map,
          position: order._coords,
          title: `${formatOrderReference(order._id)} - ${statusStyle.label}`,
          icon: createPinIcon(statusStyle.color),
        });

        marker.addListener("click", () => {
          setSelectedOrder(order);
          map.panTo(order._coords);

          if ((map.getZoom() || 0) < 15) {
            map.setZoom(15);
          }
        });

        markersRef.current.push(marker);
        bounds.extend(order._coords);
      });

      if (ordersWithCoords.length === 1) {
        map.setCenter(ordersWithCoords[0]._coords);
        map.setZoom(15);
      } else {
        map.fitBounds(bounds, 70);
      }
    };

    const timer = setTimeout(() => {
      if (window.google?.maps && mapRef.current) {
        window.google.maps.event.trigger(map, "resize");
        drawMarkers();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapsReady, ordersWithCoords]);

  const legendItems = useMemo(() => {
    return [
      STATUS_CONFIG.pending,
      STATUS_CONFIG["accept by rider"],
      STATUS_CONFIG["accept by restaurant"],
      STATUS_CONFIG["ready for pickup"],
      STATUS_CONFIG["picked up"],
      STATUS_CONFIG.delivered,
      STATUS_CONFIG.cancelled,
    ];
  }, []);

  return (
    <Layout>
      <div className="relative h-[calc(100vh-96px)] min-h-[620px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {mapsReady && !mapError ? (
          <div ref={mapContainerRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              <p className="mt-4 text-sm font-medium text-slate-500">Loading map...</p>
              {mapError ? <p className="mt-2 text-sm text-red-500">{mapError}</p> : null}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="pointer-events-auto w-full max-w-3xl rounded-3xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Order Tracking Map</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Live order locations from your real order list.
                  </p>
                </div>

                <div className="w-full md:w-[220px]">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Filter by Date
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <CalendarDays size={16} className="text-slate-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {legendItems.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="pointer-events-auto inline-flex items-center gap-2 self-start rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {!ordersWithCoords.length ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
            <div className="pointer-events-auto rounded-2xl border border-white/60 bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-lg backdrop-blur">
              No mapped orders found for the selected date.
            </div>
          </div>
        ) : null}

        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      </div>
    </Layout>
  );
}

export default OrderMap;
