import React, { useMemo, useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Input,
  Row,
  Col,
  Button,
  Tooltip,
  message,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CopyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/authContext";
import AssignRider from "../components/orders/AssignRider";
import ItemsCard from "../components/orders/ItemsCard";
import DeleteOrder from "../components/orders/DeleteOrder";
import UpdateOrderStatus from "../components/orders/UpdateOrderStatus";
import OrderService from "../api/order.service";
import OrderTimeline from "../components/orders/OrderTimeline";

const { Title, Text } = Typography;

const toNumber = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const getItemsSellingTotal = (items = []) => {
  return items.reduce((acc, item) => {
    const unitPrice =
      toNumber(item?.sellingPrice) > 0
        ? toNumber(item?.sellingPrice)
        : toNumber(item?.offerPrice);

    return acc + unitPrice * toNumber(item?.quantity || 1);
  }, 0);
};

const getAddonsTotal = (items = []) => {
  return items.reduce((acc, item) => {
    const addonTotal = (item?.addons || []).reduce((sum, addon) => {
      return sum + toNumber(addon?.price) * toNumber(addon?.quantity || 1);
    }, 0);

    return acc + addonTotal;
  }, 0);
};

const getUserDeliveryCharge = (record) => {
  return toNumber(record?.deliveryAmount);
};

const getDisplayOrderTotal = (record) => {
  const itemsTotal = getItemsSellingTotal(record?.items || []);
  const addonsTotal = getAddonsTotal(record?.items || []);
  const deliveryCharge = getUserDeliveryCharge(record);

  return itemsTotal + addonsTotal + deliveryCharge;
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "orange" },
    "accept by rider": { color: "blue" },
    "accept by restaurant": { color: "cyan" },
    "ready for pickup": { color: "purple" },
    "picked up": { color: "geekblue" },
    delivered: { color: "green" },
    cancelled: { color: "volcano" },
    "cancelled by restaurant": { color: "red" },
  };

  const config = statusConfig[status] || { color: "default" };

  return (
    <Tag
      color={config.color}
      className="rounded-full px-2 py-0 border-none font-bold uppercase text-[10px]"
    >
      {status}
    </Tag>
  );
};

