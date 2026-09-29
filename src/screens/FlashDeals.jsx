import React, { useEffect, useState } from "react";
import { Button, DatePicker, Input, InputNumber, Select, Tag, message } from "antd";
import dayjs from "dayjs";
import { Flame, Pause, Play, Plus, Trash2 } from "lucide-react";
import { CircleMarker, MapContainer, Polygon, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";

const makeInitial = () => ({
  title: "", subtitle: "Limited time offer", badgeText: "FLASH DEAL", discountRate: 10,
  targetMode: "restaurants", fundingMode: "restaurant", platformSharePercent: 0,
  restaurantIds: [], menuIds: [], startAt: null, endAt: null,
  usageLimit: null, perUserLimit: null,
  geoScope: { mode: "ZONE", zoneIds: [], polygon: [] },
});

const normalizePoint = (point) => ({
  latitude: Number(point?.latitude ?? point?.lat),
  longitude: Number(point?.longitude ?? point?.lng ?? point?.long),
});

function MapClick({ onAdd }) {
  useMapEvents({ click: ({ latlng }) => onAdd({ latitude: Number(latlng.lat.toFixed(6)), longitude: Number(latlng.lng.toFixed(6)) }) });
  return null;
}

function FitZone({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 3) map.fitBounds(L.latLngBounds(points.map((p) => [p.latitude, p.longitude])), { padding: [20, 20] });
  }, [map, points]);
  return null;
}

function AreaEditor({ zone, points, onChange }) {
  const zonePolygon = (zone?.polygon || []).map(normalizePoint)
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        <span>Click inside your zone ({points.length} points)</span>
        <div className="flex gap-2">
          <Button size="small" disabled={!points.length} onClick={() => onChange(points.slice(0, -1))}>Undo</Button>
          <Button danger size="small" disabled={!points.length} onClick={() => onChange([])}>Clear</Button>
        </div>
      </div>
      <MapContainer center={[23.8103, 90.4125]} zoom={12} className="h-[330px] w-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitZone points={zonePolygon} />
        <MapClick onAdd={(point) => onChange([...points, point])} />
        {zonePolygon.length >= 3 && <Polygon positions={zonePolygon.map((p) => [p.latitude, p.longitude])} pathOptions={{ color: "#64748b", fillOpacity: 0.08 }} />}
        {points.length >= 3 && <Polygon positions={points.map((p) => [p.latitude, p.longitude])} pathOptions={{ color: "#db2777", weight: 3, fillOpacity: 0.25 }} />}
        {points.map((p, index) => <CircleMarker key={`${p.latitude}-${p.longitude}-${index}`} center={[p.latitude, p.longitude]} radius={6} pathOptions={{ color: "#db2777", fillOpacity: 1 }} />)}
      </MapContainer>
    </div>
  );
}

