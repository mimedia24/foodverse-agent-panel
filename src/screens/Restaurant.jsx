import React, {useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import {useAuth} from "../context/authContext";
import RestaurantDetails from "../components/ResturantDetails";
import {
  Store,
  Wallet,
  Star,
  ChevronLeft,
  ChevronRight,
  BadgeDollarSign,
  RefreshCcw,
  ShieldAlert,
  Minus,
  Plus,
  Flame,
  Trash2,
} from "lucide-react";
import {Button, Input, InputNumber, Modal, Select, Switch, message} from "antd";

const num = value => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const money = value =>
  `TK ${num(value).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const getRestaurantBaseBalance = restaurant => {
  return num(
    restaurant?.balance ??
      restaurant?.walletBalance ??
      restaurant?.wallet ??
      restaurant?.amount ??
      0,
  );
};

const updatePopularRestaurant = ({restaurantId, isPopular, position}) => {
  return api.put("/zone/restaurant/popular", {
    restaurantId,
    isPopular,
    position,
  });
};

const createRowsFromPopularRestaurants = (popularRestaurants = []) => {
  if (!Array.isArray(popularRestaurants) || popularRestaurants.length === 0) {
    return [
      {
        id: Date.now(),
        restaurantId: "",
        position: 1,
      },
    ];
  }

  return popularRestaurants
    .slice()
    .sort((a, b) => Number(a?.position || 999) - Number(b?.position || 999))
    .map((item, index) => ({
      id: `${item._id}-${index}-${Date.now()}`,
      restaurantId: item._id || "",
      position: Number(item.position || index + 1),
      name: item.restaurantName || item.name || "",
    }));
};

async function fetchAllRestaurants(zoneId) {
  const limit = 100;
  const maxPages = 20;
  let page = 1;
  let items = [];

  while (page <= maxPages) {
    const response = await api.post("/zone/restaurant-list", {
      zoneId,
      page,
      limit,
    });

    const rows = Array.isArray(response?.data?.result)
      ? response.data.result
      : [];

    items = [...items, ...rows];

    if (!rows.length || rows.length < limit) {
      break;
    }

    page += 1;
  }

  return Array.from(new Map(items.map(item => [item._id, item])).values());
}

function SetPopularRestaurantButton({
  queryKey,
  popularRestaurants = [],
  restaurantOptions = [],
}) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState(
    createRowsFromPopularRestaurants(popularRestaurants),
  );

  const openModal = () => {
    setRows(createRowsFromPopularRestaurants(popularRestaurants));
    setOpen(true);
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        restaurantId: "",
        position: prev.length + 1,
      },
    ]);
  };

  const removeRow = id => {
    setRows(prev => {
      if (prev.length === 1) {
        return [
          {
            id: Date.now(),
            restaurantId: "",
            position: 1,
          },
        ];
      }

      return prev.filter(item => item.id !== id);
    });
  };

  const updateRow = (id, key, value) => {
    setRows(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const cleanedRows = rows
      .map(item => ({
        restaurantId: String(item.restaurantId || "").trim(),
        position: Number(item.position || 0),
      }))
      .filter(item => item.restaurantId);

    const hasInvalidPosition = cleanedRows.some(
      item => !Number.isFinite(item.position) || item.position <= 0,
    );

    if (cleanedRows.length === 0) {
      message.error("Please select at least one restaurant.");
      return;
    }

    if (hasInvalidPosition) {
      message.error("Position must be greater than 0.");
      return;
    }

    const duplicateRestaurantIds = cleanedRows
      .map(item => item.restaurantId)
      .filter(
        (restaurantId, index, arr) => arr.indexOf(restaurantId) !== index,
      );

    if (duplicateRestaurantIds.length > 0) {
      message.error("Same restaurant ID cannot be used multiple times.");
      return;
    }

    const duplicatePositions = cleanedRows
      .map(item => item.position)
      .filter((position, index, arr) => arr.indexOf(position) !== index);

    if (duplicatePositions.length > 0) {
      message.error("Same position cannot be used multiple times.");
      return;
    }

    const submittedRestaurantIds = cleanedRows.map(item => item.restaurantId);

    const removedPopularRestaurants = popularRestaurants.filter(
      item => item?._id && !submittedRestaurantIds.includes(item._id),
    );

    try {
      setSaving(true);

      const turnOnRequests = cleanedRows.map(item =>
        updatePopularRestaurant({
          restaurantId: item.restaurantId,
          isPopular: true,
          position: item.position,
        }),
      );

      const turnOffRequests = removedPopularRestaurants.map(item =>
        updatePopularRestaurant({
          restaurantId: item._id,
          isPopular: false,
          position: 999,
        }),
      );

      const results = await Promise.allSettled([
        ...turnOnRequests,
        ...turnOffRequests,
      ]);

      const successCount = results.filter(
        result => result.status === "fulfilled" && result.value?.data?.success,
      ).length;

      const failedCount = results.length - successCount;

      if (successCount > 0) {
        message.success(
          `${cleanedRows.length} popular restaurant saved successfully.`,
        );

        queryClient.invalidateQueries({queryKey});
        queryClient.invalidateQueries({queryKey: ["restaurants"]});
        queryClient.invalidateQueries({
          queryKey: ["all-restaurants-for-popular"],
        });
      }

      if (failedCount > 0) {
        message.warning(
          `${failedCount} restaurant failed to update. Please retry.`,
        );
      }

      setRows(
        cleanedRows.map((item, index) => ({
          id: `${item.restaurantId}-${item.position}-${Date.now()}-${index}`,
          restaurantId: item.restaurantId,
          position: item.position,
        })),
      );
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to set popular restaurant.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        size="large"
        type="primary"
        icon={<Flame size={16} />}
        onClick={openModal}
        className="bg-purple-600">
        Set Popular Restaurant
      </Button>

      <Modal
        open={open}
        title="Set Popular Restaurant"
        onCancel={handleClose}
        onOk={handleSubmit}
        okText="Save Popular Restaurant"
        confirmLoading={saving}
        width={720}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <p className="text-sm font-semibold text-purple-800">
              Select restaurants from your own zone and give each one a unique
              display position. Saving replaces the current popular order.
            </p>
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="col-span-12 md:col-span-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {index + 1}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-7">
                  <Select
                    showSearch
                    value={row.restaurantId}
                    onChange={value =>
                      updateRow(row.id, "restaurantId", value)
                    }
                    options={restaurantOptions}
                    optionFilterProp="label"
                    placeholder="Select a zone restaurant"
                    allowClear
                    className="w-full"
                  />

                  {row.name ? (
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {row.name}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-10 md:col-span-3">
                  <InputNumber
                    min={1}
                    value={row.position}
                    onChange={value => updateRow(row.id, "position", value)}
                    placeholder="Position"
                    style={{width: "100%"}}
                  />
                </div>

                <div className="col-span-2 flex justify-end md:col-span-1">
                  <Button
                    danger
                    type="text"
                    icon={<Trash2 size={16} />}
                    onClick={() => removeRow(row.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button block type="dashed" icon={<Plus size={16} />} onClick={addRow}>
            Add another popular restaurant
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Restaurant() {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [operator, setOperator] = useState("-");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [forceCloseLoading, setForceCloseLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const limit = 6;

  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;

  const restaurantsQueryKey = ["restaurants", zoneId, page];
  const allRestaurantsQueryKey = ["all-restaurants-for-popular", zoneId];

  const {data, isLoading, refetch, isFetching} = useQuery({
    queryKey: restaurantsQueryKey,
    queryFn: async () => {
      const response = await api.post("/zone/restaurant-list", {
        zoneId,
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!zoneId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const {data: allRestaurantsRaw = []} = useQuery({
    queryKey: allRestaurantsQueryKey,
    queryFn: () => fetchAllRestaurants(zoneId),
    enabled: !!zoneId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const restaurantsRaw = useMemo(
    () => (Array.isArray(data?.result) ? data.result : []),
    [data?.result],
  );

  const restaurants = useMemo(() => {
    return restaurantsRaw.map(restaurant => ({
      ...restaurant,
      balance: getRestaurantBaseBalance(restaurant),
      walletBalance: getRestaurantBaseBalance(restaurant),
    }));
  }, [restaurantsRaw]);

  const allRestaurants = useMemo(() => {
    return Array.isArray(allRestaurantsRaw)
      ? allRestaurantsRaw.map(restaurant => ({
          ...restaurant,
          balance: getRestaurantBaseBalance(restaurant),
          walletBalance: getRestaurantBaseBalance(restaurant),
        }))
      : [];
  }, [allRestaurantsRaw]);

  const forceCloseAll = useMemo(
    () =>
      allRestaurants.length > 0 &&
      allRestaurants.every(
        restaurant =>
          restaurant?.forceClosedByAdmin === true &&
          restaurant?.isOpen === false,
      ),
    [allRestaurants],
  );

  const popularRestaurants = useMemo(() => {
    return allRestaurants
      .filter(item => item?.isPopular)
      .sort((a, b) => Number(a?.position || 999) - Number(b?.position || 999));
  }, [allRestaurants]);

  const sortedRestaurantOptions = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => num(b.balance) - num(a.balance))
      .map(item => ({
        value: item._id,
        label: `${item.restaurantName || item.name || "Restaurant"} — ${money(
          item.balance,
        )}`,
      }));
  }, [restaurants]);

  const selectedRestaurant = useMemo(() => {
    return restaurants.find(item => item._id === selectedRestaurantId) || null;
  }, [restaurants, selectedRestaurantId]);

  const previewBalance = useMemo(() => {
    if (!selectedRestaurant) return 0;
    const current = num(selectedRestaurant.balance);
    if (!amount) return current;
    return operator === "+" ? current + num(amount) : current - num(amount);
  }, [selectedRestaurant, amount, operator]);

  const totalBalance = useMemo(() => {
    return restaurants.reduce((sum, item) => sum + num(item.balance), 0);
  }, [restaurants]);

  const popularCount = useMemo(() => {
    return popularRestaurants.length;
  }, [popularRestaurants]);

  const openWalletModal = (restaurantId = "") => {
    setOperator("-");
    setSelectedRestaurantId(restaurantId);
    setWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setWalletModalOpen(false);
    setSelectedRestaurantId("");
    setAmount("");
    setNote("");
    setOperator("-");
  };

  const handleWalletSubmit = async () => {
    if (!selectedRestaurantId) {
      message.error("Please select a restaurant");
      return;
    }

    if (!num(amount)) {
      message.error("Please enter a valid amount");
      return;
    }

    if (operator === "+") {
      message.warning("Plus balance backend is not connected yet.");
      return;
    }

    try {
      setWalletLoading(true);

      const {data} = await api.put("/zone/restaurant-payment", {
        amount: num(amount),
        restaurantId: selectedRestaurantId,
        note,
      });

      if (data?.success) {
        message.success(data?.message || "Restaurant payment successful");
        closeWalletModal();
        queryClient.invalidateQueries({queryKey: ["restaurants"]});
        refetch();
      } else {
        message.error(data?.message || "Payment failed");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Restaurant payment failed",
      );
    } finally {
      setWalletLoading(false);
    }
  };

  const toggleForceCloseAll = async checked => {
    try {
      setForceCloseLoading(true);
      const {data: response} = await api.put("/zone/restaurants/force-close", {
        forceClosed: checked,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Force close update failed.");
      }

      const result = response?.result || {};
      message.success(
        `${response.message} Updated: ${result.modifiedCount || 0}, failed: ${
          result.failedCount || 0
        }.`,
      );
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ["restaurants"]}),
        queryClient.invalidateQueries({
          queryKey: ["all-restaurants-for-popular"],
        }),
        refetch(),
      ]);
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update Force Close All.",
      );
    } finally {
      setForceCloseLoading(false);
    }
  };

  const statCardClass =
    "rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg";

  const statCards = [
    {
      icon: <Store size={20} />,
      title: "Total Stores",
      value: data?.total || data?.totalCount || restaurants.length || 0,
      subtitle: "Active restaurants",
      iconWrap: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: <Wallet size={20} />,
      title: "Total Balance",
      value: money(totalBalance),
      subtitle: "Current wallet balance",
      iconWrap: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: <Star size={20} />,
      title: "Popular Stores",
      value: popularCount,
      subtitle: "Selected for app home",
      iconWrap: "bg-amber-100 text-amber-600",
    },
    {
      icon: <BadgeDollarSign size={20} />,
      title: "Balance Action",
      value: "Minus Live",
      subtitle: "Adjust restaurant money",
      iconWrap: "bg-rose-100 text-rose-600",
      action: true,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3 md:p-5">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                Food Verse Agent Restaurant Control
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Restaurant Partners
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Zone{" "}
                <span className="font-semibold text-blue-600">
                  {zoneId || "N/A"}
                </span>{" "}
                • {data?.total || data?.totalCount || restaurants.length || 0}{" "}
                active partners
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <SetPopularRestaurantButton
                queryKey={restaurantsQueryKey}
                popularRestaurants={popularRestaurants}
                restaurantOptions={allRestaurants.map(item => ({
                  value: item._id,
                  label: item.restaurantName || item.name || item._id,
                }))}
              />

              <Button
                onClick={() => refetch()}
                className="!h-11 !rounded-2xl !border-slate-200 !px-5 !font-semibold">
                <div className="flex items-center gap-2">
                  <RefreshCcw
                    size={15}
                    className={isFetching ? "animate-spin" : ""}
                  />
                  Refresh Restaurants
                </div>
              </Button>

              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Force Close All
                  </p>
                  <p className="text-xs text-slate-500">
                    Restaurants cannot reopen while enabled
                  </p>
                </div>
                <Switch
                  checked={forceCloseAll}
                  loading={forceCloseLoading}
                  onChange={toggleForceCloseAll}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {statCards.map(item => (
              <button
                key={item.title}
                onClick={item.action ? () => openWalletModal() : undefined}
                className={`${statCardClass} text-left ${
                  item.action ? "cursor-pointer" : "cursor-default"
                }`}>
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                  {item.icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  {item.title}
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-950 md:text-2xl">
                  {item.value}
                </h3>
                <p className="mt-2 text-xs text-slate-500 md:text-sm">
                  {item.subtitle}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] border border-purple-200 bg-purple-50 p-4 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-purple-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    Zone Based Popular Restaurant
                  </h3>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Click Set Popular Restaurant, paste restaurant ID and set
                  position. Lower position will show first in the customer app.
                </p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-purple-700 shadow-sm">
                Popular Selected: {popularCount}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center py-20 opacity-70">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  Loading restaurants...
                </p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="rounded-[30px] border border-slate-200 bg-white p-16 text-center shadow-sm">
                <Store size={42} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">
                  No Restaurants Found
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  There are no partners registered in this zone.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {restaurants.map(res => (
                  <div key={res._id} className="min-w-0">
                    <RestaurantDetails
                      res={res}
                      forceClosed={forceCloseAll}
                      onOpenWallet={openWalletModal}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <Button
              shape="round"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft size={16} />
            </Button>

            <span className="rounded-2xl border border-slate-200 bg-white px-6 py-2 font-bold text-slate-700 shadow-sm">
              Page {page}
            </span>

            <Button
              shape="round"
              disabled={restaurants.length < limit}
              onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={walletModalOpen}
        onCancel={closeWalletModal}
        footer={null}
        centered
        width={620}
        title={null}>
        <div className="p-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-600">
                Restaurant Wallet Management
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Adjust Restaurant Balance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Minus is connected to backend. Plus needs backend endpoint.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <BadgeDollarSign size={22} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setOperator("-")}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                operator === "-"
                  ? "border-red-200 bg-red-500 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <Minus size={16} />
                Minus
              </div>
            </button>

            <button
              onClick={() => {
                setOperator("+");
                message.info("Plus balance backend is not connected yet.");
              }}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                operator === "+"
                  ? "border-emerald-200 bg-emerald-500 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <Plus size={16} />
                Plus
              </div>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Restaurant
              </label>
              <Select
                value={selectedRestaurantId || undefined}
                onChange={setSelectedRestaurantId}
                placeholder="Select restaurant"
                className="w-full"
                size="large"
                options={sortedRestaurantOptions}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Current Balance
              </label>
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                {selectedRestaurant ? money(selectedRestaurant.balance) : "TK 0"}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Amount
              </label>
              <Input
                size="large"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Result Preview
              </label>
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                {selectedRestaurant ? money(previewBalance) : "TK 0"}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Action Time
              </label>
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                {new Date().toLocaleString()}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Note
              </label>
              <Input
                size="large"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              onClick={closeWalletModal}
              className="!h-12 !rounded-2xl !border-slate-200 !font-semibold">
              Cancel
            </Button>

            <Button
              onClick={handleWalletSubmit}
              loading={walletLoading}
              className={`!h-12 !rounded-2xl !border-0 !font-semibold !text-white hover:!text-white ${
                operator === "+"
                  ? "!bg-gradient-to-r !from-emerald-500 !to-cyan-500"
                  : "!bg-gradient-to-r !from-rose-500 !to-orange-500"
              }`}>
              {operator === "+" ? "Plus Not Connected" : "Submit Minus"}
            </Button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Live backend action available: minus via restaurant payment API. Plus
            balance needs a separate backend endpoint.
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default Restaurant;
