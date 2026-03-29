import React, { useState } from "react";
import {
  Button,
  Dropdown,
  message,
  Tag,
  TimePicker,
  Switch,
  Input,
  Table,
  Typography,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  ShieldCheck,
  TrendingUp,
  Home,
  Cake,
  Wallet,
} from "lucide-react";
import { image_uri } from "../utils/constants";
import api from "../api/config";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import GlobalModal from "./molecules/GlobalModal";
import { Link } from "react-router";

const { Text } = Typography;

const num = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) =>
  `TK ${num(value).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const Info = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
    <div className="mt-1 text-indigo-500">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

function RestaurantDetails({ res, forceClosed = false, onOpenWallet }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState({
    visible: false,
  });

  const [transactionModal, setTransactionModal] = useState({
    visible: false,
  });

  const restaurantName = res?.name || res?.restaurantName || "Restaurant";
  const restaurantDescription = res?.description || "All item available";
  const restaurantPhone = res?.phone || res?.phoneNumber || "N/A";
  const restaurantEmail = res?.email || "N/A";
  const restaurantAddress = res?.address || "N/A";
  const restaurantRating = num(res?.averageReview ?? res?.rating ?? 5);
  const totalReviews = num(res?.totalReviews ?? res?.reviewsCount ?? 0);
  const currentBalance = num(
    res?.balance ?? res?.walletBalance ?? res?.wallet ?? 0,
  );
  const isActuallyOpen = Boolean(res?.isOpen) && !forceClosed;

  const statusOptions = [
    { key: "waiting for approved", label: "Waiting for Approval" },
    { key: "not approved", label: "Not Approved" },
    { key: "active", label: "Active" },
    { key: "banned", label: "Banned" },
    { key: "closed", label: "Closed" },
  ];

  const handleUpdate = async (endpoint, payload) => {
    try {
      setLoading(true);
      const { data } = await api.put(endpoint, payload);
      if (data.success) {
        queryClient.invalidateQueries(["restaurants"]);
        message.success(data?.message || "Updated successfully");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const paymentRestaurantAmount = async () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return message.error("Please enter a valid amount.");
    }

    try {
      const { data } = await api.put(`/zone/restaurant-payment`, {
        amount: numAmount,
        restaurantId: res._id,
      });

      if (data?.success) {
        message.success(data?.message);
        setAmount(0);
        setShowPaymentModal({ visible: false });
        queryClient.invalidateQueries(["restaurants"]);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Payment failed");
    }
  };

  const renderRestaurantStatus = () => {
    const menuItems = statusOptions.map((item) => ({
      key: item.key,
      label: item.label,
      onClick: () =>
        handleUpdate(`/zone/restaurant/update-status/${res._id}`, {
          status: item.key,
        }),
    }));

    return (
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Button
          icon={<DownOutlined />}
          loading={loading}
          disabled={forceClosed}
          className="!h-10 !rounded-xl"
        >
          Status: {forceClosed ? "closed" : res.status}
        </Button>
      </Dropdown>
    );
  };

  const renderRestaurantOperatingTime = () => {
    const start = res.openingTime ? dayjs(res.openingTime, "HH:mm") : null;
    const end = res.closingTime ? dayjs(res.closingTime, "HH:mm") : null;

    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-700">Operating Control</span>
          <Switch
            checked={forceClosed ? false : res.isOpen}
            disabled={forceClosed}
            loading={loading}
            checkedChildren="Open"
            unCheckedChildren="Closed"
            onChange={(checked) =>
              handleUpdate(
                `/zone/restaurant/update-operating-time/${res._id}`,
                {
                  isOpen: checked,
                  openingTime: res.openingTime,
                  closingTime: res.closingTime,
                },
              )
            }
          />
        </div>

        <TimePicker.RangePicker
          className="!w-full"
          format="hh:mm A"
          value={[start, end]}
          disabled={forceClosed}
          onOk={(values) => {
            if (values) {
              handleUpdate(
                `/zone/restaurant/update-operating-time/${res._id}`,
                {
                  openingTime: values[0].format("HH:mm"),
                  closingTime: values[1].format("HH:mm"),
                  isOpen: res.isOpen,
                },
              );
            }
          }}
        />

        {forceClosed ? (
          <p className="text-xs font-medium text-rose-500">
            Global force close is enabled. Restaurant cannot reopen now.
          </p>
        ) : null}
      </div>
    );
  };

  const transactionColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD MMM YYYY, hh:mm A"),
    },
    {
      title: "Title",
      dataIndex: "description",
      key: "description",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "Sale" ? "green" : "blue"}>{type}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (val) => <Text className="font-bold">{money(val)}</Text>,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-xl">
      <div className="relative h-56 md:h-72">
        <img
          src={`${image_uri}${res.image}`}
          alt={restaurantName}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {res.isVerify && (
            <Tag
              color="blue"
              icon={<ShieldCheck size={14} className="mr-1 inline" />}
            >
              Verified
            </Tag>
          )}
          {res.isPopular && (
            <Tag
              color="orange"
              icon={<TrendingUp size={14} className="mr-1 inline" />}
            >
              Popular
            </Tag>
          )}
          {forceClosed && <Tag color="red">Force Closed</Tag>}
        </div>

        <div className="absolute bottom-4 right-4">
          <Tag color={isActuallyOpen ? "green" : "red"}>
            {isActuallyOpen ? "Open" : "Closed"}
          </Tag>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {restaurantName}
            </h2>
            <p className="text-sm text-slate-500">{restaurantDescription}</p>
          </div>
          {renderRestaurantStatus()}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Info
              icon={<MapPin size={16} />}
              label="Address"
              value={restaurantAddress}
            />
            <Info
              icon={<Phone size={16} />}
              label="Phone"
              value={restaurantPhone}
            />
            <Info
              icon={<Mail size={16} />}
              label="Email"
              value={restaurantEmail}
            />
            <Info
              icon={<Clock size={16} />}
              label="Hours"
              value={`${res.openingTime || "N/A"} - ${res.closingTime || "N/A"}`}
            />
          </div>

          <div className="space-y-4">
            <Info
              icon={<Star size={16} />}
              label="Rating"
              value={`${restaurantRating} (${totalReviews} reviews)`}
            />
            <Info
              icon={<Wallet size={16} />}
              label="Balance"
              value={money(currentBalance)}
            />
            <Info
              icon={<Home size={16} />}
              label="Homemade"
              value={res.isHomeMade ? "Yes" : "No"}
            />
            <Info
              icon={<Cake size={16} />}
              label="Cake"
              value={res.isCake ? "Yes" : "No"}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            className="!rounded-xl"
            onClick={() => {
              if (onOpenWallet) {
                onOpenWallet(res._id);
              } else {
                setShowPaymentModal({ visible: true });
              }
            }}
          >
            Payment
          </Button>

          <Button
            className="!rounded-xl"
            onClick={() => setTransactionModal({ visible: true })}
          >
            Transactions
          </Button>

          <Link to={`/restaurants/menu/${res._id}`}>
            <Button className="!rounded-xl">Menu</Button>
          </Link>
        </div>

        {renderRestaurantOperatingTime()}

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Tag color="purple">Status: {forceClosed ? "closed" : res.status}</Tag>
          <Tag color="cyan">Zone: {res.zoneId}</Tag>
          <Tag>Transactions: {res.transactions?.length || 0}</Tag>
        </div>

        <GlobalModal
          open={showPaymentModal.visible}
          onCancel={() => setShowPaymentModal({ visible: false })}
          title={`Pay Restaurant (Current: ${money(currentBalance)})`}
          onOk={paymentRestaurantAmount}
        >
          <Input
            placeholder="Enter amount to pay"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            prefix="TK"
          />
        </GlobalModal>

        <GlobalModal
          open={transactionModal.visible}
          onCancel={() => setTransactionModal({ visible: false })}
          title={`${restaurantName} Transaction History`}
          footer={null}
          width={800}
        >
          <Table
            dataSource={res.transactions || []}
            columns={transactionColumns}
            rowKey="_id"
            pagination={{ pageSize: 6 }}
          />
        </GlobalModal>

        <div className="text-xs text-slate-400">
          Last Updated: {new Date(res.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;