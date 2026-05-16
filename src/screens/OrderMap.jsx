import React, {useEffect, useMemo, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {CalendarDays, MapPin, RefreshCcw, X} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import {useAuth} from "../context/authContext";

dayjs.extend(customParseFormat);

const GOOGLE_MAP_SCRIPT_ID = "foodverse-order-map-script";
const DEFAULT_CENTER = {lat: 22.9445, lng: 90.8282};

const STATUS_CONFIG = {
  pending: {label: "Pending", color: "#f59e0b"},
  "accept by rider": {label: "Accept By Rider", color: "#2563eb"},
  "accept by restaurant": {label: "Accept By Restaurant", color: "#06b6d4"},
  "ready for pickup": {label: "Ready For Pickup", color: "#7c3aed"},
  "picked up": {label: "Picked Up", color: "#4338ca"},
  delivered: {label: "Delivered", color: "#16a34a"},
  cancelled: {label: "Cancelled", color: "#ef4444"},
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

function toNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return `TK ${toNumber(value).toFixed(0)}`;
}

function formatDistance(value) {
  return `${toNumber(value).toFixed(2)} km`;
}

function formatOrderReference(id) {
  if (!id) return "N/A";
  return String(id).slice(-6).toUpperCase();
}

function getPaymentMethod(order) {
  const raw =
    order?.payementMethod ||
    order?.paymentMethod ||
    order?.peymentMethod ||
    order?.paymentType ||
    order?.payment_mode ||
    order?.payment;

  if (!raw) return "N/A";

  return String(raw).replaceAll("_", " ").toUpperCase();
}

function parseRawDate(value) {
  if (!value) return null;

  if (dayjs.isDayjs(value) && value.isValid()) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    const formats = [
      "D/M/YY",
      "D/M/YYYY",
      "DD/MM/YY",
      "DD/MM/YYYY",
      "M/D/YY",
      "M/D/YYYY",
      "MM/DD/YY",
      "MM/DD/YYYY",
      "YYYY-MM-DD",
      "YYYY-M-D",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-M-D HH:mm:ss",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DDTHH:mm:ssZ",
      "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ",
      "ddd MMM DD YYYY HH:mm:ss",
      "MMM DD YYYY hh:mm A",
      "DD MMM YYYY hh:mm A",
    ];

    for (const format of formats) {
      const strictParsed = dayjs(trimmed, format, true);
      if (strictParsed.isValid()) return strictParsed;
    }

    for (const format of formats) {
      const looseParsed = dayjs(trimmed, format);
      if (looseParsed.isValid()) return looseParsed;
    }

    const directParsed = dayjs(trimmed);
    if (directParsed.isValid()) return directParsed;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}


function parseMongoObjectIdDate(id) {
  if (!id || typeof id !== "string" || id.length < 8) {
    return null;
  }

  const timestampHex = id.substring(0, 8);
  const timestamp = parseInt(timestampHex, 16);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const parsed = dayjs(timestamp * 1000);
  return parsed.isValid() ? parsed : null;
}

function getOrderDate(order) {
  const candidateFields = [
    order?.orderDate,
    order?.createdAt,
    order?.createDate,
    order?.created_at,
    order?.date,
    order?.updatedAt,
    order?.updateDate,
  ];

  for (const value of candidateFields) {
    const parsed = parseRawDate(value);
    if (parsed) return parsed;
  }

  const objectIdDate = parseMongoObjectIdDate(order?._id);
  if (objectIdDate) return objectIdDate;

  return null;
}

function getNormalDateString(order) {
  const parsedDate = getOrderDate(order);
  return parsedDate ? parsedDate.format("YYYY-MM-DD") : "";
}

function getBangladeshDateString(order) {
  const parsedDate = getOrderDate(order);
  return parsedDate ? parsedDate.add(6, "hour").format("YYYY-MM-DD") : "";
}

function getTodayBangladeshDateString() {
  return dayjs().add(6, "hour").format("YYYY-MM-DD");
}

function orderMatchesSelectedDate(order, selectedDate) {
  if (!selectedDate) return true;

  const normalDate = getNormalDateString(order);
  const bdDate = getBangladeshDateString(order);

  return normalDate === selectedDate || bdDate === selectedDate;
}

function pickLatLng(...sources) {
  for (const source of sources) {
    if (!source) continue;

    if (Array.isArray(source) && source.length >= 2) {
      const first = Number(source[0]);
      const second = Number(source[1]);

      if (
        Number.isFinite(first) &&
        Number.isFinite(second) &&
        first >= -90 &&
        first <= 90 &&
        second >= -180 &&
        second <= 180
      ) {
        return {lat: first, lng: second};
      }

      if (
        Number.isFinite(first) &&
        Number.isFinite(second) &&
        second >= -90 &&
        second <= 90 &&
        first >= -180 &&
        first <= 180
      ) {
        return {lat: second, lng: first};
      }
    }

    if (Array.isArray(source?.coordinates) && source.coordinates.length >= 2) {
      const lng = Number(source.coordinates[0]);
      const lat = Number(source.coordinates[1]);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        return {lat, lng};
      }
    }

    const rawLat =
      source.lat ??
      source.latitude ??
      source.Latitude ??
      source.userLat ??
      source.dropLat ??
      source.deliveryLat ??
      source.customerLat;

    const rawLng =
      source.lng ??
      source.long ??
      source.longitude ??
      source.Longitude ??
      source.userLng ??
      source.userLong ??
      source.dropLng ??
      source.dropLong ??
      source.deliveryLng ??
      source.deliveryLong ??
      source.customerLng ??
      source.customerLong;

    const lat = Number(rawLat);
    const lng = Number(rawLng);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return {lat, lng};
    }
  }

  return null;
}

