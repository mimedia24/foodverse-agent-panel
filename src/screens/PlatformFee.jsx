import {useEffect, useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Button, Empty, InputNumber, Select, Spin, Switch, Tag, message} from "antd";
import {
  BadgeDollarSign,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import {useAuth} from "../context/authContext";

const money = value =>
  `BDT ${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getRestaurantName = restaurant =>
  restaurant?.restaurantName || restaurant?.name || "Unnamed Restaurant";

async function fetchAllRestaurants() {
  const limit = 100;
  const maxPages = 20;
  const restaurants = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const {data} = await api.post(
      "/zone/restaurant-list",
      {},
      {params: {page, limit}},
    );
    const rows = Array.isArray(data?.result) ? data.result : [];
    restaurants.push(...rows);

    if (rows.length < limit) break;
  }

  return Array.from(
    new Map(restaurants.map(restaurant => [restaurant._id, restaurant])).values(),
  );
}

function PlatformFee() {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const zoneId = user?.zoneId || user?.zoneID || null;
  const [amount, setAmount] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState();
  const [savingConfig, setSavingConfig] = useState(false);
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState(null);

  const configQuery = useQuery({
    queryKey: ["order-platform-fee", zoneId],
    queryFn: async () => {
      const {data} = await api.get("/zone/platform-fee");
      return data?.result || {};
    },
    enabled: Boolean(zoneId),
    refetchOnWindowFocus: false,
  });

  const restaurantsQuery = useQuery({
    queryKey: ["platform-fee-restaurants", zoneId],
    queryFn: fetchAllRestaurants,
    enabled: Boolean(zoneId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const config = configQuery.data || {};
  const restaurants = useMemo(
    () =>
      Array.isArray(restaurantsQuery.data)
        ? restaurantsQuery.data
        : [],
    [restaurantsQuery.data],
  );

  const exemptIds = useMemo(
    () =>
      new Set(
        (config.exemptRestaurantIds || []).map(item =>
          String(item?._id || item),
        ),
      ),
    [config.exemptRestaurantIds],
  );

  const exemptRestaurants = useMemo(() => {
    const restaurantMap = new Map(
      restaurants.map(restaurant => [String(restaurant._id), restaurant]),
    );

    return (config.exemptRestaurantIds || []).map(item => {
      const id = String(item?._id || item);
      return restaurantMap.get(id) || (typeof item === "object" ? item : {_id: id});
    });
  }, [config.exemptRestaurantIds, restaurants]);

  const availableRestaurantOptions = useMemo(
    () =>
      restaurants
        .filter(restaurant => !exemptIds.has(String(restaurant._id)))
        .sort((a, b) => getRestaurantName(a).localeCompare(getRestaurantName(b)))
        .map(restaurant => ({
          value: restaurant._id,
          label: `${getRestaurantName(restaurant)}${
            restaurant.phone ? ` - ${restaurant.phone}` : ""
          }`,
        })),
    [exemptIds, restaurants],
  );

  useEffect(() => {
    if (!configQuery.isSuccess) return;
    setAmount(Number(config.amount || 0));
    setEnabled(config.enabled === true);
  }, [config.amount, config.enabled, configQuery.isSuccess]);

  const refreshData = async () => {
    await Promise.all([configQuery.refetch(), restaurantsQuery.refetch()]);
    message.success("Platform fee information refreshed.");
  };

  const saveConfiguration = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0 || numericAmount > 10000) {
      message.error("Platform fee must be between BDT 0 and BDT 10,000.");
      return;
    }

    try {
      setSavingConfig(true);
      const {data} = await api.put("/zone/platform-fee", {
        amount: numericAmount,
        enabled,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Platform fee update failed.");
      }

      message.success(data.message || "Platform fee updated successfully.");
      await queryClient.invalidateQueries({
        queryKey: ["order-platform-fee", zoneId],
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Platform fee update failed.",
      );
    } finally {
      setSavingConfig(false);
    }
  };

  const updateExemption = async (restaurantId, exempt) => {
    if (!restaurantId) {
      message.error("Please select a restaurant.");
      return;
    }

    try {
      setUpdatingRestaurantId(String(restaurantId));
      const {data} = await api.put(
        `/zone/restaurants/${restaurantId}/platform-fee-exemption`,
        {exempt},
      );

      if (!data?.success) {
        throw new Error(data?.message || "Restaurant exemption update failed.");
      }

      message.success(data.message || "Restaurant exemption updated.");
      setSelectedRestaurantId(undefined);
      await queryClient.invalidateQueries({
        queryKey: ["order-platform-fee", zoneId],
      });
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Restaurant exemption update failed.",
      );
    } finally {
      setUpdatingRestaurantId(null);
    }
  };

  const isLoading = configQuery.isLoading || restaurantsQuery.isLoading;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3 md:p-5">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                Food Verse Agent Revenue Control
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Order Platform Fee
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Set one flat fee for every order in zone {zoneId || "N/A"}, or
                make selected restaurants completely fee-free.
              </p>
            </div>

            <Button
              size="large"
              onClick={refreshData}
              loading={configQuery.isFetching || restaurantsQuery.isFetching}
              className="!h-11 !rounded-2xl !border-slate-200 !px-5 !font-semibold">
              <div className="flex items-center gap-2">
                <RefreshCcw size={16} />
                Refresh
              </div>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <Spin size="large" tip="Loading platform fee..." />
            </div>
          ) : configQuery.isError || restaurantsQuery.isError ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center">
              <p className="font-bold text-rose-700">Platform fee information could not be loaded.</p>
              <p className="mt-2 text-sm text-rose-600">
                {configQuery.error?.response?.data?.message ||
                  restaurantsQuery.error?.response?.data?.message ||
                  "Check the server deployment and try again."}
              </p>
              <Button className="mt-5" onClick={refreshData}>Try Again</Button>
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[26px] border border-blue-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <BadgeDollarSign size={21} />
                  </div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Current Fee</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{money(config.amount)}</p>
                </div>

                <div className="rounded-[26px] border border-emerald-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={21} />
                  </div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Collection Status</p>
                  <div className="mt-2">
                    <Tag color={config.enabled ? "success" : "default"}>
                      {config.enabled ? "ACTIVE" : "DISABLED"}
                    </Tag>
                  </div>
                </div>

                <div className="rounded-[26px] border border-violet-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Store size={21} />
                  </div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Fee-Free Restaurants</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{exemptRestaurants.length}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                      <BadgeDollarSign size={23} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Zone Fee Configuration</h2>
                      <p className="mt-1 text-sm text-slate-500">Charged once per order, not once per menu item.</p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Platform fee amount</label>
                      <InputNumber
                        size="large"
                        min={0}
                        max={10000}
                        precision={2}
                        value={amount}
                        onChange={value => setAmount(value ?? 0)}
                        addonBefore="BDT"
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="font-bold text-slate-900">Collect platform fee</p>
                        <p className="mt-1 text-xs text-slate-500">Turn off to waive the fee for every restaurant in this zone.</p>
                      </div>
                      <Switch checked={enabled} onChange={setEnabled} />
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                      <strong>Safe behavior:</strong> saving BDT 0 or disabling collection makes the effective customer fee zero. Existing orders are never recalculated.
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={savingConfig}
                      onClick={saveConfiguration}
                      className="!h-12 !rounded-2xl !bg-blue-600 !font-bold">
                      Save Platform Fee
                    </Button>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                      <ShieldCheck size={23} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Restaurant Exemptions</h2>
                      <p className="mt-1 text-sm text-slate-500">Selected restaurants will always receive an effective fee of BDT 0.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Select
                      showSearch
                      allowClear
                      size="large"
                      value={selectedRestaurantId}
                      onChange={setSelectedRestaurantId}
                      options={availableRestaurantOptions}
                      optionFilterProp="label"
                      placeholder="Search and select restaurant"
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="primary"
                      size="large"
                      disabled={!selectedRestaurantId}
                      loading={
                        selectedRestaurantId &&
                        updatingRestaurantId === String(selectedRestaurantId)
                      }
                      onClick={() => updateExemption(selectedRestaurantId, true)}
                      className="!rounded-xl !bg-violet-600 !font-semibold">
                      Make Fee-Free
                    </Button>
                  </div>

                  <div className="mt-6 space-y-3">
                    {exemptRestaurants.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8">
                        <Empty description="No fee-free restaurant selected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      </div>
                    ) : (
                      exemptRestaurants.map(restaurant => {
                        const id = String(restaurant?._id || "");
                        return (
                          <div key={id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">{getRestaurantName(restaurant)}</p>
                              <p className="mt-1 truncate text-xs text-slate-500">{restaurant?.phone || restaurant?.address || id}</p>
                            </div>
                            <Button
                              danger
                              type="text"
                              icon={<Trash2 size={16} />}
                              loading={updatingRestaurantId === id}
                              onClick={() => updateExemption(id, false)}>
                              Remove
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>

              <div className="mt-6 rounded-[24px] border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
                This is the <strong>order-level platform fee</strong>. The existing menu-level platform markup in Menu Management remains separate and is not changed from this page.
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PlatformFee;
