import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircle2,
  Layers3,
  Search,
  ShieldCheck,
  Store,
  Flame,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { image_uri } from "../utils/constants";
import { useAuth } from "../context/authContext";

const { Title, Text } = Typography;
const { Search: SearchInput } = Input;

function formatMoney(value) {
  return `BDT ${Number(value || 0).toLocaleString("en-BD")}`;
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function calculateSellingPrice(basedPrice, plateformFee) {
  return num(basedPrice) + num(plateformFee);
}

function calculateOfferPrice(basedPrice, plateformFee, discountRate) {
  const sellingPrice = calculateSellingPrice(basedPrice, plateformFee);
  const discountAmount = (sellingPrice * num(discountRate)) / 100;
  const offerPrice = sellingPrice - discountAmount;
  return offerPrice < 0 ? 0 : offerPrice;
}

function normalizeMenu(menu) {
  const categoryValue =
    typeof menu?.category === "string"
      ? menu.category
      : menu?.category?.name || menu?.category?.title || "Uncategorized";

  const restaurantValue =
    typeof menu?.restaurantId === "string"
      ? menu.restaurantId
      : menu?.restaurantId?._id ||
        menu?.restaurant?._id ||
        menu?.sourceRestaurantId ||
        "N/A";

  const basedPriceValue = num(menu?.basedPrice);
  const plateformFeeValue = num(menu?.plateformFee);
  const discountRateValue = num(menu?.discountRate);

  const sellingPrice = calculateSellingPrice(basedPriceValue, plateformFeeValue);
  const calculatedOfferPrice = calculateOfferPrice(
    basedPriceValue,
    plateformFeeValue,
    discountRateValue
  );

  return {
    ...menu,
    key: menu?._id,
    categoryLabel: categoryValue,
    restaurantIdLabel: restaurantValue,
    titleLabel: menu?.title || menu?.name || "Untitled Menu",
    descriptionLabel: menu?.description || "No description",
    basedPriceValue,
    plateformFeeValue,
    discountRateValue,
    sellingPrice,
    calculatedOfferPrice,
    isApprovedBool: !!menu?.isApproved,
    isPopularBool: !!menu?.isPopular,
  };
}

function StatusTag({ status }) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "in stock") return <Tag color="blue">in stock</Tag>;
  if (normalized === "out of stock") return <Tag color="red">out of stock</Tag>;
  if (normalized === "discontinued") return <Tag color="default">discontinued</Tag>;

  return <Tag>{status || "unknown"}</Tag>;
}

function StatsCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function UpdateDiscountButton({ menuId, currentDiscountRate = 0, queryKey }) {
  const [open, setOpen] = useState(false);
  const [discountRate, setDiscountRate] = useState(currentDiscountRate);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      const { data } = await api.put("/zone/menu/update-discount-rate", {
        menuId,
        discountRate: Number(discountRate || 0),
      });

      if (data?.success) {
        message.success(data?.message || "Discount updated successfully");
        setOpen(false);
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update discount");
    }
  };

  return (
    <>
      <Button type="primary" size="small" onClick={() => setOpen(true)}>
        Update discount
      </Button>

      <Modal
        open={open}
        title="Update Discount"
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Update"
      >
        <Input
          type="number"
          value={discountRate}
          onChange={(e) => setDiscountRate(e.target.value)}
          placeholder="Enter discount rate"
        />
      </Modal>
    </>
  );
}

function UpdatePlatformFeeButton({ menuId, currentFee = 0, queryKey }) {
  const [open, setOpen] = useState(false);
  const [platformFee, setPlatformFee] = useState(currentFee);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      const { data } = await api.put("/zone/menu/update-platform-fee", {
        menuId,
        platformFee: Number(platformFee || 0),
      });

      if (data?.success) {
        message.success(data?.message || "Platform fee updated successfully");
        setOpen(false);
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update platform fee");
    }
  };

  return (
    <>
      <Button type="primary" size="small" onClick={() => setOpen(true)}>
        Update fee
      </Button>

      <Modal
        open={open}
        title="Update Platform Fee"
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Update"
      >
        <Input
          type="number"
          value={platformFee}
          onChange={(e) => setPlatformFee(e.target.value)}
          placeholder="Enter platform fee"
        />
      </Modal>
    </>
  );
}