function getOrderCoords(order) {
  return pickLatLng(
    order?.coords,
    order?.coordinate,
    order?.coordinates,
    order?.location,
    order?.userLocation,
    order?.customerLocation,
    order?.dropLocationCoords,
    order?.deliveryLocation,
    order?.deliveryAddress,
    order?.shippingAddress,
    order?.address,
    order
  );
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
      existingScript.addEventListener("load", () =>
        resolve(window.google.maps)
      );
      existingScript.addEventListener("error", () =>
        reject(new Error("Google Maps failed to load"))
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

function extractOrdersFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload?.data?.result)) return payload.data.result;
  return [];
}

function extractTotalCountFromPayload(payload, fallback = 0) {
  return Number(
    payload?.totalCount ||
      payload?.total ||
      payload?.count ||
      payload?.data?.totalCount ||
      payload?.data?.total ||
      fallback ||
      0
  );
}

async function fetchAllOrders(zoneId) {
  const limit = 100;
  const maxPages = 50;

  let page = 1;
  let allOrders = [];
  let totalCount = 0;

  while (page <= maxPages) {
    const response = await api.post(
      `/zone/order-list?page=${page}&limit=${limit}`,
      {zoneId}
    );

    const payload = response?.data;
    const rows = extractOrdersFromPayload(payload);

    totalCount = extractTotalCountFromPayload(payload, totalCount);

    allOrders = [...allOrders, ...rows];

    if (!rows.length) break;
    if (rows.length < limit) break;
    if (totalCount && allOrders.length >= totalCount) break;

    page += 1;
  }

  const uniqueOrders = Array.from(
    new Map(allOrders.map((item) => [item._id, item])).values()
  );

  uniqueOrders.sort((a, b) => {
    const dateA = getOrderDate(a)?.valueOf() || 0;
    const dateB = getOrderDate(b)?.valueOf() || 0;
    return dateB - dateA;
  });

  return uniqueOrders;
}

function getDeliveryAmount(order) {
  return toNumber(order?.deliveryAmount ?? order?.deliveryFee);
}

function getRiderTip(order) {
  return toNumber(order?.tip ?? order?.riderTip ?? order?.riderTips);
}

