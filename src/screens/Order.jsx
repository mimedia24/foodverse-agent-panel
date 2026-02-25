import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Input,
  DatePicker,
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
  DollarCircleOutlined,
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
const { RangePicker } = DatePicker;

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
      className="rounded-full px-3 py-0.5 border-none font-bold uppercase text-[10px]"
    >
      {status}
    </Tag>
  );
};

function Order() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const userIdSearch = searchParams.get("userId");
  const [errors, setErrors] = useState(null);

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
      const response = await (method === "GET"
        ? api.get(url)
        : api.post(url, payload));
      return response.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!user?.zoneId,
  });

  // search phone number
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
        queryClient.setQueriesData(["orders"], (oldData) => {
          return {
            data: data.result,
          };
        });
      } else {
        queryClient.setQueriesData(["orders"], (oldData) => {
          return [];
        });
      }
    } catch (error) {
      return null;
    }
  };

  // search phone number
  const handleSearchByRiderId = async (riderId) => {
    try {
      const { data } = await api.get(`/zone/order/rider/${riderId}`);
      if (data.success) {
        queryClient.setQueriesData(["orders"], (oldData) => {
          return {
            data: data.result,
          };
        });
      } else {
        queryClient.setQueriesData(["orders"], (oldData) => {
          return [];
        });
      }
    } catch (error) {
      return null;
    }
  };

  // search user id
  const handleSearchByUserId = async (userId) => {
    try {
      const { data } = await api.get(`/zone/order/user/${userId}`);
      if (data.success) {
        queryClient.setQueriesData(["orders"], (oldData) => {
          return {
            data: data.result,
          };
        });
      } else {
        queryClient.setQueriesData(["orders"], (oldData) => {
          return [];
        });
      }
    } catch (error) {
      return null;
    }
  };

  const columns = [
    {
      title: "ORDER ID",
      dataIndex: "_id",
      key: "_id",
      fixed: "left",
      width: 130,
      render: (id) => (
        <Text
          copyable={{ text: id, icon: [<CopyOutlined key="copy" />] }}
          className="font-bold text-indigo-600"
        >
          #{id.slice(-6).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "RESTAURANT ID",
      dataIndex: "restaurantId",
      key: "restaurantId",
      width: 130,
      render: (id) => (
        <Text
          copyable={{ text: id }}
          className="text-gray-500 font-mono text-[11px]"
        >
          #{id?.slice(-6)}
        </Text>
      ),
    },
    {
      title: "RESTAURANT NAME",
      dataIndex: "restaurantName",
      key: "restaurantName",
      width: 180,
      render: (name) => (
        <Text strong className="text-gray-800">
          {name}
        </Text>
      ),
    },
    {
      title: "USER ID",
      dataIndex: "userId",
      key: "userId",
      width: 130,
      render: (id) => (
        <Text
          copyable={{ text: id }}
          className="text-gray-500 font-mono text-[11px]"
        >
          #{id?.slice(-6)}
        </Text>
      ),
    },
    {
      title: "RIDER ID",
      dataIndex: "riderId",
      key: "riderId",
      width: 130,
      render: (id) =>
        id ? (
          <Text
            copyable={{ text: id }}
            className="text-gray-500 font-mono text-[11px]"
          >
            #{id.slice(-6)}
          </Text>
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "ITEMS",
      dataIndex: "items",
      key: "items",
      width: 120,
      render: (items) => <ItemsCard items={items} />,
    },
    {
      title: "DATE (BD)",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 170,
      render: (date) => (
        <Space size={4}>
          <CalendarOutlined className="text-gray-400" />
          <Text className="text-[12px]">
            {dayjs(date).format("DD/MM/YY hh:mm A")}
          </Text>
        </Space>
      ),
    },
    {
      title: "CUSTOMER",
      key: "customer",
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-indigo-700">
            {record.customerPhone}
          </Text>
          <Tooltip title={record.customerMessage}>
            <Text type="secondary" className="text-[11px] truncate w-[150px]">
              {record.customerMessage || "No message"}
            </Text>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "LOCATIONS",
      key: "locations",
      width: 300,
      render: (_, record) => (
        <div className="space-y-1 py-1">
          <div className="flex gap-1 items-start text-[11px]">
            <Tag color="green" className="m-0 scale-75 origin-left">
              FROM
            </Tag>
            <Text className="leading-tight text-gray-500 italic">
              {record.restaurantLocation}
            </Text>
          </div>
          <div className="flex gap-1 items-start text-[11px]">
            <Tag color="red" className="m-0 scale-75 origin-left">
              TO
            </Tag>
            <Text className="leading-tight text-gray-600 font-medium">
              {record.dropLocation}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "PRICING",
      key: "price",
      width: 180,
      render: (_, record) => (
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center">
            <Text className="text-[10px] uppercase text-gray-400">Total:</Text>
            <Text strong className="text-green-600">
              TK {record.totalAmount?.toFixed(0)}
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-[10px] uppercase text-gray-400">
              Rider Fee:
            </Text>
            <Text className="text-blue-500 font-medium">
              TK {record.riderFee?.toFixed(0)}
            </Text>
          </div>
        </div>
      ),
    },
    
    {
      title: "Platform",
      key: "platform",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-2 bg-lime-100 px-2 py-1 rounded-lg justify-center">
          {record.platform}
        </div>
      ),
    },
    {
      title: "LOGISTICS",
      key: "logistics",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-[12px] font-bold text-gray-700">
            {record.distance?.toFixed(2)} KM
          </div>
          <Button
            size="small"
            type="link"
            icon={<EnvironmentOutlined />}
            href={`https://www.google.com/maps?q=${record.coords?.lat},${record.coords?.long}`}
            target="_blank"
            className="p-0 h-auto text-[11px]"
          >
            Track Map
          </Button>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <AssignRider orderId={record._id} />
          <DeleteOrder orderId={record._id} />
          <UpdateOrderStatus currentStatus={record.status}/>
        </div>
      ),
    },
    
  ];

  return (
    <Layout>
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* Modern Header and Filter Section */}
        <Card className="mb-4 border-none shadow-sm rounded-xl">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Title level={3} className="m-0">
                Order Dashboard
              </Title>
              <Text type="secondary">Managing Zone ID: {user?.zoneId}</Text>
            </Col>
            <Col xs={24} md={12} className="text-right">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                className="bg-indigo-600 rounded-lg h-10"
              >
                Refresh Data
              </Button>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="User ID..."
                prefix={<SearchOutlined />}
                defaultValue={searchParams.get("userId")}
                onPressEnter={(e) => handleSearchByUserId(e.target.value)}
                allowClear
                className="rounded-lg h-10 shadow-sm"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Rider ID..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearchByRiderId(e.target.value)}
                allowClear
                className="rounded-lg h-10 shadow-sm"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Phone..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearchByPhoneNumber(e.target.value)}
                allowClear
                className="rounded-lg h-10 shadow-sm"
              />
              {errors?.phoneError && (
                <h1 className={"text-red-500 font-bold"}>
                  {errors?.phoneError}
                </h1>
              )}
            </Col>
          </Row>
        </Card>

        {/* Table Section */}
        <Card className="border-none shadow-sm rounded-xl overflow-hidden">
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 2200 }} // Increased for many columns
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
              className: "p-4 border-t",
            }}
          />
        </Card>
      </div>
    </Layout>
  );
}

export default Order;
