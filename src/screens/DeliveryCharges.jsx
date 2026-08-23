import {createElement, useEffect, useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Alert, Button, InputNumber, Spin, Switch, Tag, message} from "antd";
import {
  Bike,
  Gift,
  MapPinned,
  RefreshCcw,
  Route,
  Ruler,
  Save,
  UserRound,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import {useAuth} from "../context/authContext";

const INITIAL_RATES = {
  riderFirstKMCharge: 0,
  riderOthersKMCharge: 0,
  userFirstKMCharge: 0,
  userOthersKMCharge: 0,
  googleRiderFirstKMCharge: 0,
  googleRiderOthersKMCharge: 0,
  googleUserFirstKMCharge: 0,
  googleUserOthersKMCharge: 0,
};

const RATE_FIELDS = Object.keys(INITIAL_RATES);

const money = value => `BDT ${Number(value || 0).toFixed(0)}`;

const calculateCharge = (distance, firstKm, nextKm) => {
  const safeDistance = Math.max(0, Number(distance) || 0);
  return Math.round(
    Number(firstKm || 0) + Math.max(safeDistance - 1, 0) * Number(nextKm || 0),
  );
};

const RateInput = ({label, value, onChange, addonBefore = "BDT", max = 10000}) => (
  <div>
    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </label>
    <InputNumber
      min={0}
      max={max}
      precision={2}
      value={value}
      onChange={nextValue => onChange(nextValue ?? 0)}
      addonBefore={addonBefore}
      className="w-full"
      size="large"
    />
  </div>
);

const RateCard = ({icon, title, description, accent, first, next, onFirst, onNext}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-4 flex items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {createElement(icon, {size: 19})}
      </div>
      <div>
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <RateInput label="First 1 KM" value={first} onChange={onFirst} />
      <RateInput label="Each next KM" value={next} onChange={onNext} />
    </div>
  </div>
);

function DeliveryCharges() {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const zoneId = user?.zoneId || user?.zoneID || null;
  const [rates, setRates] = useState(INITIAL_RATES);
  const [googleRoutesEnabled, setGoogleRoutesEnabled] = useState(false);
  const [straightLineFallbackEnabled, setStraightLineFallbackEnabled] = useState(true);
  const [customerFreeDeliveryEnabled, setCustomerFreeDeliveryEnabled] = useState(false);
  const [customerFreeDeliveryRadiusKm, setCustomerFreeDeliveryRadiusKm] = useState(0);
  const [previewDistance, setPreviewDistance] = useState(3);
  const [saving, setSaving] = useState(false);

  const configQuery = useQuery({
    queryKey: ["delivery-charge-config", zoneId],
    queryFn: async () => {
      const {data} = await api.get("/zone/delivery-charge");
      if (!data?.success) throw new Error(data?.message || "Configuration unavailable.");
      return data.result;
    },
    enabled: Boolean(zoneId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!configQuery.data) return;
    const nextRates = {};
    RATE_FIELDS.forEach(field => {
      nextRates[field] = Number(configQuery.data[field] || 0);
    });
    setRates(nextRates);
    setGoogleRoutesEnabled(configQuery.data.googleRoutesEnabled === true);
    setStraightLineFallbackEnabled(
      configQuery.data.straightLineFallbackEnabled !== false,
    );
    setCustomerFreeDeliveryEnabled(
      configQuery.data.customerFreeDeliveryEnabled === true,
    );
    setCustomerFreeDeliveryRadiusKm(
      Number(configQuery.data.customerFreeDeliveryRadiusKm || 0),
    );
  }, [configQuery.data]);

  const preview = useMemo(
    () => {
      const isCustomerFree =
        customerFreeDeliveryEnabled &&
        Number(customerFreeDeliveryRadiusKm) > 0 &&
        Number(previewDistance) <= Number(customerFreeDeliveryRadiusKm);

      return {
      straightCustomer: isCustomerFree ? 0 : calculateCharge(
        previewDistance,
        rates.userFirstKMCharge,
        rates.userOthersKMCharge,
      ),
      straightRider: calculateCharge(
        previewDistance,
        rates.riderFirstKMCharge,
        rates.riderOthersKMCharge,
      ),
      googleCustomer: isCustomerFree ? 0 : calculateCharge(
        previewDistance,
        rates.googleUserFirstKMCharge,
        rates.googleUserOthersKMCharge,
      ),
      googleRider: calculateCharge(
        previewDistance,
        rates.googleRiderFirstKMCharge,
        rates.googleRiderOthersKMCharge,
      ),
      isCustomerFree,
    };
    },
    [
      previewDistance,
      rates,
      customerFreeDeliveryEnabled,
      customerFreeDeliveryRadiusKm,
    ],
  );

  const setRate = (field, value) => {
    setRates(current => ({...current, [field]: Number(value || 0)}));
  };

  const saveConfiguration = async () => {
    const invalidField = RATE_FIELDS.find(field => {
      const value = Number(rates[field]);
      return !Number.isFinite(value) || value < 0 || value > 10000;
    });
    if (invalidField) {
      message.error("Every rate must be between BDT 0 and BDT 10,000.");
      return;
    }

    const freeRadiusKm = Number(customerFreeDeliveryRadiusKm);
    if (!Number.isFinite(freeRadiusKm) || freeRadiusKm < 0 || freeRadiusKm > 100) {
      message.error("Free delivery radius must be between 0 and 100 KM.");
      return;
    }
    if (customerFreeDeliveryEnabled && freeRadiusKm <= 0) {
      message.error("Set a radius greater than 0 KM before enabling free delivery.");
      return;
    }

    try {
      setSaving(true);
      const {data} = await api.put("/zone/delivery-charge", {
        ...rates,
        googleRoutesEnabled,
        straightLineFallbackEnabled,
        customerFreeDeliveryEnabled,
        customerFreeDeliveryRadiusKm: freeRadiusKm,
      });
      if (!data?.success) throw new Error(data?.message || "Update failed.");
      message.success(data.message || "Delivery charges updated.");
      await queryClient.invalidateQueries({
        queryKey: ["delivery-charge-config", zoneId],
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message || error?.message || "Update failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-3 md:p-5">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Food Verse Agent Delivery Control
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Delivery Charges
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Control customer charges and rider earnings separately for straight-line estimates and Google road routes in zone {zoneId || "N/A"}.
              </p>
            </div>
            <Button
              size="large"
              onClick={() => configQuery.refetch()}
              loading={configQuery.isFetching}
              className="!h-11 !rounded-2xl !border-slate-200 !px-5 !font-semibold">
              <div className="flex items-center gap-2"><RefreshCcw size={16} />Refresh</div>
            </Button>
          </div>

          {configQuery.isLoading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
              <Spin size="large" tip="Loading delivery charges..." />
            </div>
          ) : configQuery.isError ? (
            <Alert
              type="error"
              showIcon
              message="Delivery charge configuration could not be loaded."
              description={configQuery.error?.response?.data?.message || configQuery.error?.message}
              action={<Button onClick={() => configQuery.refetch()}>Try Again</Button>}
            />
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Configuration Source</p>
                  <p className="mt-2 text-xl font-black text-slate-950">{configQuery.data?.source === "zone" ? "Zone Rates" : "Global Fallback"}</p>
                </div>
                <div className="rounded-[24px] border border-cyan-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Google Route Mode</p>
                  <div className="mt-3"><Tag color={googleRoutesEnabled ? "success" : "default"}>{googleRoutesEnabled ? "ENABLED" : "DISABLED"}</Tag></div>
                </div>
                <div className="rounded-[24px] border border-emerald-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">API Key Status</p>
                  <div className="mt-3"><Tag color={configQuery.data?.googleRoutesConfigured ? "success" : "warning"}>{configQuery.data?.googleRoutesConfigured ? "CONFIGURED" : "NOT CONFIGURED"}</Tag></div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Customer Free Delivery</p>
                  <div className="mt-3"><Tag color={customerFreeDeliveryEnabled ? "success" : "default"}>{customerFreeDeliveryEnabled ? `UP TO ${customerFreeDeliveryRadiusKm} KM` : "DISABLED"}</Tag></div>
                </div>
              </div>

              {!configQuery.data?.googleRoutesConfigured ? (
                <Alert
                  className="mb-6"
                  type="warning"
                  showIcon
                  message="Google Routes API key is not configured yet"
                  description="You can save all rates now. Until GOOGLE_ROUTES_API_KEY is added to the server environment, checkout will safely use the straight-line fallback."
                />
              ) : null}

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                  <div className="mb-6 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white"><Ruler size={23} /></div>
                    <div><h2 className="text-xl font-black text-slate-950">Straight-Line Rates</h2><p className="mt-1 text-sm text-slate-500">Used on the homepage and as the safe fallback without API cost.</p></div>
                  </div>
                  <div className="space-y-4">
                    <RateCard icon={UserRound} title="Customer Charge" description="Estimated delivery charge shown before checkout." accent="bg-blue-100 text-blue-700" first={rates.userFirstKMCharge} next={rates.userOthersKMCharge} onFirst={value => setRate("userFirstKMCharge", value)} onNext={value => setRate("userOthersKMCharge", value)} />
                    <RateCard icon={Bike} title="Rider Earning" description="Used when an order falls back to straight-line distance." accent="bg-amber-100 text-amber-700" first={rates.riderFirstKMCharge} next={rates.riderOthersKMCharge} onFirst={value => setRate("riderFirstKMCharge", value)} onNext={value => setRate("riderOthersKMCharge", value)} />
                  </div>
                </section>

                <section className="rounded-[28px] border border-cyan-200 bg-white p-5 shadow-sm md:p-7">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white"><Route size={23} /></div>
                      <div><h2 className="text-xl font-black text-slate-950">Google Road-Route Rates</h2><p className="mt-1 text-sm text-slate-500">Applied only after checkout selects a delivery location.</p></div>
                    </div>
                    <Switch checked={googleRoutesEnabled} onChange={setGoogleRoutesEnabled} />
                  </div>
                  <div className="space-y-4">
                    <RateCard icon={UserRound} title="Customer Charge" description="Exact checkout charge based on road distance." accent="bg-cyan-100 text-cyan-700" first={rates.googleUserFirstKMCharge} next={rates.googleUserOthersKMCharge} onFirst={value => setRate("googleUserFirstKMCharge", value)} onNext={value => setRate("googleUserOthersKMCharge", value)} />
                    <RateCard icon={Bike} title="Rider Earning" description="Final rider earning for a Google-routed order." accent="bg-emerald-100 text-emerald-700" first={rates.googleRiderFirstKMCharge} next={rates.googleRiderOthersKMCharge} onFirst={value => setRate("googleRiderFirstKMCharge", value)} onNext={value => setRate("googleRiderOthersKMCharge", value)} />
                  </div>
                </section>
              </div>

              <section className="mt-6 rounded-[26px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white"><Gift size={21} /></div>
                    <div>
                      <p className="font-black text-emerald-950">Free delivery for customers</p>
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-emerald-800">Customers inside this distance pay BDT 0 delivery fee. Rider earnings remain fully calculated from the selected straight-line or Google rates.</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="w-44">
                      <RateInput label="Free radius" value={customerFreeDeliveryRadiusKm} onChange={setCustomerFreeDeliveryRadiusKm} addonBefore="KM" max={100} />
                    </div>
                    <div className="flex h-10 items-center pb-1">
                      <Switch checked={customerFreeDeliveryEnabled} onChange={setCustomerFreeDeliveryEnabled} />
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="font-black text-slate-900">Straight-line fallback</p><p className="mt-1 text-xs leading-5 text-slate-500">Keep ordering available if Google is disabled, missing, timed out or over quota.</p></div>
                    <Switch checked={straightLineFallbackEnabled} onChange={setStraightLineFallbackEnabled} />
                  </div>
                </section>

                <section className="rounded-[26px] border border-violet-200 bg-violet-50 p-5">
                  <div className="flex items-center gap-3"><MapPinned size={21} className="text-violet-700" /><h3 className="font-black text-violet-950">Rate Preview</h3></div>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <RateInput label="Example distance" value={previewDistance} onChange={setPreviewDistance} addonBefore="KM" />
                    <div className="grid flex-1 grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-500">Straight: Customer / Rider</p><p className="mt-1 font-black text-slate-900">{preview.isCustomerFree ? "FREE" : money(preview.straightCustomer)} / {money(preview.straightRider)}</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-xs text-slate-500">Google: Customer / Rider</p><p className="mt-1 font-black text-slate-900">{preview.isCustomerFree ? "FREE" : money(preview.googleCustomer)} / {money(preview.googleRider)}</p></div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="primary" size="large" loading={saving} onClick={saveConfiguration} className="!h-12 !rounded-2xl !bg-blue-600 !px-7 !font-bold"><div className="flex items-center gap-2"><Save size={17} />Save Delivery Charges</div></Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DeliveryCharges;
