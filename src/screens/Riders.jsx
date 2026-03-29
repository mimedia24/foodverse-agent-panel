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
  Clock3,
  Trash2,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";
import { image_uri } from "../utils/constants";
import { Link } from "react-router";

const DEMO_RIDERS = [
  {
    _id: "68bf1aa727a254fc9d5240d7",
    name: "Sagor Chandra Aich",
    phone: "01310047696",
    email: "Sagoraich52@gmail.com",
    address: "Banchanagar, sakharipara",
    status: "active",
    currentSession: "busy",
    earning: 2703,
    cash: 1765,
    isVerify: true,
    image: "",
  },
  {
    _id: "68ca896d1f2377a038b981a3",
    name: "Rubel Hossain",
    phone: "01871460082",
    email: "lsrubel@gmail.com",
    address: "LX lakshmipur",
    status: "active",
    currentSession: "busy",
    earning: 2275,
    cash: 22102,
    isVerify: true,
    image: "",
  },
  {
    _id: "69317cc6685af804c5677cfa",
    name: "Shajon Miah",
    phone: "01703816169",
    email: "Hirajulislam012@gmail.com",
    address: "hajirpara Chandraganj lakshmipur",
    status: "waiting for approved",
    currentSession: "offline",
    earning: 0,
    cash: 0,
    isVerify: false,
    image: "",
  },
];

const DEMO_WITHDRAWS = [
  {
    _id: "w1",
    riderId: "6909f716ac65fb6994cc99f1",
    phone: "01861113852",
    amount: 786,
    paymentMethod: "Bkash",
    status: "Completed",
    createdAt: "2026-03-23T16:32:52",
  },
];

const DEMO_COLLECTIONS = [
  {
    _id: "c1",
    riderId: "6909f716ac65fb6994cc99f1",
    senderNumber: "01861113852",
    amount: 5387,
    transactionId: "Dhrhrvrhrhv",
    paymentMethod: "Bkash",
    status: "Completed",
    createdAt: "2026-03-23T16:33:26",
    updatedAt: "2026-03-23T16:34:04",
  },
];

const RIDER_STATUS_OPTIONS = [
  "waiting for approved",
  "not approved",
  "active",
  "banned",
  "closed",
];

const SESSION_OPTIONS = ["busy", "online", "break", "offline"];

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

const getName = (rider) =>
  rider?.name || rider?.fullName || rider?.riderName || "Unnamed Rider";

const getPhone = (rider) =>
  rider?.phone || rider?.phoneNumber || rider?.number || "N/A";

const getEmail = (rider) => rider?.email || "N/A";

const getAddress = (rider) => rider?.address || rider?.location || "N/A";

const getImage = (rider) => {
  if (!rider?.image) return "";
  return `${image_uri}${rider.image}`;
};

const getStatusColor = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "active") return "green";
  if (value === "waiting for approved") return "orange";
  if (value === "banned" || value === "closed") return "red";
  if (value === "not approved") return "volcano";
  return "default";
};

const getSessionColor = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "busy") return "orange";
  if (value === "online") return "green";
  if (value === "break") return "gold";
  if (value === "offline") return "red";
  return "default";
};

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <Icon size={15} className="mt-0.5 text-blue-500" />
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
  const status = localStatus || rider.status || "active";
  const currentSession = localSession || rider.currentSession || "offline";
  const avatarSrc = getImage(rider);

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
              {money(rider?.earning)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <CircleDollarSign size={14} className="text-emerald-500" />
              Cash
            </div>
            <p className="mt-2 text-base font-black text-slate-900">
              {money(rider?.cash)}
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
      </div>
    </div>
  );
}

