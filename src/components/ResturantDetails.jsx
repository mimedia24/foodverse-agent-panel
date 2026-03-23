import React, { useState } from "react";
import {
  Button,
  Dropdown,
  message,
  Space,
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

const Info = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-indigo-500 mt-1">{icon}</div>
    <div>
      <p className="text-xs uppercase text-slate-400 font-semibold tracking-widest">
        {label}
      </p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  </div>
);

function RestaurantDetails({ res }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState({
    visible: false,
  });

  const [transactionModal, setTransactionModal] = useState({
    visible: false,
  });

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
        <Button icon={<DownOutlined />} loading={loading}>
          Status: {res.status}
        </Button>
      </Dropdown>
    );
  };

  const renderRestaurantOperatingTime = () => {
    const start = res.openingTime ? dayjs(res.openingTime, "HH:mm") : null;
    const end = res.closingTime ? dayjs(res.closingTime, "HH:mm") : null;

    return (
      <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-700">
            Operating Control
          </span>
          <Switch
            checked={res.isOpen}
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
          format="hh:mm A"
          value={[start, end]}
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
      render: (val) => <Text className="font-bold">৳ {val}</Text>,
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
      {/* Image Banner */}
      <div className="relative h-72">
        <img
          src={`${image_uri}${res.image}`}
          alt={res.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {res.isVerify && (
            <Tag
              color="blue"
              icon={<ShieldCheck size={14} className="inline mr-1" />}
            >
              Verified
            </Tag>
          )}
          {res.isPopular && (
            <Tag
              color="orange"
              icon={<TrendingUp size={14} className="inline mr-1" />}
            >
              Popular
            </Tag>
          )}
        </div>
        <div className="absolute bottom-4 right-4">
          <Tag color={res.isOpen ? "green" : "red"}>
            {res.isOpen ? "Open" : "Closed"}
          </Tag>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">{res.name}</h2>
            <p className="text-sm text-slate-500">{res.description}</p>
          </div>
          {renderRestaurantStatus()}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Info
              icon={<MapPin size={16} />}
              label="Address"
              value={res.address}
            />
            <Info icon={<Phone size={16} />} label="Phone" value={res.phone} />
            <Info icon={<Mail size={16} />} label="Email" value={res.email} />
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
              value={`${res.averageReview} (${res.totalReviews} reviews)`}
            />
            <Info
              icon={<Wallet size={16} />}
              label="Balance"
              value={`€ ${res.balance}`}
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={() => setShowPaymentModal({ visible: true })}
          >
            Payment
          </Button>
          <Button onClick={() => setTransactionModal({ visible: true })}>
            Transactions
          </Button>

          <Link to={`/restaurants/menu/${res._id}`}>
            <Button>Menu</Button>
          </Link>
        </div>
s
        {renderRestaurantOperatingTime()}

        {/* Status Tags */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Tag color="purple">Status: {res.status}</Tag>
          <Tag color="cyan">Zone: {res.zoneId}</Tag>
          <Tag>Transactions: {res.transactions?.length || 0}</Tag>
        </div>

        {/* Payment Modal */}
        <GlobalModal
          open={showPaymentModal.visible}
          onCancel={() => setShowPaymentModal({ visible: false })}
          title={`Pay Restaurant (Current: € ${res.balance})`}
          onOk={paymentRestaurantAmount}
        >
          <Input
            placeholder="Enter amount to pay"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            prefix="€"
          />
        </GlobalModal>

        {/* Transaction Modal */}
        <GlobalModal
          open={transactionModal.visible}
          onCancel={() => setTransactionModal({ visible: false })}
          title={`${res.name} Transaction History`}
          footer={null}
          width={800}
        >
          <Table
            dataSource={res.transactions}
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
