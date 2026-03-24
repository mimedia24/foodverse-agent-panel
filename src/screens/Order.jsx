import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Input,
  Row,
  Col,
  Button,
  Space,
  Tooltip,
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
import api from "../api/config";
import { useAuth } from "../context/authContext";
import AssignRider from "../components/orders/AssignRider";
import ItemsCard from "../components/orders/ItemsCard";
import DeleteOrder from "../components/orders/DeleteOrder";
import UpdateOrderStatus from "../components/orders/UpdateOrderStatus";

const { Title, Text } = Typography;

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
  const [errors, setErrors] = useState(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const userIdSearch = searchParams.get("userId");

  const queryClient = useQueryClient();

  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: [
      "orders",
      currentPage,
      limit,
      user?.zoneId,
      searchParams.toString(),
    ],
    queryFn: async () => {
      let url = userIdSearch
        ? `/zone/orders/user/${userIdSearch}?page=${currentPage}&limit=${limit}`
        : `/zone/order-list?page=${currentPage}&limit=${limit}`;

      const method = userIdSearch ? "GET" : "POST";
      const payload = userIdSearch ? null : { zoneId: user?.zoneId };

      const response =
        method === "GET" ? await api.get(url) : await api.post(url, payload);

      return response.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!user?.zoneId,
  });

  const handleSearchByPhoneNumber = async (phoneNumber) => {
    if (phoneNumber.length !== 11) {
      setErrors((prev) => ({ ...prev, phoneError: "Invalid phone number" }));
      return;
    } else {
      setErrors(null);
    }

    try {
      const { data } = await api.get(`/zone/order/phone-number/${phoneNumber}`);
      if (data.success) {
        queryClient.setQueriesData(["orders"], () => ({
          data: data.result,
        }));
      } else {
        queryClient.setQueriesData(["orders"], () => []);
      }
    } catch (error) {
      return null;
    }
  };

  const handleSearchByRiderId = async (riderId) => {
    try {
      const { data } = await api.get(`/zone/order/rider/${riderId}`);
      if (data.success) {
        queryClient.setQueriesData(["orders"], () => ({
          data: data.result,
        }));
      } else {
        queryClient.setQueriesData(["orders"], () => []);
      }
    } catch (error) {
      return null;
    }
  };

  const handleSearchByUserId = async (userId) => {
    try {
      const { data } = await api.get(`/zone/order/user/${userId}`);
      if (data.success) {
        queryClient.setQueriesData(["orders"], () => ({
          data: data.result,
        }));
      } else {
        queryClient.setQueriesData(["orders"], () => []);
      }
    } catch (error) {
      return null;
    }
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
          className=" text-indigo-600 text-[11px]"
        >
          #{id.slice(-6).toUpperCase()}
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
            #{id.slice(-6)}
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
      width: 80,
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
      width: 80,
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
      width: 100,
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
      width: 90,
      render: (_, record) => (
        <div className="rounded-xl bg-slate-50 px-2 py-2 border border-slate-100 leading-tight">
          <div className="text-[9px] uppercase text-slate-400">Total</div>
          <div className="text-[14px] font-bold text-emerald-600">
            TK {record.totalAmount?.toFixed(0)}
          </div>
          <div className="text-[12px] text-blue-500 mt-1">
            Fee {record.riderFee?.toFixed(0)}
          </div>
        </div>
      ),
    },
    {
      title: "PTFM",
      key: "platform",
      width: 50,
      render: (_, record) => (
        <div className="flex justify-center">
          <span className="rounded-lg bg-lime-100 px-2 py-1 text-[10px] font-semibold text-lime-700">
            {record.platform}
          </span>
        </div>
      ),
    },
    {
      title: "MAP",
      key: "logistics",
      width: 65,
      render: (_, record) => (
        <div className="text-center leading-tight">
          <div className="text-[11px] font-bold text-slate-700">
            {record.distance?.toFixed(2)} KM
          </div>
          <Button
            size="small"
            type="link"
            icon={<EnvironmentOutlined />}
            href={`https://www.google.com/maps?q=${record.coords?.lat},${record.coords?.long}`}
            target="_blank"
            className="p-0 h-auto text-[10px]"
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
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <AssignRider orderId={record._id} />
          <DeleteOrder orderId={record._id} />
          <UpdateOrderStatus currentStatus={record.status} />
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
                Managing Zone ID: {user?.zoneId}
              </Text>
            </Col>

            <Col xs={24} md={16} className="text-right">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                className="rounded-xl h-9 px-4"
              >
                Refresh
              </Button>
            </Col>

            <Col xs={24} sm={8}>
              <Input
                placeholder="User ID..."
                prefix={<SearchOutlined />}
                defaultValue={searchParams.get("userId")}
                onPressEnter={(e) => handleSearchByUserId(e.target.value)}
                allowClear
                className="rounded-xl h-9"
              />
            </Col>

            <Col xs={24} sm={8}>
              <Input
                placeholder="Rider ID..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearchByRiderId(e.target.value)}
                allowClear
                className="rounded-xl h-9"
              />
            </Col>

            <Col xs={24} sm={8}>
              <Input
                placeholder="Phone..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearchByPhoneNumber(e.target.value)}
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
            loading={isLoading}
            scroll={{ x: 1380 }}
            size="small"
            style={{ opacity: isPlaceholderData ? 0.7 : 1 }}
            onChange={(pagination) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("page", pagination.current.toString());
              newParams.set("limit", pagination.pageSize.toString());
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