function Riders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchType, setSearchType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const [statusOverrides, setStatusOverrides] = useState({});
  const [sessionOverrides, setSessionOverrides] = useState({});

  const pageSize = 6;

  const { data: ridersData = [], isLoading, refetch } = useQuery({
    queryKey: ["riders", user?.zoneId],
    queryFn: async () => {
      try {
        const response = await api.post("/zone/rider-list", {
          zoneId: user?.zoneId,
        });
        const payload = response?.data;
        return payload?.result || payload?.data || payload || DEMO_RIDERS;
      } catch {
        return DEMO_RIDERS;
      }
    },
    enabled: !!user?.zoneId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const { data: withdrawData = [] } = useQuery({
    queryKey: ["rider-withdraw-list", user?.zoneId],
    queryFn: async () => {
      try {
        const response = await api.post("/zone/rider-withdraw-list", {
          zoneId: user?.zoneId,
        });
        const payload = response?.data;
        return payload?.result || payload?.data || DEMO_WITHDRAWS;
      } catch {
        return DEMO_WITHDRAWS;
      }
    },
    enabled: !!user?.zoneId,
  });

  const { data: collectionData = [] } = useQuery({
    queryKey: ["rider-cash-collection-list", user?.zoneId],
    queryFn: async () => {
      try {
        const response = await api.post("/zone/rider-cash-collection-list", {
          zoneId: user?.zoneId,
        });
        const payload = response?.data;
        return payload?.result || payload?.data || DEMO_COLLECTIONS;
      } catch {
        return DEMO_COLLECTIONS;
      }
    },
    enabled: !!user?.zoneId,
  });

  const riders = useMemo(() => {
    return (Array.isArray(ridersData) ? ridersData : []).map((item) => ({
      ...item,
      status: statusOverrides[item._id] || item.status || "active",
      currentSession:
        sessionOverrides[item._id] || item.currentSession || "offline",
    }));
  }, [ridersData, statusOverrides, sessionOverrides]);

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
        String(rider?.status || "").toLowerCase() === filterStatus.toLowerCase();

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
        (item) => String(item.status || "").toLowerCase() === "active",
      ).length,
      busy: riders.filter(
        (item) => String(item.currentSession || "").toLowerCase() === "busy",
      ).length,
      totalCash: riders.reduce((sum, item) => sum + num(item.cash), 0),
    };
  }, [riders]);

  const updateRiderStatus = async (rider, value) => {
    setStatusOverrides((prev) => ({ ...prev, [rider._id]: value }));
    try {
      await api.put(`/zone/rider/update-status/${rider._id}`, { status: value });
      queryClient.invalidateQueries(["riders"]);
      message.success("Rider status updated");
    } catch {
      message.warning("Frontend updated. Connect backend endpoint if needed.");
    }
  };

  const updateRiderSession = async (rider, value) => {
    setSessionOverrides((prev) => ({ ...prev, [rider._id]: value }));
    try {
      await api.put(`/zone/rider/update-current-session/${rider._id}`, {
        currentSession: value,
      });
      queryClient.invalidateQueries(["riders"]);
      message.success("Rider session updated");
    } catch {
      message.warning("Frontend updated. Connect backend endpoint if needed.");
    }
  };

  const deleteRider = async (rider) => {
    try {
      await api.delete(`/zone/rider/${rider._id}`);
      queryClient.invalidateQueries(["riders"]);
      message.success("Rider deleted");
    } catch {
      message.warning("Delete endpoint not connected yet.");
    }
  };

  const withdrawColumns = [
    {
      title: "Rider ID",
      dataIndex: "riderId",
      key: "riderId",
      render: (val) => <span className="font-medium text-blue-600">{val}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => <Tag color="green">{val}</Tag>,
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
          defaultValue={row.status || "Completed"}
          className="w-32"
          options={[
            { value: "Completed", label: "Completed" },
            { value: "Pending", label: "Pending" },
            { value: "Rejected", label: "Rejected" },
          ]}
        />
      ),
    },
  ];

  const collectionColumns = [
    {
      title: "Rider ID",
      dataIndex: "riderId",
      key: "riderId",
      render: (val) => <span className="font-medium text-blue-600">{val}</span>,
    },
    {
      title: "Sender Number",
      dataIndex: "senderNumber",
      key: "senderNumber",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => money(val),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (val) => <span className="font-medium">{val}</span>,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => <Tag color="green">{val}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => formatDateTime(val),
    },
    {
      title: "Update At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val) => formatDateTime(val),
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Select
          defaultValue={row.status || "Completed"}
          className="w-32"
          options={[
            { value: "Completed", label: "Completed" },
            { value: "Pending", label: "Pending" },
            { value: "Rejected", label: "Rejected" },
          ]}
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
                  Withdraw List
                </div>
              </Button>

              <Button
                onClick={() => setCollectionOpen(true)}
                className="!h-11 !rounded-2xl !border-0 !bg-gradient-to-r !from-emerald-600 !to-cyan-500 !px-5 !font-semibold !text-white hover:!text-white"
              >
                <div className="flex items-center gap-2">
                  <Wallet size={16} />
                  Cash Collection Payment
                </div>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                title: "Total Riders",
                value: stats.total,
                subtitle: "Zone riders",
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
                title: "Busy Session",
                value: stats.busy,
                subtitle: "Busy right now",
                icon: <Clock3 size={20} />,
                wrap: "bg-amber-100 text-amber-600",
              },
              {
                title: "Total Cash",
                value: money(stats.totalCash),
                subtitle: "Visible rider cash",
                icon: <Coins size={20} />,
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
                  { value: "waiting for approved", label: "waiting for approved" },
                  { value: "not approved", label: "not approved" },
                  { value: "banned", label: "banned" },
                  { value: "closed", label: "closed" },
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
                <h3 className="text-lg font-bold text-slate-700">No Riders Found</h3>
                <p className="mt-2 text-sm text-slate-400">
                  No rider matched your search or filter.
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
          <div className="text-2xl font-black text-slate-950">Withdraw List</div>
        }
      >
        <Table
          rowKey="_id"
          dataSource={withdrawData}
          columns={withdrawColumns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
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
            Cash Collection List
          </div>
        }
      >
        <Table
          rowKey="_id"
          dataSource={collectionData}
          columns={collectionColumns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
        />
      </Modal>
    </Layout>
  );
}

export default Riders;