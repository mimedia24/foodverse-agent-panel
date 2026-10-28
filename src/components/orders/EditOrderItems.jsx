import React, { useMemo, useState } from "react";
import { Alert, Button, Checkbox, Divider, Input, List, Modal, Select, Space, Tag, Typography, message } from "antd";
import { EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../../api/config";

const { Text } = Typography;
const lockedStatuses = new Set(["picked up", "out for delivery", "on delivery", "delivery", "delivered", "cancelled", "cancelled by restaurant", "canceled", "canceled by restaurant"]);
const money = (value) => `TK ${Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
const idOf = (item) => String(item?._id || item?.menuId?._id || item?.menuId || item?.id || "");
const unitPrice = (item) => Number(item?.offerPrice ?? item?.sellingPrice ?? item?.basedPrice ?? 0);

export default function EditOrderItems({ order, onUpdated }) {
  const status = String(order?.status || "").toLowerCase().replace(/_/g, " ");
  const locked = lockedStatuses.has(status) || order?.pickupConfirmedAt || order?.pickupTime || order?.restaurantSettlement?.status === "PAID";
  const lockReason = order?.restaurantSettlement?.status === "PAID"
    ? "Restaurant payment is already confirmed. Reverse it before editing items."
    : order?.pickupConfirmedAt || order?.pickupTime || lockedStatuses.has(status)
      ? "Pickup is already confirmed. Order items can no longer be edited."
      : "";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState([]);

  const existingMenuMap = useMemo(() => new Map((order?.items || []).map((item) => [idOf(item), item])), [order]);
  const menuMap = useMemo(() => new Map(menus.map((item) => [idOf(item), item])), [menus]);
  const selected = useMemo(() => new Map(items.map((item) => [idOf(item), item])), [items]);
  const categories = useMemo(() => ["ALL", ...new Set(menus.map((item) => String(item?.category || "Other")))], [menus]);
  const visibleMenus = useMemo(() => menus.filter((item) => {
    const matchesSearch = String(item?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "ALL" || String(item?.category || "Other") === category;
    return matchesSearch && matchesCategory;
  }), [menus, search, category]);

  const summary = useMemo(() => {
    let itemsSubtotal = 0;
    let addonsSubtotal = 0;
    let packagingTotal = 0;
    let vatBase = 0;
    for (const selectedItem of items) {
      const id = idOf(selectedItem);
      const source = existingMenuMap.get(id) || menuMap.get(id) || {};
      itemsSubtotal += unitPrice(source) * Number(selectedItem.quantity || 1);
      packagingTotal += Number(source?.packagingCharge || 0) * Number(selectedItem.quantity || 1);
      vatBase += Number(source?.basedPrice || 0) * Number(selectedItem.quantity || 1);
      for (const selectedAddon of selectedItem.addons || []) {
        const oldAddon = (existingMenuMap.get(id)?.addons || []).find((addon) => idOf(addon) === idOf(selectedAddon));
        const menuAddon = (menuMap.get(id)?.addons || []).find((addon) => idOf(addon) === idOf(selectedAddon));
        addonsSubtotal += Number(oldAddon?.price ?? menuAddon?.price ?? 0) * Number(selectedAddon.quantity || 1);
        vatBase += Number(oldAddon?.price ?? menuAddon?.price ?? 0) * Number(selectedAddon.quantity || 1);
      }
    }
    const delivery = Number(order?.deliveryAmount || 0);
    const tip = Number(order?.tip || 0);
    const platformFee = Number(order?.orderPlatformFee || 0);
    const voucher = Number(order?.voucherAmount || 0);
    const vatAmount = Math.round(vatBase * Number(order?.chargeSnapshot?.vatRate ?? order?.vatRate ?? 0)) / 100;
    return { itemsSubtotal, addonsSubtotal, packagingTotal, vatAmount, delivery, tip, platformFee, voucher, estimatedTotal: Math.max(0, itemsSubtotal + addonsSubtotal + packagingTotal + vatAmount + delivery + tip + platformFee - voucher) };
  }, [existingMenuMap, items, menuMap, order]);

  const openEditor = async () => {
    if (locked) return message.warning(lockReason);
    try {
      setLoading(true);
      const { data } = await api.get(`/zone/order/${order._id}/edit-menu`);
      setMenus(data?.result || data?.data || []);
      setItems((order.items || []).map((item) => ({ _id: idOf(item), quantity: Number(item.quantity || 1), addons: (item.addons || []).map((addon) => ({ _id: idOf(addon), quantity: Number(addon.quantity || 1) })) })));
      setSearch("");
      setCategory("ALL");
      setReason("");
      setOpen(true);
    } catch (error) {
      message.error(error?.response?.data?.message || "Restaurant menu load failed.");
    } finally {
      setLoading(false);
    }
  };

  const changeQuantity = (menu, amount) => {
    const key = idOf(menu);
    setItems((current) => {
      const found = current.find((item) => idOf(item) === key);
      const next = Math.max(0, Number(found?.quantity || 0) + amount);
      if (!next) return current.filter((item) => idOf(item) !== key);
      if (found) return current.map((item) => idOf(item) === key ? { ...item, quantity: next } : item);
      return [...current, { _id: key, quantity: next, addons: [] }];
    });
  };

  const toggleAddon = (menu, addon, checked) => {
    const menuId = idOf(menu);
    const addonId = idOf(addon);
    setItems((current) => current.map((item) => {
      if (idOf(item) !== menuId) return item;
      const addons = checked
        ? [...(item.addons || []).filter((row) => idOf(row) !== addonId), { _id: addonId, quantity: 1 }]
        : (item.addons || []).filter((row) => idOf(row) !== addonId);
      return { ...item, addons };
    }));
  };

  const submit = async () => {
    if (!reason.trim()) return message.warning("পরিবর্তনের কারণ লিখুন।");
    if (!items.length) return message.warning("কমপক্ষে একটি item রাখতে হবে।");
    try {
      setLoading(true);
      const key = `agent-order-edit:${order._id}:${Date.now()}`;
      const { data } = await api.patch(`/zone/order/${order._id}/items`, {
        items: items.map((item) => ({ menuId: idOf(item), quantity: item.quantity, addons: item.addons || [] })),
        reason: reason.trim(),
        expectedRevision: Number(order.orderRevision || 0),
      }, { headers: { "Idempotency-Key": key } });
      if (!data?.success) throw new Error(data?.message || "Update failed.");
      message.success(`Order updated. New total ${money(data.newTotal)}.`);
      setOpen(false);
      onUpdated?.(data);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || "Order update failed.");
    } finally {
      setLoading(false);
    }
  };

  return <>
    <Button size="small" icon={<EditOutlined />} onClick={openEditor} title={lockReason || "Edit order items"} loading={loading}>Items</Button>
    <Modal open={open} title="Edit order items" width={720} onCancel={() => setOpen(false)} onOk={submit} confirmLoading={loading} okText="Review and apply">
      <Space.Compact block className="mb-3">
        <Input placeholder="Search restaurant menu" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={category} onChange={setCategory} style={{ minWidth: 170 }} options={categories.map((value) => ({ label: value === "ALL" ? "All categories" : value, value }))} />
      </Space.Compact>
      <List bordered size="small" className="max-h-[340px] overflow-auto" dataSource={visibleMenus} locale={{ emptyText: "No menu item found" }} renderItem={(menu) => {
        const selectedItem = selected.get(idOf(menu));
        const quantity = Number(selectedItem?.quantity || 0);
        return <List.Item actions={[<Space key="qty"><Button size="small" icon={<MinusOutlined />} onClick={() => changeQuantity(menu, -1)} disabled={!quantity} /><Tag color={quantity ? "blue" : "default"}>{quantity}</Tag><Button size="small" icon={<PlusOutlined />} onClick={() => changeQuantity(menu, 1)} disabled={Boolean(menu.unavailable)} /></Space>] }>
          <List.Item.Meta title={<Space>{menu.name}<Tag>{menu.category || "Other"}</Tag>{menu.unavailable ? <Tag color="red">Unavailable</Tag> : null}</Space>} description={<div><div>{money(existingMenuMap.get(idOf(menu)) ? unitPrice(existingMenuMap.get(idOf(menu))) : unitPrice(menu))} each</div>{quantity > 0 && (menu.addons || []).length ? <Space wrap className="mt-2">{menu.addons.map((addon) => { const checked = (selectedItem?.addons || []).some((row) => idOf(row) === idOf(addon)); return <Checkbox key={idOf(addon)} checked={checked} disabled={addon.status === false && !checked} onChange={(event) => toggleAddon(menu, addon, event.target.checked)}>{addon.title} (+{money(addon.price)}){addon.status === false ? " — unavailable" : ""}</Checkbox>; })}</Space> : null}</div>} />
        </List.Item>;
      }} />
      <Divider />
      <div className="grid grid-cols-2 gap-x-5 gap-y-1 rounded-xl bg-slate-50 p-3 text-sm">
        <Text>Original total</Text><Text strong className="text-right">{money(order?.totalAmount)}</Text>
        <Text>Items subtotal</Text><Text className="text-right">{money(summary.itemsSubtotal)}</Text>
        <Text>Add-ons</Text><Text className="text-right">{money(summary.addonsSubtotal)}</Text>
        <Text>Packaging charge</Text><Text className="text-right">{money(summary.packagingTotal)}</Text>
        <Text>VAT</Text><Text className="text-right">{money(summary.vatAmount)}</Text>
        <Text>Delivery + tip + fee</Text><Text className="text-right">{money(summary.delivery + summary.tip + summary.platformFee)}</Text>
        <Text>Current voucher</Text><Text className="text-right text-red-500">-{money(summary.voucher)}</Text>
        <Text strong>Estimated revised total</Text><Text strong className="text-right text-emerald-600">{money(summary.estimatedTotal)}</Text>
      </div>
      <Input.TextArea className="mt-3" rows={3} placeholder="Reason (required)" value={reason} maxLength={500} showCount onChange={(event) => setReason(event.target.value)} />
      <Alert className="mt-3" type="info" showIcon message="Server will confirm the exact voucher, settlement and payment adjustment before saving." />
    </Modal>
  </>;
}