function ApprovalToggle({ menuId, checked, queryKey }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = async (nextChecked) => {
    try {
      setLoading(true);

      const { data } = await api.put("/zone/approve-menu", {
        menuId,
        isApproved: nextChecked,
      });

      if (data?.success) {
        message.success(data?.message || "Approval updated successfully");
        queryClient.invalidateQueries({ queryKey });
      } else {
        message.error(data?.message || "Failed to update approval");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update approval");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Checkbox
      checked={checked}
      onChange={(e) => handleChange(e.target.checked)}
      disabled={loading}
    />
  );
}

function PopularToggle({ menuId, checked, queryKey }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = async (nextChecked) => {
    try {
      setLoading(true);

      const { data } = await api.put(
        `/menu/update/popular?menuId=${menuId}&status=${nextChecked}`
      );

      if (data?.success) {
        message.success(data?.message || "Popular status updated successfully");
        queryClient.invalidateQueries({ queryKey });
      } else {
        message.error(data?.message || "Failed to update popular status");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to update popular status"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Checkbox
      checked={checked}
      onChange={(e) => handleChange(e.target.checked)}
      disabled={loading}
    />
  );
}

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

    const rows = Array.isArray(response?.data?.result) ? response.data.result : [];
    items = [...items, ...rows];

    if (!rows.length || rows.length < limit) break;
    page += 1;
  }

  return Array.from(new Map(items.map((item) => [item._id, item])).values());
}

async function fetchAllMenusByZone(zoneId) {
  const restaurants = await fetchAllRestaurants(zoneId);
  const restaurantIds = restaurants.map((item) => item?._id).filter(Boolean);

  const menuChunks = [];
  const chunkSize = 5;

  for (let i = 0; i < restaurantIds.length; i += chunkSize) {
    const chunk = restaurantIds.slice(i, i + chunkSize);

    const results = await Promise.allSettled(
      chunk.map((restaurantId) =>
        api.get(`/zone/restaurant/menu-list/${restaurantId}`)
      )
    );

    results.forEach((result, index) => {
      if (result.status !== "fulfilled") return;

      const restaurantId = chunk[index];
      const rows = Array.isArray(result?.value?.data?.result)
        ? result.value.data.result
        : [];

      const mapped = rows.map((menu) => ({
        ...menu,
        sourceRestaurantId: restaurantId,
      }));

      menuChunks.push(...mapped);
    });
  }

  return Array.from(new Map(menuChunks.map((item) => [item._id, item])).values());
}

function AllMenus() {
  const { user } = useAuth();
  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [menuIdSearch, setMenuIdSearch] = useState("");
  const [restaurantIdSearch, setRestaurantIdSearch] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});

  const queryKey = ["all-menus", zoneId];

  const { data: rawMenuData = [], isLoading, isFetching } = useQuery({
    queryFn: () => fetchAllMenusByZone(zoneId),
    queryKey,
    enabled: !!zoneId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const menuData = useMemo(() => rawMenuData.map(normalizeMenu), [rawMenuData]);

  const categoryOptions = useMemo(() => {
    const set = new Set(menuData.map((item) => item.categoryLabel).filter(Boolean));
    return Array.from(set);
  }, [menuData]);

  const filteredData = useMemo(() => {
    return menuData.filter((item) => {
      const rowStatus = String(statusDrafts[item._id] || item.status || "").toLowerCase();
      const menuIdValue = String(item._id || "").toLowerCase();
      const restaurantValue = String(item.restaurantIdLabel || "").toLowerCase();

      const matchesStatus =
        statusFilter === "all" || rowStatus === String(statusFilter).toLowerCase();

      const matchesCategory =
        categoryFilter === "all" || item.categoryLabel === categoryFilter;

      const matchesMenuId = !menuIdSearch.trim()
        ? true
        : menuIdValue.includes(menuIdSearch.trim().toLowerCase());

      const matchesRestaurantId = !restaurantIdSearch.trim()
        ? true
        : restaurantValue.includes(restaurantIdSearch.trim().toLowerCase());

      return matchesStatus && matchesCategory && matchesMenuId && matchesRestaurantId;
    });
  }, [
    menuData,
    statusDrafts,
    statusFilter,
    categoryFilter,
    menuIdSearch,
    restaurantIdSearch,
  ]);

  const stats = useMemo(() => {
    return {
      total: filteredData.length,
      inStock: filteredData.filter(
        (item) =>
          String(statusDrafts[item._id] || item.status).toLowerCase() === "in stock"
      ).length,
      approved: filteredData.filter((item) => !!item.isApprovedBool).length,
      popular: filteredData.filter((item) => !!item.isPopularBool).length,
    };
  }, [filteredData, statusDrafts]);

  const columns = [
    {
      title: "SL No",
      key: "serial",
      width: 78,
      fixed: "left",
      render: (_, __, index) => (
        <span className="font-semibold text-slate-600">{index + 1}</span>
      ),
    },
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 180,
      render: (value) => (
        <Text copyable className="text-xs text-slate-600">
          {value}
        </Text>
      ),
    },
    {
      title: "Thumbnails",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (img, record) => (
        <Image
          src={`${image_uri}${img}`}
          alt={record.titleLabel}
          width={56}
          height={56}
          className="rounded-full object-cover"
          fallback="https://via.placeholder.com/56"
        />
      ),
    },
    {
      title: "Restaurant ID",
      dataIndex: "restaurantIdLabel",
      key: "restaurantIdLabel",
      width: 190,
      render: (value) => <Text copyable className="text-xs">{value}</Text>,
    },
    {
      title: "Category",
      dataIndex: "categoryLabel",
      key: "categoryLabel",
      width: 150,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value, record) => (
        <StatusTag status={statusDrafts[record._id] || value} />
      ),
    },
    {
      title: "Title",
      dataIndex: "titleLabel",
      key: "titleLabel",
      width: 180,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Description",
      dataIndex: "descriptionLabel",
      key: "descriptionLabel",
      width: 220,
      ellipsis: true,
      render: (value) => <Text className="text-slate-600">{value}</Text>,
    },
    {
      title: "Based Price",
      dataIndex: "basedPriceValue",
      key: "basedPriceValue",
      width: 120,
      render: (value) => (
        <Text strong className="text-green-600">
          {formatMoney(value)}
        </Text>
      ),
    },
    {
      title: "Platform Fee",
      dataIndex: "plateformFeeValue",
      key: "plateformFeeValue",
      width: 120,
      render: (value) => (
        <Text strong className="text-slate-600">
          {formatMoney(value)}
        </Text>
      ),
    },
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 150,
      render: (value) => (
        <Text strong className="text-blue-600">
          {formatMoney(value)}
        </Text>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discountRateValue",
      key: "discountRateValue",
      width: 100,
      render: (value) => (
        <Text strong className="text-orange-500">
          {Number(value || 0)}%
        </Text>
      ),
    },
    {
      title: "Offer Price",
      dataIndex: "calculatedOfferPrice",
      key: "calculatedOfferPrice",
      width: 120,
      render: (value) => (
        <Text strong className="text-red-500">
          {formatMoney(value)}
        </Text>
      ),
    },
    {
      title: "Change status",
      key: "changeStatus",
      width: 150,
      render: (_, record) => (
        <Select
          size="small"
          value={statusDrafts[record._id] || record.status || "in stock"}
          style={{ width: 130 }}
          options={[
            { label: "in stock", value: "in stock" },
            { label: "out of stock", value: "out of stock" },
            { label: "discontinued", value: "discontinued" },
          ]}
          onChange={(value) =>
            setStatusDrafts((prev) => ({
              ...prev,
              [record._id]: value,
            }))
          }
        />
      ),
    },
    {
      title: "Update Discount",
      key: "updateDiscount",
      width: 150,
      render: (_, record) => (
        <UpdateDiscountButton
          menuId={record._id}
          currentDiscountRate={record.discountRateValue}
          queryKey={queryKey}
        />
      ),
    },
    {
      title: "Update Fee",
      key: "updateFee",
      width: 140,
      render: (_, record) => (
        <UpdatePlatformFeeButton
          menuId={record._id}
          currentFee={record.plateformFeeValue}
          queryKey={queryKey}
        />
      ),
    },
    {
      title: "Admin Approval",
      key: "isApproved",
      width: 140,
      render: (_, record) => (
        <ApprovalToggle
          menuId={record._id}
          checked={record.isApprovedBool}
          queryKey={queryKey}
        />
      ),
    },
    {
      title: "Popular",
      key: "isPopular",
      width: 100,
      render: (_, record) => (
        <PopularToggle
          menuId={record._id}
          checked={record.isPopularBool}
          queryKey={queryKey}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[80vh] items-center justify-center">
          <Spin size="large" tip="Loading all menus..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-600">
                Food Verse Agent Menu Control
              </p>
              <Title level={2} style={{ margin: "8px 0 0", fontWeight: 900 }}>
                All Menus
              </Title>
              <Text type="secondary">
                All restaurant menus together with pricing, approval and control columns.
              </Text>
            </div>

            <div className="flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Badge status={isFetching ? "processing" : "success"} />
              <span className="text-sm font-medium text-slate-700">
                {isFetching ? "Refreshing data..." : "Live data ready"}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              icon={Layers3}
              label="Total Menus"
              value={stats.total}
              hint="Filtered result count"
            />
            <StatsCard
              icon={CheckCircle2}
              label="In Stock"
              value={stats.inStock}
              hint="Available menu items"
            />
            <StatsCard
              icon={ShieldCheck}
              label="Approved"
              value={stats.approved}
              hint="Admin approved items"
            />
            <StatsCard
              icon={Flame}
              label="Popular"
              value={stats.popular}
              hint="Popular tagged items"
            />
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-5">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "all", value: "all" },
                { label: "in stock", value: "in stock" },
                { label: "out of stock", value: "out of stock" },
                { label: "discontinued", value: "discontinued" },
              ]}
              size="large"
            />

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { label: "Filter category", value: "all" },
                ...categoryOptions.map((item) => ({
                  label: item,
                  value: item,
                })),
              ]}
              size="large"
            />

            <SearchInput
              allowClear
              size="large"
              placeholder="Input menu id"
              prefix={<Search size={15} className="text-slate-400" />}
              value={menuIdSearch}
              onChange={(e) => setMenuIdSearch(e.target.value)}
              onSearch={setMenuIdSearch}
            />

            <SearchInput
              allowClear
              size="large"
              placeholder="Input restaurant id"
              prefix={<Store size={15} className="text-slate-400" />}
              value={restaurantIdSearch}
              onChange={(e) => setRestaurantIdSearch(e.target.value)}
              onSearch={setRestaurantIdSearch}
            />

            <Button
              size="large"
              onClick={() => {
                setStatusFilter("all");
                setCategoryFilter("all");
                setMenuIdSearch("");
                setRestaurantIdSearch("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 20, showSizeChanger: false, position: ["bottomRight"] }}
            scroll={{ x: 2600 }}
            size="middle"
            bordered={false}
          />
        </div>
      </div>
    </Layout>
  );
}

export default AllMenus;