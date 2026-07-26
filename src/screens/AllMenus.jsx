import React, {useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  Image,
  Input,
  InputNumber,
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
  Plus,
  Trash2,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import {PLACEHOLDER_IMAGE} from "../utils/constants";
import {normalizeImageUrl} from "../utils/image";
import {useAuth} from "../context/authContext";

const {Title, Text} = Typography;
const {Search: SearchInput} = Input;

const updatePopularMenu = ({menuId, isPopular, position}) => {
  return api.put("/zone/menu/update-popular", {
    menuId,
    isPopular,
    position,
  });
};

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

  const calculatedSellingPrice = calculateSellingPrice(
    basedPriceValue,
    plateformFeeValue,
  );
  const sellingPrice =
    menu?.sellingPrice !== null &&
    menu?.sellingPrice !== undefined &&
    Number.isFinite(Number(menu.sellingPrice))
    ? num(menu.sellingPrice)
    : calculatedSellingPrice;
  const calculatedOfferPrice =
    menu?.offerPrice !== null &&
    menu?.offerPrice !== undefined &&
    Number.isFinite(Number(menu.offerPrice))
    ? num(menu.offerPrice)
    : calculateOfferPrice(
        basedPriceValue,
        plateformFeeValue,
        discountRateValue,
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
    popularPositionValue: num(menu?.position || 999),
  };
}

function StatusTag({status}) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "in stock") return <Tag color="blue">in stock</Tag>;
  if (normalized === "out of stock") return <Tag color="red">out of stock</Tag>;
  if (normalized === "discontinued") {
    return <Tag color="default">discontinued</Tag>;
  }

  return <Tag>{status || "unknown"}</Tag>;
}

function StatsCard({icon: Icon, label, value, hint}) {
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
          {React.createElement(Icon, { size: 20 })}
        </div>
      </div>
    </div>
  );
}

function UpdateDiscountButton({menuId, currentDiscountRate = 0, queryKey}) {
  const [open, setOpen] = useState(false);
  const [discountRate, setDiscountRate] = useState(currentDiscountRate);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      const {data} = await api.put("/zone/menu/update-discount-rate", {
        menuId,
        discountRate: Number(discountRate || 0),
      });

      if (data?.success) {
        message.success(data?.message || "Discount updated successfully");
        setOpen(false);
        queryClient.invalidateQueries({queryKey});
      } else {
        message.error(data?.message || "Failed to update discount");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to update discount",
      );
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
        okText="Update">
        <InputNumber
          min={0}
          max={100}
          value={discountRate}
          onChange={value => setDiscountRate(value)}
          placeholder="Enter discount rate"
          style={{width: "100%"}}
        />
      </Modal>
    </>
  );
}

function UpdatePlatformFeeButton({menuId, currentFee = 0, queryKey}) {
  const [open, setOpen] = useState(false);
  const [platformFee, setPlatformFee] = useState(currentFee);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      const {data} = await api.put("/zone/menu/update-platform-fee", {
        menuId,
        platformFee: Number(platformFee || 0),
      });

      if (data?.success) {
        message.success(data?.message || "Platform fee updated successfully");
        setOpen(false);
        queryClient.invalidateQueries({queryKey});
      } else {
        message.error(data?.message || "Failed to update platform fee");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to update platform fee",
      );
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
        okText="Update">
        <InputNumber
          min={0}
          value={platformFee}
          onChange={value => setPlatformFee(value)}
          placeholder="Enter platform fee"
          style={{width: "100%"}}
        />
      </Modal>
    </>
  );
}

