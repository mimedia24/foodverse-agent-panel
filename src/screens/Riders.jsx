import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message,
  Avatar,
} from "antd";
import {
  Bike,
  Search,
  Plus,
  Wallet,
  ArrowDownToLine,
  Phone,
  Mail,
  MapPin,
  Coins,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";
import { normalizeImageUrl } from "../utils/image";
import { Link } from "react-router";

const RIDER_STATUS_OPTIONS = [
  "waiting for approved",
  "active",
  "busy",
  "banned",
];

const SESSION_OPTIONS = ["available", "out for delivery", "break", "offline"];

const PAYMENT_STATUS_OPTIONS = ["Pending", "Processing", "Completed", "Invalid"];

const num = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) =>
  `BDT ${num(value).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value?._id || value?.id || value?.riderId || "");
  }
  return String(value);
};

const getListFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.withdraws)) return payload.withdraws;
  if (Array.isArray(payload?.collections)) return payload.collections;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const uniqueById = (rows = []) => {
  const map = new Map();

  rows.filter(Boolean).forEach((item, index) => {
    const key =
      item?._id ||
      item?.id ||
      item?.paymentId ||
      item?.transactionId ||
      `${getPaymentRiderId(item)}-${item?.amount}-${item?.createdAt}-${index}`;

    map.set(String(key), item);
  });

  return Array.from(map.values());
};

const getName = (rider) =>
  rider?.name || rider?.fullName || rider?.riderName || "Unnamed Rider";

const getPhone = (rider) =>
  rider?.phone || rider?.phoneNumber || rider?.number || "N/A";

const getEmail = (rider) => rider?.email || "N/A";

const getAddress = (rider) => rider?.address || rider?.location || "N/A";

const getImage = (rider) => {
  const file = rider?.profileImage || rider?.image || "";
  return normalizeImageUrl(file);
};

const getAccountStatus = (rider) =>
  rider?.riderStatus || rider?.status || "waiting for approved";

const getSessionStatus = (rider) =>
  rider?.session || rider?.currentSession || "offline";

const getCash = (rider) => num(rider?.cashCollection ?? rider?.cash ?? 0);

const getEarning = (rider) => num(rider?.earning ?? 0);

const getZoneId = (item) => {
  const value =
    item?.zoneId ||
    item?.zoneID ||
    item?.zone_id ||
    item?.zone?.zoneId ||
    item?.zone?.id ||
    item?.zone?._id ||
    item?.assignedZone?.zoneId ||
    item?.assignedZone?._id ||
    item?.agentZone?.zoneId ||
    item?.agentZone?._id;

  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const getZoneName = (item) => {
  const zoneId = getZoneId(item);

  return (
    item?.zoneName ||
    item?.zone_name ||
    item?.zone?.zoneName ||
    item?.zone?.name ||
    item?.assignedZone?.zoneName ||
    item?.assignedZone?.name ||
    item?.agentZone?.zoneName ||
    item?.agentZone?.name ||
    (zoneId ? `Zone #${zoneId}` : "Zone")
  );
};

const getStatusColor = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "active") return "green";
  if (value === "busy") return "orange";
  if (value === "waiting for approved") return "blue";
  if (value === "banned") return "red";

  return "default";
};

const getSessionColor = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "available") return "green";
  if (value === "out for delivery") return "orange";
  if (value === "break") return "gold";
  if (value === "offline") return "red";

  return "default";
};

const getPaymentRiderId = (row) => {
  return normalizeId(
    row?.riderId ||
      row?.rider ||
      row?.riderInfo ||
      row?.riderDetails ||
      row?.userId ||
      row?.user
  );
};

const getPaymentRiderPhone = (row) => {
  return (
    row?.phone ||
    row?.phoneNumber ||
    row?.riderPhone ||
    row?.riderId?.phoneNumber ||
    row?.riderId?.phone ||
    row?.rider?.phoneNumber ||
    row?.rider?.phone ||
    "N/A"
  );
};