function getVoucherAmount(order) {
  return toNumber(order?.voucherAmount);
}

function getItemsTotal(order) {
  return (order?.items || []).reduce((sum, item) => {
    const itemPrice = toNumber(item?.offerPrice || item?.sellingPrice);
    const quantity = toNumber(item?.quantity || 1);

    const addonTotal = (item?.addons || []).reduce((addonSum, addon) => {
      return addonSum + toNumber(addon?.price) * toNumber(addon?.quantity || 1);
    }, 0);

    return sum + itemPrice * quantity + addonTotal;
  }, 0);
}

function getFinalOrderTotal(order) {
  const totalAfterVoucher = toNumber(order?.totalAfterVoucherApplied);
  const totalAmount = toNumber(order?.totalAmount);

  if (totalAfterVoucher > 0) {
    return totalAfterVoucher;
  }

  if (totalAmount > 0) {
    return totalAmount;
  }

  return Math.max(
    0,
    getItemsTotal(order) +
      getDeliveryAmount(order) +
      getRiderTip(order) -
      getVoucherAmount(order)
  );
}

function InfoRow({label, value, valueClassName = ""}) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b border-slate-200 text-sm last:border-b-0">
      <div className="bg-slate-50 px-4 py-3 font-medium text-slate-500">
        {label}
      </div>
      <div className={`px-4 py-3 text-slate-900 ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}

function OrderDetailsModal({order, onClose}) {
  if (!order) return null;

  const parsedDate = getOrderDate(order);
  const deliveryAmount = getDeliveryAmount(order);
  const riderTip = getRiderTip(order);
  const voucherAmount = getVoucherAmount(order);
  const finalTotal = getFinalOrderTotal(order);

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
                  order.status
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
              value={formatMoney(finalTotal)}
              valueClassName="font-bold text-emerald-600"
            />

            <InfoRow label="Delivery Fee" value={formatMoney(deliveryAmount)} />

            <InfoRow label="Rider Tip" value={formatMoney(riderTip)} />

            {voucherAmount > 0 ? (
              <InfoRow
                label="Voucher Applied"
                value={`TK -${voucherAmount.toFixed(0)}`}
                valueClassName="font-bold text-red-500"
              />
            ) : null}

            <InfoRow label="Restaurant" value={order.restaurantName || "N/A"} />

            <InfoRow
              label="Drop Location"
              value={order.dropLocation || "N/A"}
            />

            <InfoRow
              label="Rider ID"
              value={
                typeof order.riderId === "object"
                  ? order.riderId?._id || "N/A"
                  : order.riderId || "N/A"
              }
            />

            <InfoRow label="Distance" value={formatDistance(order.distance)} />

            <InfoRow
              label="Order Time"
              value={
                parsedDate ? parsedDate.format("DD MMM YYYY, hh:mm A") : "N/A"
              }
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

function StatusFilterButton({statusKey, selectedStatus, onClick}) {
  const isActive = selectedStatus === statusKey;

  const item =
    statusKey === "all"
      ? {label: "All Status", color: "#111827"}
      : STATUS_CONFIG[statusKey];

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        isActive
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{backgroundColor: isActive ? "#fff" : item.color}}
      />
      {item.label}
    </button>
  );
}

function OrderMap() {
  const {user} = useAuth();

  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayBangladeshDateString());
  const [selectedStatus, setSelectedStatus] = useState("all");

  const {
    data: apiOrders = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["order-map-orders", zoneId],
    queryFn: () => fetchAllOrders(zoneId),
    enabled: !!zoneId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
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

  const availableDates = useMemo(() => {
    const map = new Map();

    apiOrders.forEach((order) => {
      const normalDate = getNormalDateString(order);
      const bdDate = getBangladeshDateString(order);

      if (normalDate) {
        map.set(normalDate, (map.get(normalDate) || 0) + 1);
      }

      if (bdDate && bdDate !== normalDate) {
        map.set(bdDate, (map.get(bdDate) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => dayjs(b[0]).valueOf() - dayjs(a[0]).valueOf())
      .map(([date, count]) => ({date, count}));
  }, [apiOrders]);

  const dateFilteredOrders = useMemo(() => {
    let rows = Array.isArray(apiOrders) ? [...apiOrders] : [];

    if (selectedDate) {
      rows = rows.filter((order) => orderMatchesSelectedDate(order, selectedDate));
    }

    rows.sort((a, b) => {
      const dateA = getOrderDate(a)?.valueOf() || 0;
      const dateB = getOrderDate(b)?.valueOf() || 0;
      return dateB - dateA;
    });

    return rows;
  }, [apiOrders, selectedDate]);

  const filteredOrders = useMemo(() => {
    let rows = [...dateFilteredOrders];

    if (selectedStatus !== "all") {
      rows = rows.filter(
        (order) => normalizeStatus(order?.status) === selectedStatus
      );
    }

    return rows;
  }, [dateFilteredOrders, selectedStatus]);

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
      const stillExists = ordersWithCoords.some(
        (order) => order._id === selectedOrder._id
      );

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
    }, 200);

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapsReady, ordersWithCoords]);

  const statusKeys = useMemo(() => {
    return [
      "all",
      "pending",
      "accept by rider",
      "accept by restaurant",
      "ready for pickup",
      "picked up",
      "delivered",
      "cancelled",
    ];
  }, []);

  const handleRefresh = async () => {
    setSelectedOrder(null);
    await refetch();
  };

  return (
    <Layout>
      <div className="relative h-[calc(100vh-96px)] min-h-[620px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {mapsReady && !mapError ? (
          <div ref={mapContainerRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading map...
              </p>

              {mapError ? (
                <p className="mt-2 text-sm text-red-500">{mapError}</p>
              ) : null}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="pointer-events-auto w-full max-w-5xl rounded-3xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Order Tracking Map
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Live order locations from your real order list.
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Raw {apiOrders.length} orders • Date matched{" "}
                    {dateFilteredOrders.length} • Showing{" "}
                    {ordersWithCoords.length} mapped order
                    {ordersWithCoords.length !== 1 ? "s" : ""}
                    {selectedDate
                      ? ` for ${dayjs(selectedDate).format("DD MMM YYYY")}`
                      : " for all dates"}
                    {selectedStatus !== "all"
                      ? ` • ${getStatusConfig(selectedStatus).label}`
                      : ""}
                  </p>
                </div>

                <div className="w-full md:w-[340px]">
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

                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="">All Available Dates</option>
                    {availableDates.map((item) => (
                      <option key={item.date} value={item.date}>
                        {dayjs(item.date).format("DD MMM YYYY")} ({item.count})
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setSelectedDate(getTodayBangladeshDateString())}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        selectedDate === getTodayBangladeshDateString()
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Today
                    </button>

                    <button
                      onClick={() => setSelectedDate("")}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        selectedDate === ""
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      All Dates
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {statusKeys.map((statusKey) => (
                  <StatusFilterButton
                    key={statusKey}
                    statusKey={statusKey}
                    selectedStatus={selectedStatus}
                    onClick={() => setSelectedStatus(statusKey)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="pointer-events-auto inline-flex items-center gap-2 self-start rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <RefreshCcw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {!ordersWithCoords.length ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
            <div className="pointer-events-auto rounded-2xl border border-white/60 bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-lg backdrop-blur">
              No mapped orders found
              {selectedDate
                ? ` for ${dayjs(selectedDate).format("DD MMM YYYY")}`
                : " for all dates"}
              {selectedStatus !== "all"
                ? ` with ${getStatusConfig(selectedStatus).label} status`
                : ""}
              .{" "}
              {filteredOrders.length > 0
                ? "Some orders do not have location coordinates."
                : ""}
            </div>
          </div>
        ) : null}

        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      </div>
    </Layout>
  );
}

export default OrderMap;