export default function FlashDeals() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState(makeInitial);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zone, setZone] = useState(null);

  const load = async () => {
    const [offersResponse, restaurantsResponse] = await Promise.all([
      api.get("/zone/flash-offers"),
      api.post("/zone/restaurant-list", { page: 1, limit: 100 }),
    ]);
    setOffers(offersResponse.data?.result || []);
    setRestaurants(restaurantsResponse.data?.result || []);
  };

  useEffect(() => { load().catch(() => message.error("Could not load flash deals")); }, []);
  useEffect(() => {
    api.get("/app/user/zone-list").then((response) => {
      const zones = response.data?.result?.data || response.data?.data || [];
      setZone(zones.find((item) => Number(item.id ?? item.zoneId) === Number(user?.zoneId)) || null);
    }).catch(() => setZone(null));
  }, [user?.zoneId]);
  useEffect(() => {
    Promise.all(form.restaurantIds.map((id) => api.get(`/zone/restaurant/menu-list/${id}`)))
      .then((rows) => setMenus(rows.flatMap((row) => row.data?.result || [])))
      .catch(() => setMenus([]));
  }, [form.restaurantIds]);

  const save = async () => {
    if (!form.title || !form.startAt || !form.endAt || (!form.restaurantIds.length && !form.menuIds.length)) return message.error("Title, dates and a target are required");
    if (form.geoScope.mode === "POLYGON" && form.geoScope.polygon.length < 3) return message.error("Draw at least 3 points inside your zone");
    setLoading(true);
    try {
      const payload = {
        ...form,
        geoScope: { ...form.geoScope, zoneIds: [Number(user?.zoneId)] },
        startAt: form.startAt.toISOString(),
        endAt: form.endAt.toISOString(),
      };
      if (editing) await api.put(`/zone/flash-offers/${editing}`, payload);
      else await api.post("/zone/flash-offers", payload);
      message.success(editing ? "Flash deal updated" : "Flash deal created");
      setForm(makeInitial()); setEditing(null); await load();
    } catch (error) {
      message.error(error.response?.data?.message || "Save failed");
    } finally { setLoading(false); }
  };

  const patchStatus = async (id, status) => {
    try { await api.patch(`/zone/flash-offers/${id}/status`, { status }); await load(); }
    catch (error) { message.error(error.response?.data?.message || "Status update failed"); }
  };

  return (
    <Layout><div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[.25em] text-blue-600">Campaign management</p><h1 className="text-3xl font-black">Flash Deals</h1></div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setForm(makeInitial()); setEditing(null); }}>New deal</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {offers.map((offer) => <div key={offer._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><div className="flex gap-2"><Tag color="purple">{offer.status}</Tag><Tag color={offer.geoScope?.mode === "POLYGON" ? "magenta" : "blue"}>{offer.geoScope?.mode === "POLYGON" ? "Selected area" : "Entire zone"}</Tag></div><h3 className="mt-2 text-lg font-bold">{offer.title} · {offer.discountRate}%</h3><p className="text-slate-500">{offer.subtitle}</p><p className="mt-2 text-xs text-slate-500">{new Date(offer.startAt).toLocaleString()} → {new Date(offer.endAt).toLocaleString()} · Used {offer.usedCount || 0}{offer.usageLimit ? `/${offer.usageLimit}` : ""}</p></div><Flame className="text-pink-600" /></div>
            <div className="mt-4 flex flex-wrap gap-2"><Button size="small" onClick={() => { setEditing(offer._id); setForm({ ...offer, geoScope: offer.geoScope || { mode: "ZONE", zoneIds: [Number(user?.zoneId)], polygon: [] }, startAt: dayjs(offer.startAt), endAt: dayjs(offer.endAt) }); }}>Edit</Button>{offer.status === "active" ? <Button size="small" icon={<Pause size={14} />} onClick={() => patchStatus(offer._id, "paused")}>Pause</Button> : <Button size="small" icon={<Play size={14} />} onClick={() => patchStatus(offer._id, "active")}>Activate</Button>}<Button danger size="small" icon={<Trash2 size={14} />} onClick={() => api.delete(`/zone/flash-offers/${offer._id}`).then(load).catch((error) => message.error(error.response?.data?.message || "Cannot delete"))}>Delete</Button></div>
          </div>)}
          {!offers.length && <div className="rounded-2xl bg-white p-10 text-center text-slate-500">No flash deals yet.</div>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">{editing ? "Edit deal" : "Create deal"}</h2>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <div className="flex gap-2">{[10, 15, 20].map((rate) => <Button key={rate} type={form.discountRate === rate ? "primary" : "default"} onClick={() => setForm({ ...form, discountRate: rate })}>{rate}%</Button>)}<InputNumber min={1} max={100} value={form.discountRate} onChange={(value) => setForm({ ...form, discountRate: value })} /></div>
            <Select className="w-full" placeholder="Restaurants" mode="multiple" value={form.restaurantIds} options={restaurants.map((restaurant) => ({ value: restaurant._id, label: restaurant.name }))} onChange={(value) => setForm({ ...form, restaurantIds: value, targetMode: value.length ? "restaurants" : form.targetMode })} />
            <Select className="w-full" placeholder="Optional items" mode="multiple" value={form.menuIds} options={menus.map((menu) => ({ value: menu._id, label: menu.name }))} onChange={(value) => setForm({ ...form, menuIds: value, targetMode: value.length && form.restaurantIds.length ? "restaurant_items" : value.length ? "items" : "restaurants" })} />
            <Select className="w-full" value={form.fundingMode} options={[{ value: "restaurant", label: "Restaurant funded" }, { value: "platform", label: "Platform funded" }, { value: "split", label: "Split funded" }]} onChange={(value) => setForm({ ...form, fundingMode: value })} />
            {form.fundingMode === "split" && <InputNumber className="w-full" min={0} max={100} addonBefore="Platform share %" value={form.platformSharePercent} onChange={(value) => setForm({ ...form, platformSharePercent: value })} />}
            <Select className="w-full" value={form.geoScope.mode} options={[{ value: "ZONE", label: "Entire zone" }, { value: "POLYGON", label: "Selected area inside my zone" }]} onChange={(mode) => setForm({ ...form, geoScope: { mode, zoneIds: [Number(user?.zoneId)], polygon: [] } })} />
            {form.geoScope.mode === "POLYGON" && <AreaEditor zone={zone} points={form.geoScope.polygon || []} onChange={(polygon) => setForm({ ...form, geoScope: { ...form.geoScope, polygon } })} />}
            <div className="grid grid-cols-2 gap-2"><DatePicker showTime className="w-full" value={form.startAt} onChange={(value) => setForm({ ...form, startAt: value })} /><DatePicker showTime className="w-full" value={form.endAt} onChange={(value) => setForm({ ...form, endAt: value })} /></div>
            <div className="grid grid-cols-2 gap-2"><InputNumber className="w-full" placeholder="Total limit" value={form.usageLimit} onChange={(value) => setForm({ ...form, usageLimit: value })} /><InputNumber className="w-full" placeholder="Per-user limit" value={form.perUserLimit} onChange={(value) => setForm({ ...form, perUserLimit: value })} /></div>
            <Button block type="primary" loading={loading} onClick={save}>{editing ? "Update" : "Create"} flash deal</Button>
          </div>
        </div>
      </div>
    </div></Layout>
  );
}