const getPaymentZoneId = (row) => {
  const value =
    row?.zoneId ||
    row?.zoneID ||
    row?.zone_id ||
    row?.riderId?.zoneId ||
    row?.riderId?.zoneID ||
    row?.rider?.zoneId ||
    row?.rider?.zoneID ||
    row?.riderInfo?.zoneId ||
    row?.riderDetails?.zoneId;

  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const filterPaymentRowsByZoneRiders = (rows, zoneRiders, agentZoneId) => {
  const allowedRiderIds = new Set(
    (Array.isArray(zoneRiders) ? zoneRiders : [])
      .map((rider) => normalizeId(rider?._id || rider?.id))
      .filter(Boolean)
  );

  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const rowZoneId = getPaymentZoneId(row);

    if (rowZoneId && Number(rowZoneId) === Number(agentZoneId)) {
      return true;
    }

    const rowRiderId = getPaymentRiderId(row);

    if (rowRiderId && allowedRiderIds.has(String(rowRiderId))) {
      return true;
    }

    return false;
  });
};

async function fetchPaginatedGet(urlBuilder, maxPages = 30) {
  const limit = 100;
  let page = 1;
  let rows = [];

  while (page <= maxPages) {
    try {
      const response = await api.get(urlBuilder(page, limit));

      const chunk = getListFromPayload(response?.data);

      rows = [...rows, ...chunk];

      const total = Number(
        response?.data?.total ||
          response?.data?.totalCount ||
          response?.data?.count ||
          0
      );

      if (!chunk.length) break;
      if (chunk.length < limit) break;
      if (total && rows.length >= total) break;

      page += 1;
    } catch {
      break;
    }
  }

  return rows;
}

async function fetchZoneRiders(zoneId) {
  const limit = 100;
  let page = 1;
  let rows = [];

  while (page <= 30) {
    const response = await api.post(`/zone/rider-list?limit=${limit}&page=${page}`, {
      zoneId,
    });

    const payload = response?.data;

    const chunk = Array.isArray(payload?.result)
      ? payload.result
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.riders)
      ? payload.riders
      : [];

    rows = [...rows, ...chunk];

    if (!chunk.length || chunk.length < limit) break;

    page += 1;
  }

  return uniqueById(rows);
}

async function fetchWithdrawRows(zoneId) {
  const rows = await fetchPaginatedGet(
    (page, limit) =>
      `/zone/payment/rider/withdraw-list?page=${page}&limit=${limit}&zoneId=${zoneId}`
  );

  return uniqueById(rows);
}

async function fetchCollectionRows(zoneId) {
  const rows = await fetchPaginatedGet(
    (page, limit) =>
      `/zone/payment/rider/cashcollection-list?page=${page}&limit=${limit}&zoneId=${zoneId}`
  );

  return uniqueById(rows);
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      {React.createElement(Icon, {
        size: 15,
        className: "mt-0.5 text-blue-500",
      })}
      <span className="break-all">{value}</span>
    </div>
  );
}

