import React from "react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Spin, Table, Tag, Typography, Image, Badge, Rate, Space } from "antd";
import { image_uri } from "../utils/constants";
import UpdateDiscount from "../components/menu/UpdateDiscount";
import UpdateFlatformFee from "../components/menu/UpdatePlatformFee";

const { Text } = Typography;

function MenuScreen() {
  const { restaurantId } = useParams();

  const fetchRestaurantMenu = async () => {
    const { data } = await api.get(
      `/zone/restaurant/menu-list/${restaurantId}`,
    );
    return data?.result || [];
  };

  const { data: menuData = [], isLoading } = useQuery({
    queryFn: fetchRestaurantMenu,
    queryKey: ["menu", restaurantId],
    enabled: !!restaurantId,
  });

  const expandedRowRender = (record) => {
    const addonColumns = [
      { title: "Addon Title", dataIndex: "title", key: "title" },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (price) => <Text strong>৳ {price}</Text>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status ? "green" : "red"}>
            {status ? "Available" : "Hidden"}
          </Tag>
        ),
      },
    ];

    return (
      <Table
        columns={addonColumns}
        dataSource={record.addons}
        pagination={false}
        rowKey="_id"
        size="small"
      />
    );
  };

  const columns = [
    {
      title: "Item",
      dataIndex: "image",
      key: "image",
      width: 90,
      render: (img, record) => (
        <Image
          src={`${image_uri}${img}`}
          alt={record.name}
          width={60}
          height={60}
          className="rounded-lg object-cover"
          fallback="https://via.placeholder.com/60"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Tag color={record.isVeg ? "green" : "red"} className="text-[10px]">
            {record.isVeg ? "VEG" : "NON-VEG"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: "Pricing",
      key: "pricing",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text delete type="secondary" className="text-xs">
            Base: ৳ {record.basedPrice}
          </Text>
          <Text strong>Offer: ৳ {record.offerPrice}</Text>
          <Text type="secondary" className="text-xs">
            Platform Fee: ৳ {record.plateformFee}
          </Text>
        </Space>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discountRate",
      key: "discountRate",
      render: (discount) =>
        discount > 0 ? (
          <Tag color="green">{discount}% OFF</Tag>
        ) : (
          <Text type="secondary">No Discount</Text>
        ),
    },
    {
      title: "Rating",
      key: "rating",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Rate
            disabled
            allowHalf
            value={Number(record.averageRating) || 0}
            style={{ fontSize: 14 }}
          />
          <Text type="secondary" className="text-xs">
            {record.totalReviews || 0} Reviews
          </Text>
        </Space>
      ),
    },
    {
      title: "Preparation",
      dataIndex: "preparationTime",
      key: "preparationTime",
      render: (time) =>
        time ? (
          <Tag color="cyan">{time}</Tag>
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Stock Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "in stock" ? "success" : "error"}
          text={status}
        />
      ),
    },
    {
      title: "Popular",
      dataIndex: "isPopular",
      key: "isPopular",
      render: (pop) =>
        pop ? (
          <Tag color="orange">Popular</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (pop) =>
        pop ? (
          <Tag color="orange">Active</Tag>
        ) : (
          <Text type="secondary">Inactive</Text>
        ),
    },
    {
      title: "Approval",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (approved) =>
        approved ? (
          <Tag color="green">Approved</Tag>
        ) : (
          <Tag color="volcano">Pending</Tag>
        ),
    },

    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, menu) => {
        return (
          <div className={'flex gap-3'}>
            <UpdateDiscount
              currentDiscountRate={menu.discountRate}
              id={menu?._id}
            />
            <UpdateFlatformFee currentFee={menu.plateformFee} id={menu?._id} />
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Spin size="large" tip="Loading Menu..." />
        </div>
      </Layout>
    );
  }

  console.log("[menu]", menuData);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Typography.Title level={3}>
            Restaurant Menu Management
          </Typography.Title>
          <Tag color="purple">{menuData.length} Items Total</Tag>
        </div>

        <Table
          columns={columns}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) =>
              record.addons && record.addons.length > 0,
          }}
          dataSource={menuData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          bordered
          className="shadow-sm rounded-xl overflow-hidden"
        />
      </div>
    </Layout>
  );
}

export default MenuScreen;