function Order() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [riderInput, setRiderInput] = useState("");
  const [userInput, setUserInput] = useState(searchParams.get("userId") || "");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const userIdSearch = searchParams.get("userId");

  const queryKey = useMemo(
    () => ["orders", currentPage, limit, user?.zoneId, userIdSearch || ""],
    [currentPage, limit, user?.zoneId, userIdSearch]
  );

  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.zoneId) {
        return {
          success: false,
          data: [],
          totalCount: 0,
        };
      }

      if (userIdSearch) {
        return await OrderService.getOrdersByUserId(
          userIdSearch,
          currentPage,
          limit
        );
      }

      return await OrderService.getOrderList(currentPage, limit, user.zoneId);
    },
    placeholderData: keepPreviousData,
    enabled: !!user?.zoneId,
  });

  const handleResetList = async () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("userId");
    newParams.set("page", "1");
    newParams.set("limit", String(limit));
    setSearchParams(newParams);
    setErrors(null);
    setPhoneInput("");
    setRiderInput("");
    setUserInput("");
    await refetch();
  };

  const handleSearchByPhoneNumber = async () => {
    if (!phoneInput) {
      return handleResetList();
    }

    if (phoneInput.length !== 11) {
      setErrors((prev) => ({ ...prev, phoneError: "Invalid phone number" }));
      return;
    }

    setErrors(null);
    setSearchLoading(true);

    try {
      const result = await OrderService.getOrdersByPhoneNumber(phoneInput);
      queryClient.setQueryData(queryKey, result);

      if (!result?.data?.length) {
        message.info("No order found for this phone number");
      }
    } catch (error) {
      message.error("Failed to search by phone number");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchByRiderId = async () => {
    if (!riderInput) {
      return handleResetList();
    }

    setSearchLoading(true);

    try {
      const result = await OrderService.getOrdersByRiderId(riderInput);
      queryClient.setQueryData(queryKey, result);

      if (!result?.data?.length) {
        message.info("No order found for this rider");
      }
    } catch (error) {
      message.error("Failed to search by rider id");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchByUserId = async () => {
    if (!userInput) {
      return handleResetList();
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set("userId", userInput);
    newParams.set("page", "1");
    newParams.set("limit", String(limit));
    setSearchParams(newParams);
  };

  const columns = [
    {
      title: "ORDER",
      dataIndex: "_id",
      key: "_id",
      fixed: "left",
      width: 95,
      render: (id) => (
        <Text
          copyable={{ text: id, icon: [<CopyOutlined key="copy" />] }}
          className="text-indigo-600 text-[11px]"
        >
          #{id?.slice(-6)?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "RES ID",
      dataIndex: "restaurantId",
      key: "restaurantId",
      width: 90,
      render: (id) => (
        <Text copyable={{ text: id }} className="text-[11px] text-slate-500">
          #{id?.slice(-6)}
        </Text>
      ),
    },
    {
      title: "RESTAURANT",
      dataIndex: "restaurantName",
      key: "restaurantName",
      width: 125,
      ellipsis: true,
      render: (name) => (
        <Tooltip title={name}>
          <Text strong className="text-[12px] text-slate-800">
            {name}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "USER",
      dataIndex: "userId",
      key: "userId",
      width: 90,
      render: (id) => (
        <Text copyable={{ text: id }} className="text-[11px] text-slate-500">
          #{id?.slice(-6)}
        </Text>
      ),
    },
    {
      title: "RIDER",
      dataIndex: "riderId",
      key: "riderId",
      width: 80,
      render: (id) =>
        id ? (
          <Text copyable={{ text: id }} className="text-[11px] text-slate-500">
            #{id?.slice(-6)}
          </Text>
        ) : (
          <Text type="secondary" className="text-[11px]">
            N/A
          </Text>
        ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "ITEMS",
      dataIndex: "items",
      key: "items",
      width: 80,
      render: (items) => <ItemsCard items={items} />,
    },
    {
      title: "DATE",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 100,
      render: (date) => (
        <div className="leading-tight">
          <div className="flex items-center gap-1 text-[11px] text-slate-700">
            <CalendarOutlined className="text-slate-400" />
            {dayjs(date).format("DD/MM/YY")}
          </div>
          <div className="text-[12px] text-slate-400 ml-[17px]">
            {dayjs(date).format("hh:mm A")}
          </div>
        </div>
      ),
    },
    {
      title: "CUSTOMER",
      key: "customer",
      width: 130,
      render: (_, record) => (
        <div className="leading-tight">
          <div className="font-semibold text-[16px] text-slate-800">
            {record.customerPhone}
          </div>
          <Tooltip title={record.customerMessage}>
            <div className="text-[10px] text-slate-400 truncate max-w-[105px]">
              {record.customerMessage || "No msg"}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "LOCATION",
      key: "locations",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1 text-[10px] leading-tight">
          <div className="flex items-start gap-1">
            <Tag color="green" className="m-0 px-1 py-0 text-[9px]">
              FROM
            </Tag>
            <Tooltip title={record.restaurantLocation}>
              <span className="truncate max-w-[125px] text-slate-500 italic">
                {record.restaurantLocation}
              </span>
            </Tooltip>
          </div>
          <div className="flex items-start gap-1">
            <Tag color="red" className="m-0 px-1 py-0 text-[9px]">
              TO
            </Tag>
            <Tooltip title={record.dropLocation}>
              <span className="truncate max-w-[125px] text-slate-700 font-medium">
                {record.dropLocation}
              </span>
            </Tooltip>
          </div>
        </div>
      ),
    },
{
  title: "AMOUNT",
  key: "price",
  width: 120,
  render: (_, record) => {
    const itemsTotal = getItemsSellingTotal(record?.items || []);
    const addonsTotal = getAddonsTotal(record?.items || []);
    const deliveryCharge = getUserDeliveryCharge(record);
    const finalTotal = getDisplayOrderTotal(record);

    return (
      <div className="rounded-xl bg-slate-50 px-2 py-2 border border-slate-100 leading-tight">
        <div className="text-[9px] uppercase text-slate-400">Total</div>
        <div className="text-[14px] font-bold text-emerald-600">
          TK {finalTotal.toFixed(0)}
        </div>
        <div className="text-[10px] text-blue-500">
          Delivery {deliveryCharge.toFixed(0)}
        </div>
      </div>
    );
  },
},
    {
      title: "MAP",
      key: "logistics",
      width: 75,
      render: (_, record) => (
        <div className="text-center leading-tight">
          <div className="text-[11px] font-bold text-slate-700">
            {Number(record.distance || 0).toFixed(2)} KM
          </div>
          <Button
            size="small"
            type="link"
            icon={<EnvironmentOutlined />}
            href={
              record?.coords?.lat && record?.coords?.long
                ? `https://www.google.com/maps?q=${record.coords.lat},${record.coords.long}`
                : undefined
            }
            target="_blank"
            className="p-0 h-auto text-[10px]"
            disabled={!record?.coords?.lat || !record?.coords?.long}
          >
            View
          </Button>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      width: 170,
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <AssignRider orderId={record._id} />
          <DeleteOrder orderId={record._id} />
          <UpdateOrderStatus
            orderId={record._id}
            currentStatus={record.status}
          />
          <OrderTimeline orderId={record._id} />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-2 md:p-0 bg-slate-100 min-h-screen">
        <Card className="mb-3 border-none shadow-sm rounded-2xl">
          <Row gutter={[10, 10]} align="middle">
            <Col xs={24} md={8}>
              <Title level={3} className="!m-0 !text-[28px]">
                Order Dashboard
              </Title>
              <Text type="secondary" className="text-[12px]">
                Managing Zone ID : {user?.zoneId || "N/A"}
              </Text>
            </Col>

            <Col xs={24} md={16} className="text-right">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleResetList}
                className="rounded-xl h-9 px-4"
                loading={isLoading || searchLoading}
              >
                Refresh
              </Button>
            </Col>

            <Col xs={24} sm={8}>
              <Input
                placeholder="User ID..."
                prefix={<SearchOutlined />}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onPressEnter={handleSearchByUserId}
                allowClear
                className="rounded-xl h-9"
              />
            </Col>

            <Col xs={24} sm={8}>
              <Input
                placeholder="Rider ID..."
                prefix={<SearchOutlined />}
                value={riderInput}
                onChange={(e) => setRiderInput(e.target.value)}
                onPressEnter={handleSearchByRiderId}
                allowClear
                className="rounded-xl h-9"
              />
            </Col>

            <Col xs={24} sm={8}>
              <Input
                placeholder="Phone..."
                prefix={<SearchOutlined />}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onPressEnter={handleSearchByPhoneNumber}
                allowClear
                className="rounded-xl h-9"
              />
              {errors?.phoneError && (
                <div className="mt-1 text-[11px] font-semibold text-red-500">
                  {errors.phoneError}
                </div>
              )}
            </Col>
          </Row>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="_id"
            loading={isLoading || searchLoading}
            scroll={{ x: 1380 }}
            size="small"
            style={{ opacity: isPlaceholderData ? 0.7 : 1 }}
            onChange={(pagination) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("page", String(pagination.current || 1));
              newParams.set("limit", String(pagination.pageSize || 20));

              if (userIdSearch) {
                newParams.set("userId", userIdSearch);
              }

              setSearchParams(newParams);
            }}
            pagination={{
              current: currentPage,
              pageSize: limit,
              total: data?.totalCount || 0,
              showSizeChanger: true,
              className: "px-2 py-3",
            }}
          />
        </Card>
      </div>
    </Layout>
  );
}

export default Order;