function RiderCard({
  rider,
  onStatusChange,
  onSessionChange,
  onDelete,
  localStatus,
  localSession,
}) {
  const status = localStatus || getAccountStatus(rider);
  const currentSession = localSession || getSessionStatus(rider);
  const avatarSrc = getImage(rider);
  const riderZoneId = getZoneId(rider);
  const riderZoneName = getZoneName(rider);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            size={70}
            src={avatarSrc || undefined}
            className="!bg-slate-100 !text-slate-500"
          >
            {getName(rider)?.[0] || "R"}
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-black text-slate-900">
                {getName(rider)}
              </h3>

              {rider?.isVerify ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              ) : null}
            </div>

            <p className="mt-1 break-all text-sm text-slate-500">
              Rider ID: {rider?._id}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(rider)}
          className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            Rider Status:
          </span>
          <Tag color={getStatusColor(status)}>{status}</Tag>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            Current Session:
          </span>
          <Tag color={getSessionColor(currentSession)}>{currentSession}</Tag>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-blue-700">
              Assigned Zone:
            </span>

            <Tag color="blue">
              {riderZoneName} {riderZoneId ? `#${riderZoneId}` : ""}
            </Tag>
          </div>
        </div>

        <div className="grid gap-3">
          <InfoRow icon={Phone} value={getPhone(rider)} />
          <InfoRow icon={Mail} value={getEmail(rider)} />
          <InfoRow icon={MapPin} value={getAddress(rider)} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="rounded-2xl bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <Coins size={14} className="text-amber-500" />
              Earning
            </div>

            <p className="mt-2 text-base font-black text-slate-900">
              {money(getEarning(rider))}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <CircleDollarSign size={14} className="text-emerald-500" />
              Cash
            </div>

            <p className="mt-2 text-base font-black text-slate-900">
              {money(getCash(rider))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select
            value={status}
            onChange={(value) => onStatusChange(rider, value)}
            options={RIDER_STATUS_OPTIONS.map((item) => ({
              value: item,
              label: item,
            }))}
            className="w-full"
          />

          <Select
            value={currentSession}
            onChange={(value) => onSessionChange(rider, value)}
            options={SESSION_OPTIONS.map((item) => ({
              value: item,
              label: item,
            }))}
            className="w-full"
          />
        </div>

        <Link to={`/rider-payment/${rider._id}`}>
          <Button type="primary" block icon={<Wallet size={16} />}>
            Pay Rider from Earning
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Riders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const agentZoneId = Number(
    user?.zoneId ||
      user?.zoneID ||
      user?.zone_id ||
      user?.zone?.zoneId ||
      user?.zone?.id ||
      user?.zone?._id ||
      user?.assignedZone?.zoneId ||
      user?.assignedZone?._id ||
      user?.agentZone?.zoneId ||
      user?.agentZone?._id ||
      1
  );

  const agentZoneName =
    user?.zoneName ||
    user?.zone_name ||
    user?.zone?.zoneName ||
    user?.zone?.name ||
    user?.assignedZone?.zoneName ||
    user?.assignedZone?.name ||
    user?.agentZone?.zoneName ||
    user?.agentZone?.name ||
    `Zone #${agentZoneId}`;

  const [searchType, setSearchType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const [statusOverrides, setStatusOverrides] = useState({});
  const [sessionOverrides, setSessionOverrides] = useState({});

  const pageSize = 6;

  const {
    data: ridersData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["riders", agentZoneId],
    queryFn: () => fetchZoneRiders(agentZoneId),
    enabled: !!agentZoneId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const {
    data: rawWithdrawData = [],
    isFetching: withdrawFetching,
    refetch: refetchWithdraw,
  } = useQuery({
    queryKey: ["rider-withdraw-list", agentZoneId],
    queryFn: () => fetchWithdrawRows(agentZoneId),
    enabled: !!agentZoneId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const {
    data: rawCollectionData = [],
    isFetching: collectionFetching,
    refetch: refetchCollection,
  } = useQuery({
    queryKey: ["rider-cash-collection-list", agentZoneId],
    queryFn: () => fetchCollectionRows(agentZoneId),
    enabled: !!agentZoneId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const riders = useMemo(() => {
    return (Array.isArray(ridersData) ? ridersData : []).map((item) => ({
      ...item,
      riderStatus: statusOverrides[item._id] || getAccountStatus(item),
      session: sessionOverrides[item._id] || getSessionStatus(item),
    }));
  }, [ridersData, statusOverrides, sessionOverrides]);

  const withdrawData = useMemo(() => {
    return filterPaymentRowsByZoneRiders(
      rawWithdrawData,
      ridersData,
      agentZoneId
    );
  }, [rawWithdrawData, ridersData, agentZoneId]);

  const collectionData = useMemo(() => {
    return filterPaymentRowsByZoneRiders(
      rawCollectionData,
      ridersData,
      agentZoneId
    );
  }, [rawCollectionData, ridersData, agentZoneId]);

  const filteredRiders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return riders.filter((rider) => {
      const riderId = String(rider?._id || "").toLowerCase();
      const phone = String(getPhone(rider) || "").toLowerCase();
      const name = String(getName(rider) || "").toLowerCase();

      const searchMatched =
        !keyword ||
        (searchType === "all" &&
          (riderId.includes(keyword) ||
            phone.includes(keyword) ||
            name.includes(keyword))) ||
        (searchType === "phone" && phone.includes(keyword)) ||
        (searchType === "id" && riderId.includes(keyword));

      const filterMatched =
        filterStatus === "all" ||
        String(getAccountStatus(rider) || "").toLowerCase() ===
          filterStatus.toLowerCase();

      return searchMatched && filterMatched;
    });
  }, [riders, searchTerm, searchType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRiders.length / pageSize));

  const paginatedRiders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRiders.slice(start, start + pageSize);
  }, [filteredRiders, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    return {
      total: riders.length,
      active: riders.filter(
        (item) =>
          String(getAccountStatus(item) || "").toLowerCase() === "active"
      ).length,
      totalEarning: riders.reduce((sum, item) => sum + getEarning(item), 0),
      totalCash: riders.reduce((sum, item) => sum + getCash(item), 0),
    };
  }, [riders]);

  const updateRiderStatus = async (rider, value) => {
    setStatusOverrides((prev) => ({ ...prev, [rider._id]: value }));

    try {
      const response = await api.request({
        method: "put",
        url: "/zone/rider/update-account-status",
        data: {
          riderId: rider._id,
          status: value,
          zoneId: agentZoneId,
        },
        validateStatus: () => true,
      });

      if (response?.data?.success) {
        queryClient.invalidateQueries({ queryKey: ["riders", agentZoneId] });
        message.success("Rider status updated");
      } else {
        throw new Error(response?.data?.message || "Update failed");
      }
    } catch (error) {
      setStatusOverrides((prev) => ({
        ...prev,
        [rider._id]: getAccountStatus(rider),
      }));
      message.error(error?.message || "Failed to update rider status");
    }
  };

  const updateRiderSession = async (rider, value) => {
    setSessionOverrides((prev) => ({ ...prev, [rider._id]: value }));

    try {
      const response = await api.request({
        method: "put",
        url: "/zone/rider/update-session-status",
        data: {
          riderId: rider._id,
          session: value,
          zoneId: agentZoneId,
        },
        validateStatus: () => true,
      });

      if (response?.data?.success) {
        queryClient.invalidateQueries({ queryKey: ["riders", agentZoneId] });
        message.success("Rider session updated");
      } else {
        throw new Error(response?.data?.message || "Update failed");
      }
    } catch (error) {
      setSessionOverrides((prev) => ({
        ...prev,
        [rider._id]: getSessionStatus(rider),
      }));
      message.error(error?.message || "Failed to update rider session");
    }
  };

  const deleteRider = async (rider) => {
    try {
      const { data } = await api.delete(
        `/zone/rider/delete/${rider._id}?zoneId=${agentZoneId}`
      );

      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["riders", agentZoneId] });
        message.success("Rider deleted");
      } else {
        message.error(data?.message || "Delete failed");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const updateWithdrawStatus = async (row, status) => {
    try {
      const response = await api.request({
        method: "put",
        url: "/zone/payment/rider-withdraw-status",
        data: {
          withdrawId: row._id,
          paymentId: row._id,
          status,
          zoneId: agentZoneId,
        },
        validateStatus: () => true,
      });

      if (response?.data?.success) {
        message.success(response?.data?.message || "Withdraw status updated");

        await Promise.all([
          refetchWithdraw(),
          queryClient.invalidateQueries({
            queryKey: ["rider-withdraw-list", agentZoneId],
          }),
        ]);
      } else {
        throw new Error(
          response?.data?.message || "Failed to update withdraw status"
        );
      }
    } catch (error) {
      message.error(error?.message || "Failed to update withdraw status");
    }
  };

  const updateCollectionStatus = async (row, status) => {
    try {
      const response = await api.request({
        method: "put",
        url: "/zone/payment/rider-collection-status",
        data: {
          collectionId: row._id,
          paymentId: row._id,
          status,
          zoneId: agentZoneId,
        },
        validateStatus: () => true,
      });

      if (response?.data?.success) {
        message.success(response?.data?.message || "Collection status updated");

        await Promise.all([
          refetchCollection(),
          queryClient.invalidateQueries({
            queryKey: ["rider-cash-collection-list", agentZoneId],
          }),
        ]);
      } else {
        throw new Error(
          response?.data?.message || "Failed to update collection status"
        );
      }
    } catch (error) {
      message.error(error?.message || "Failed to update collection status");
    }
  };

  const withdrawColumns = [
    {
      title: "Rider ID",
      key: "riderId",
      render: (_, row) => (
        <span className="font-medium text-blue-600">
          {getPaymentRiderId(row) || "N/A"}
        </span>
      ),
    },
    {
      title: "Phone",
      key: "phone",
      render: (_, row) => getPaymentRiderPhone(row),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => money(val),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (val) => val || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => (
        <Tag
          color={
            String(val || "").toLowerCase() === "completed"
              ? "green"
              : String(val || "").toLowerCase() === "invalid"
              ? "red"
              : "blue"
          }
        >
          {val || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => formatDateTime(val),
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Select
          value={row.status || "Pending"}
          className="w-36"
          options={PAYMENT_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          onChange={(value) => updateWithdrawStatus(row, value)}
        />
      ),
    },
  ];

  const collectionColumns = [
    {
      title: "Rider ID",
      key: "riderId",
      render: (_, row) => (
        <span className="font-medium text-blue-600">
          {getPaymentRiderId(row) || "N/A"}
        </span>
      ),
    },
    {
      title: "Sender Number",
      key: "senderNumber",
      render: (_, row) =>
        row?.senderNumber ||
        row?.senderPhone ||
        row?.phone ||
        row?.phoneNumber ||
        "N/A",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => money(val),
    },
    {
      title: "Transaction ID",
      key: "transactionId",
      render: (_, row) => (
        <span className="font-medium">
          {row?.transactionId || row?.trxId || row?.trxID || "N/A"}
        </span>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (val) => val || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => (
        <Tag
          color={
            String(val || "").toLowerCase() === "completed"
              ? "green"
              : String(val || "").toLowerCase() === "invalid"
              ? "red"
              : "blue"
          }
        >
          {val || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => formatDateTime(val),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val) => formatDateTime(val),
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Select
          value={row.status || "Pending"}
          className="w-36"
          options={PAYMENT_STATUS_OPTIONS.map((item) => ({
            value: item,
            label: item,
          }))}
          onChange={(value) => updateCollectionStatus(row, value)}
        />
      ),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3 md:p-5">
        <div className="mx-auto max-w-[1700px]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                Food Verse Agent Rider Control
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
                Rider Management
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Search by phone or rider ID, manage rider status, withdraws and
                cash collections.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                Managing Zone: {agentZoneName} #{agentZoneId || "N/A"}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/rider-register">
                <Button
                  type="primary"
                  className="!h-11 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-cyan-500 !px-5 !font-semibold !text-white hover:!text-white"
                >
                  <div className="flex items-center gap-2">
                    <Plus size={16} />
                    Register New Rider
                  </div>
                </Button>
              </Link>

              <Button
                onClick={() => setWithdrawOpen(true)}
                className="!h-11 !rounded-2xl !border-0 !bg-gradient-to-r !from-violet-600 !to-fuchsia-500 !px-5 !font-semibold !text-white hover:!text-white"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownToLine size={16} />
                  Withdraw List ({withdrawData.length})
                </div>
              </Button>

              <Button
                onClick={() => setCollectionOpen(true)}
                className="!h-11 !rounded-2xl !border-0 !bg-gradient-to-r !from-emerald-600 !to-cyan-500 !px-5 !font-semibold !text-white hover:!text-white"
              >
                <div className="flex items-center gap-2">
                  <Wallet size={16} />
                  Cash Collection Payment ({collectionData.length})
                </div>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                title: "Total Riders",
                value: stats.total,
                subtitle: `${agentZoneName} riders`,
                icon: <Bike size={20} />,
                wrap: "bg-blue-100 text-blue-600",
              },
              {
                title: "Active Riders",
                value: stats.active,
                subtitle: "Currently active",
                icon: <ShieldCheck size={20} />,
                wrap: "bg-emerald-100 text-emerald-600",
              },
              {
                title: "Total Rider Earning",
                value: money(stats.totalEarning),
                subtitle: "Visible rider earning",
                icon: <Coins size={20} />,
                wrap: "bg-amber-100 text-amber-600",
              },
              {
                title: "Total Cash",
                value: money(stats.totalCash),
                subtitle: "Visible rider cash",
                icon: <Wallet size={20} />,
                wrap: "bg-violet-100 text-violet-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.wrap}`}
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
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[180px_180px_1fr_auto]">
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "all", label: "Filter: all" },
                  { value: "active", label: "active" },
                  { value: "busy", label: "busy" },
                  {
                    value: "waiting for approved",
                    label: "waiting for approved",
                  },
                  { value: "banned", label: "banned" },
                ]}
              />

              <Select
                value={searchType}
                onChange={setSearchType}
                options={[
                  { value: "all", label: "Search all" },
                  { value: "phone", label: "Phone" },
                  { value: "id", label: "Rider ID" },
                ]}
              />

              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rider by phone or ID..."
                prefix={<Search size={15} className="text-slate-400" />}
                className="!rounded-xl"
              />

              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSearchType("all");
                  setFilterStatus("all");
                  setPage(1);
                  refetch();
                  refetchWithdraw();
                  refetchCollection();
                }}
                className="!h-10 !rounded-xl !border-slate-200 !font-semibold"
              >
                Clear / Refresh
              </Button>
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center py-20 opacity-70">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  Loading riders...
                </p>
              </div>
            ) : paginatedRiders.length === 0 ? (
              <div className="rounded-[30px] border border-slate-200 bg-white p-16 text-center shadow-sm">
                <Bike size={42} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">
                  No Riders Found
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  No rider matched your search or filter in {agentZoneName}.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paginatedRiders.map((rider) => (
                  <RiderCard
                    key={rider._id}
                    rider={rider}
                    localStatus={statusOverrides[rider._id]}
                    localSession={sessionOverrides[rider._id]}
                    onStatusChange={updateRiderStatus}
                    onSessionChange={updateRiderSession}
                    onDelete={deleteRider}
                  />
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
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={withdrawOpen}
        onCancel={() => setWithdrawOpen(false)}
        footer={null}
        width={1200}
        centered
        title={
          <div className="text-2xl font-black text-slate-950">
            Withdraw List — {agentZoneName} #{agentZoneId}
          </div>
        }
      >
        <Table
          rowKey={(row) => row?._id || `${getPaymentRiderId(row)}-${row?.createdAt}`}
          dataSource={withdrawData}
          columns={withdrawColumns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
          loading={withdrawFetching}
        />
      </Modal>

      <Modal
        open={collectionOpen}
        onCancel={() => setCollectionOpen(false)}
        footer={null}
        width={1350}
        centered
        title={
          <div className="text-2xl font-black text-slate-950">
            Cash Collection List — {agentZoneName} #{agentZoneId}
          </div>
        }
      >
        <Table
          rowKey={(row) => row?._id || `${getPaymentRiderId(row)}-${row?.createdAt}`}
          dataSource={collectionData}
          columns={collectionColumns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
          loading={collectionFetching}
        />
      </Modal>
    </Layout>
  );
}

export default Riders;
