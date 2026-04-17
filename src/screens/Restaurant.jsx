import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";
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
} from "lucide-react";
import { Button, Input, Modal, Select, Switch, message } from "antd";

const num = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) =>
  `TK ${num(value).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const getRestaurantBaseBalance = (restaurant) => {
  return num(
    restaurant?.balance ??
      restaurant?.walletBalance ??
      restaurant?.wallet ??
      restaurant?.amount ??
      0
  );
};

function Restaurant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [operator, setOperator] = useState("-");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [forceCloseAll, setForceCloseAll] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const limit = 6;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["restaurants", user?.zoneId, page],
    queryFn: async () => {
      const response = await api.post("/zone/restaurant-list", {
        zoneId: user?.zoneId,
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!user?.zoneId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const restaurantsRaw = data?.result || [];

  const restaurants = useMemo(() => {
    return restaurantsRaw.map((restaurant) => ({
      ...restaurant,
      balance: getRestaurantBaseBalance(restaurant),
      walletBalance: getRestaurantBaseBalance(restaurant),
    }));
  }, [restaurantsRaw]);

  const sortedRestaurantOptions = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => num(b.balance) - num(a.balance))
      .map((item) => ({
        value: item._id,
        label: `${item.restaurantName || item.name || "Restaurant"} — ${money(
          item.balance
        )}`,
      }));
  }, [restaurants]);

  const selectedRestaurant = useMemo(() => {
    return restaurants.find((item) => item._id === selectedRestaurantId) || null;
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

  const averageRating = useMemo(() => {
    if (!restaurants.length) return 0;
    const total = restaurants.reduce(
      (sum, item) =>
        sum + num(item?.rating ?? item?.avgRating ?? item?.averageRating ?? 5),
      0
    );
    return (total / restaurants.length).toFixed(1);
  }, [restaurants]);

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

      const { data } = await api.put("/zone/restaurant-payment", {
        amount: num(amount),
        restaurantId: selectedRestaurantId,
        note,
      });

      if (data?.success) {
        message.success(data?.message || "Restaurant payment successful");
        closeWalletModal();
        queryClient.invalidateQueries({ queryKey: ["restaurants"] });
        refetch();
      } else {
        message.error(data?.message || "Payment failed");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Restaurant payment failed"
      );
    } finally {
      setWalletLoading(false);
    }
  };

  const toggleForceCloseAll = (checked) => {
    setForceCloseAll(checked);
    message.success(
      checked
        ? "All restaurants are now force closed"
        : "All restaurants returned to normal status"
    );
  };

  const statCardClass =
    "rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg";

  const statCards = [
    {
      icon: <Store size={20} />,
      title: "Total Stores",
      value: data?.total || restaurants.length || 0,
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
      title: "Average Rating",
      value: averageRating,
      subtitle: "Partner rating",
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
                  {user?.zoneId || "N/A"}
                </span>{" "}
                • {data?.total || 0} active partners
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => refetch()}
                className="!h-11 !rounded-2xl !border-slate-200 !px-5 !font-semibold"
              >
                <div className="flex items-center gap-2">
                  <RefreshCcw size={15} className={isFetching ? "animate-spin" : ""} />
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
                <Switch checked={forceCloseAll} onChange={toggleForceCloseAll} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {statCards.map((item) => (
              <button
                key={item.title}
                onClick={item.action ? () => openWalletModal() : undefined}
                className={`${statCardClass} text-left ${
                  item.action ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrap}`}
                >
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
                {restaurants.map((res) => (
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="rounded-2xl border border-slate-200 bg-white px-6 py-2 font-bold text-slate-700 shadow-sm">
              Page {page}
            </span>

            <Button
              shape="round"
              disabled={restaurants.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
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
        title={null}
      >
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
              }`}
            >
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
              }`}
            >
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
                onChange={(e) => setAmount(e.target.value)}
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
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              onClick={closeWalletModal}
              className="!h-12 !rounded-2xl !border-slate-200 !font-semibold"
            >
              Cancel
            </Button>

            <Button
              onClick={handleWalletSubmit}
              loading={walletLoading}
              className={`!h-12 !rounded-2xl !border-0 !font-semibold !text-white hover:!text-white ${
                operator === "+"
                  ? "!bg-gradient-to-r !from-emerald-500 !to-cyan-500"
                  : "!bg-gradient-to-r !from-rose-500 !to-orange-500"
              }`}
            >
              {operator === "+" ? "Plus Not Connected" : "Submit Minus"}
            </Button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Live backend action available: minus via restaurant payment API. Plus balance needs a separate backend endpoint.
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default Restaurant;