function ApprovalToggle({menuId, checked, queryKey}) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = async nextChecked => {
    try {
      setLoading(true);

      const {data} = await api.put("/zone/approve-menu", {
        menuId,
        isApproved: nextChecked,
      });

      if (data?.success) {
        message.success(data?.message || "Approval updated successfully");
        queryClient.invalidateQueries({queryKey});
      } else {
        message.error(data?.message || "Failed to update approval");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to update approval",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Checkbox
      checked={checked}
      onChange={e => handleChange(e.target.checked)}
      disabled={loading}
    />
  );
}

function PopularToggle({menuId, checked, queryKey, currentPosition = 999}) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = async nextChecked => {
    try {
      setLoading(true);

      const position = nextChecked ? currentPosition || 999 : 999;

      const {data} = await updatePopularMenu({
        menuId,
        isPopular: nextChecked,
        position,
      });

      if (data?.success) {
        message.success(data?.message || "Popular status updated successfully");
        queryClient.invalidateQueries({queryKey});
      } else {
        message.error(data?.message || "Failed to update popular status");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to update popular status",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Checkbox
      checked={checked}
      onChange={e => handleChange(e.target.checked)}
      disabled={loading}
    />
  );
}

function createRowsFromPopularMenus(popularMenus = []) {
  if (!Array.isArray(popularMenus) || popularMenus.length === 0) {
    return [
      {
        id: Date.now(),
        menuId: "",
        position: 1,
      },
    ];
  }

  return popularMenus
    .slice()
    .sort(
      (a, b) =>
        Number(a?.popularPositionValue || 999) -
        Number(b?.popularPositionValue || 999),
    )
    .map((item, index) => ({
      id: `${item._id}-${index}-${Date.now()}`,
      menuId: item._id || "",
      position: Number(item.popularPositionValue || index + 1),
      name: item.titleLabel || item.name || "",
    }));
}

function SetPopularMenuButton({
  queryKey,
  popularMenus = [],
  menuOptions = [],
}) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState(createRowsFromPopularMenus(popularMenus));

  const openModal = () => {
    setRows(createRowsFromPopularMenus(popularMenus));
    setOpen(true);
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        menuId: "",
        position: prev.length + 1,
      },
    ]);
  };

  const removeRow = id => {
    setRows(prev => {
      if (prev.length === 1) {
        return [
          {
            id: Date.now(),
            menuId: "",
            position: 1,
          },
        ];
      }

      return prev.filter(item => item.id !== id);
    });
  };

  const updateRow = (id, key, value) => {
    setRows(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const cleanedRows = rows
      .map(item => ({
        menuId: String(item.menuId || "").trim(),
        position: Number(item.position || 0),
      }))
      .filter(item => item.menuId);

    const hasInvalidPosition = cleanedRows.some(
      item => !Number.isFinite(item.position) || item.position <= 0,
    );

    if (cleanedRows.length === 0) {
      message.error("Please select at least one menu item.");
      return;
    }

    if (hasInvalidPosition) {
      message.error("Position must be greater than 0.");
      return;
    }

    const duplicateMenuIds = cleanedRows
      .map(item => item.menuId)
      .filter((menuId, index, arr) => arr.indexOf(menuId) !== index);

    if (duplicateMenuIds.length > 0) {
      message.error("Same menu ID cannot be used multiple times.");
      return;
    }

    const duplicatePositions = cleanedRows
      .map(item => item.position)
      .filter((position, index, arr) => arr.indexOf(position) !== index);

    if (duplicatePositions.length > 0) {
      message.error("Same position cannot be used multiple times.");
      return;
    }

    const submittedMenuIds = cleanedRows.map(item => item.menuId);

    const removedPopularMenus = popularMenus.filter(
      item => item?._id && !submittedMenuIds.includes(item._id),
    );

    try {
      setSaving(true);

      const turnOnRequests = cleanedRows.map(item =>
        updatePopularMenu({
          menuId: item.menuId,
          isPopular: true,
          position: item.position,
        }),
      );

      const turnOffRequests = removedPopularMenus.map(item =>
        updatePopularMenu({
          menuId: item._id,
          isPopular: false,
          position: 999,
        }),
      );

      const results = await Promise.allSettled([
        ...turnOnRequests,
        ...turnOffRequests,
      ]);

      const successCount = results.filter(
        result => result.status === "fulfilled" && result.value?.data?.success,
      ).length;

      const failedCount = results.length - successCount;

      if (successCount > 0) {
        message.success(`${cleanedRows.length} popular menu saved successfully.`);
        queryClient.invalidateQueries({queryKey});
      }

      if (failedCount > 0) {
        message.warning(
          `${failedCount} menu failed to update. Please retry.`,
        );
      }

      setRows(
        cleanedRows.map((item, index) => ({
          id: `${item.menuId}-${item.position}-${Date.now()}-${index}`,
          menuId: item.menuId,
          position: item.position,
        })),
      );
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to set popular menu.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        size="large"
        type="primary"
        icon={<Flame size={16} />}
        onClick={openModal}
        className="bg-purple-600">
        Set Popular Menu
      </Button>

      <Modal
        open={open}
        title="Set Popular Menu"
        onCancel={handleClose}
        onOk={handleSubmit}
        okText="Save Popular Menu"
        confirmLoading={saving}
        width={720}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <p className="text-sm font-semibold text-purple-800">
              Select menu items from your own zone and give each one a unique
              display position. Saving replaces the current popular order.
            </p>
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="col-span-12 md:col-span-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {index + 1}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-7">
                  <Select
                    showSearch
                    value={row.menuId}
                    onChange={value => updateRow(row.id, "menuId", value)}
                    options={menuOptions}
                    optionFilterProp="label"
                    placeholder="Select a zone menu item"
                    allowClear
                    className="w-full"
                  />

                  {row.name ? (
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {row.name}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-10 md:col-span-3">
                  <InputNumber
                    min={1}
                    value={row.position}
                    onChange={value => updateRow(row.id, "position", value)}
                    placeholder="Position"
                    style={{width: "100%"}}
                  />
                </div>

                <div className="col-span-2 flex justify-end md:col-span-1">
                  <Button
                    danger
                    type="text"
                    icon={<Trash2 size={16} />}
                    onClick={() => removeRow(row.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button block type="dashed" icon={<Plus size={16} />} onClick={addRow}>
            Add another popular menu
          </Button>
        </div>
      </Modal>
    </>
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

    const rows = Array.isArray(response?.data?.result)
      ? response.data.result
      : [];

    items = [...items, ...rows];

    if (!rows.length || rows.length < limit) break;
    page += 1;
  }

  return Array.from(new Map(items.map(item => [item._id, item])).values());
}

async function fetchAllMenusByZone(zoneId) {
  const restaurants = await fetchAllRestaurants(zoneId);
  const restaurantIds = restaurants.map(item => item?._id).filter(Boolean);

  const menuChunks = [];
  const chunkSize = 5;

  for (let i = 0; i < restaurantIds.length; i += chunkSize) {
    const chunk = restaurantIds.slice(i, i + chunkSize);

    const results = await Promise.allSettled(
      chunk.map(restaurantId =>
        api.get(`/zone/restaurant/menu-list/${restaurantId}`),
      ),
    );

    results.forEach((result, index) => {
      if (result.status !== "fulfilled") return;

      const restaurantId = chunk[index];
      const rows = Array.isArray(result?.value?.data?.result)
        ? result.value.data.result
        : [];

      const mapped = rows.map(menu => ({
        ...menu,
        sourceRestaurantId: restaurantId,
      }));

      menuChunks.push(...mapped);
    });
  }

  return Array.from(new Map(menuChunks.map(item => [item._id, item])).values());
}

function AllMenus() {
  const {user} = useAuth();
  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [menuIdSearch, setMenuIdSearch] = useState("");
  const [restaurantIdSearch, setRestaurantIdSearch] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});

  const queryKey = ["all-menus", zoneId];

  const {
    data: rawMenuData = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryFn: () => fetchAllMenusByZone(zoneId),
    queryKey,
    enabled: !!zoneId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const menuData = useMemo(() => rawMenuData.map(normalizeMenu), [rawMenuData]);

  const popularMenuRows = useMemo(() => {
    return menuData
      .filter(item => item.isPopularBool)
      .sort(
        (a, b) =>
          Number(a.popularPositionValue || 999) -
          Number(b.popularPositionValue || 999),
      );
  }, [menuData]);

  const categoryOptions = useMemo(() => {
    const set = new Set(
      menuData.map(item => item.categoryLabel).filter(Boolean),
    );

    return Array.from(set);
  }, [menuData]);

  const filteredData = useMemo(() => {
    return menuData.filter(item => {
      const rowStatus = String(
        statusDrafts[item._id] || item.status || "",
      ).toLowerCase();

      const menuIdValue = String(item._id || "").toLowerCase();
      const restaurantValue = String(
        item.restaurantIdLabel || "",
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        rowStatus === String(statusFilter).toLowerCase();

      const matchesCategory =
        categoryFilter === "all" || item.categoryLabel === categoryFilter;

      const matchesMenuId = !menuIdSearch.trim()
        ? true
        : menuIdValue.includes(menuIdSearch.trim().toLowerCase());

      const matchesRestaurantId = !restaurantIdSearch.trim()
        ? true
        : restaurantValue.includes(restaurantIdSearch.trim().toLowerCase());

      return (
        matchesStatus && matchesCategory && matchesMenuId && matchesRestaurantId
      );
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
        item =>
          String(statusDrafts[item._id] || item.status).toLowerCase() ===
          "in stock",
      ).length,
      approved: filteredData.filter(item => !!item.isApprovedBool).length,
      popular: filteredData.filter(item => !!item.isPopularBool).length,
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
      render: value => (
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
          src={normalizeImageUrl(img)}
          fallback={PLACEHOLDER_IMAGE}
          alt={record.titleLabel}
          width={56}
          height={56}
          className="rounded-full object-cover"
        />
      ),
    },
    {
      title: "Restaurant ID",
      dataIndex: "restaurantIdLabel",
      key: "restaurantIdLabel",
      width: 190,
      render: value => <Text copyable className="text-xs">{value}</Text>,
    },
    {
      title: "Category",
      dataIndex: "categoryLabel",
      key: "categoryLabel",
      width: 150,
      render: value => <Tag color="blue">{value}</Tag>,
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
      render: value => <Text strong>{value}</Text>,
    },
    {
      title: "Description",
      dataIndex: "descriptionLabel",
      key: "descriptionLabel",
      width: 220,
      ellipsis: true,
      render: value => <Text className="text-slate-600">{value}</Text>,
    },
    {
      title: "Based Price",
      dataIndex: "basedPriceValue",
      key: "basedPriceValue",
      width: 120,
      render: value => (
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
      render: value => (
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
      render: value => (
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
      render: value => (
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
      render: value => (
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
          style={{width: 130}}
          options={[
            {label: "in stock", value: "in stock"},
            {label: "out of stock", value: "out of stock"},
            {label: "discontinued", value: "discontinued"},
          ]}
          onChange={value =>
            setStatusDrafts(prev => ({
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
          currentPosition={record.popularPositionValue}
          queryKey={queryKey}
        />
      ),
    },
    {
      title: "Popular Position",
      key: "popularPosition",
      width: 140,
      render: (_, record) =>
        record.isPopularBool ? (
          <Tag color="purple">#{record.popularPositionValue || 999}</Tag>
        ) : (
          <Tag>Not popular</Tag>
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

              <Title level={2} style={{margin: "8px 0 0", fontWeight: 900}}>
                All Menus
              </Title>

              <Text type="secondary">
                All restaurant menus together with pricing, approval, popular
                position and control columns.
              </Text>
            </div>

            <div className="flex flex-col gap-2 self-start md:flex-row md:items-center">
              <SetPopularMenuButton
                queryKey={queryKey}
                popularMenus={popularMenuRows}
                menuOptions={menuData.map(item => ({
                  value: item._id,
                  label: `${item.titleLabel} — ${item.restaurantIdLabel}`,
                }))}
              />

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Badge status={isFetching ? "processing" : "success"} />
                <span className="text-sm font-medium text-slate-700">
                  {isFetching ? "Refreshing data..." : "Live data ready"}
                </span>
              </div>
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
                {label: "all", value: "all"},
                {label: "in stock", value: "in stock"},
                {label: "out of stock", value: "out of stock"},
                {label: "discontinued", value: "discontinued"},
              ]}
              size="large"
            />

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                {label: "Filter category", value: "all"},
                ...categoryOptions.map(item => ({
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
              onChange={e => setMenuIdSearch(e.target.value)}
              onSearch={setMenuIdSearch}
            />

            <SearchInput
              allowClear
              size="large"
              placeholder="Input restaurant id"
              prefix={<Store size={15} className="text-slate-400" />}
              value={restaurantIdSearch}
              onChange={e => setRestaurantIdSearch(e.target.value)}
              onSearch={setRestaurantIdSearch}
            />

            <Button
              size="large"
              onClick={() => {
                setStatusFilter("all");
                setCategoryFilter("all");
                setMenuIdSearch("");
                setRestaurantIdSearch("");
              }}>
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              position: ["bottomRight"],
            }}
            scroll={{x: 2800}}
            size="middle"
            bordered={false}
          />
        </div>
      </div>
    </Layout>
  );
}

export default AllMenus;
