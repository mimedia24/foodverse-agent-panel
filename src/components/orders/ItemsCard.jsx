import React, { useMemo, useState } from "react";
import { Button, Modal, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { image_uri } from "../../utils/constants";

const { Text } = Typography;

const toNumber = (value) => {
  if (typeof value === "string") {
    const cleaned = value.replace(/[৳,+\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (value) => {
  return `TK ${Math.round(toNumber(value)).toLocaleString("en-BD")}`;
};

const buildImageUrl = (image) => {
  if (!image) {
    return "";
  }

  const imageText = String(image).trim();

  if (!imageText) {
    return "";
  }

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:image")
  ) {
    return imageText;
  }

  const baseUrl = String(image_uri || "https://api.foodversedelivery.com").replace(
    /\/$/,
    ""
  );

  if (imageText.startsWith("/")) {
    return `${baseUrl}${imageText}`;
  }

  return `${baseUrl}/${imageText}`;
};

const getPlatformFee = (item) => {
  return toNumber(
    item?.plateformFee ??
      item?.platformFee ??
      item?.platformFees ??
      item?.adminFee ??
      item?.serviceFee ??
      0
  );
};

const getDirectDiscountAmount = (item) => {
  return toNumber(
    item?.discountAmount ??
      item?.menuDiscountAmount ??
      item?.offerDiscountAmount ??
      item?.itemDiscountAmount ??
      item?.discountValue ??
      0
  );
};

const getDiscountRate = (item) => {
  return toNumber(
    item?.discountRate ??
      item?.discountPercent ??
      item?.discountPercentage ??
      item?.offerDiscount ??
      item?.discount ??
      0
  );
};

const getRestaurantUnitPrice = (item) => {
  return toNumber(
    item?.restaurantPrice ??
      item?.restaurantAmount ??
      item?.restaurantEarning ??
      item?.basedPrice ??
      item?.basePrice ??
      item?.menuId?.basedPrice ??
      item?.menuId?.basePrice ??
      item?.menu?.basedPrice ??
      0
  );
};

const getSellingBeforeDiscount = (item) => {
  const restaurantPrice = getRestaurantUnitPrice(item);
  const platformFee = getPlatformFee(item);

  if (restaurantPrice > 0 || platformFee > 0) {
    return restaurantPrice + platformFee;
  }

  return (
    toNumber(item?.sellingPrice) ||
    toNumber(item?.offerPrice) ||
    toNumber(item?.price) ||
    0
  );
};

const getDiscountAmount = (item) => {
  const beforeDiscount = getSellingBeforeDiscount(item);
  const directDiscount = getDirectDiscountAmount(item);

  if (directDiscount > 0) {
    return directDiscount;
  }

  const discountRate = getDiscountRate(item);

  if (beforeDiscount > 0 && discountRate > 0) {
    return (beforeDiscount * discountRate) / 100;
  }

  return 0;
};

const getCustomerUnitPrice = (item) => {
  const beforeDiscount = getSellingBeforeDiscount(item);
  const discountAmount = getDiscountAmount(item);
  const calculatedPrice = Math.max(0, beforeDiscount - discountAmount);

  if (beforeDiscount > 0) {
    return calculatedPrice;
  }

  return toNumber(
    item?.discountedPrice ??
      item?.finalPrice ??
      item?.finalOfferPrice ??
      item?.salePrice ??
      item?.customerPrice ??
      item?.payablePrice ??
      0
  );
};

const getQuantity = (item) => {
  return toNumber(item?.quantity || item?.qty || 1) || 1;
};

const getItemName = (item) => {
  return (
    item?.name ||
    item?.title ||
    item?.menuName ||
    item?.menuId?.name ||
    item?.menuId?.title ||
    item?.menu?.name ||
    "Item"
  );
};

const getRestaurantName = (item) => {
  return (
    item?.restaurantName ||
    item?.restaurantId?.name ||
    item?.restaurant?.name ||
    item?.menuId?.restaurantId?.name ||
    "Restaurant"
  );
};

const getCategoryName = (item) => {
  return (
    item?.category ||
    item?.categoryName ||
    item?.menuId?.category ||
    item?.menuId?.categoryName ||
    ""
  );
};

const getItemImage = (item) => {
  return (
    item?.image ||
    item?.thumbnail ||
    item?.photo ||
    item?.menuImage ||
    item?.menuId?.image ||
    item?.menuId?.thumbnail ||
    item?.menuId?.photo ||
    item?.menu?.image ||
    item?.menu?.thumbnail ||
    ""
  );
};

const getAddonsTotal = (items = []) => {
  return items.reduce((total, item) => {
    const addons = Array.isArray(item?.addons) ? item.addons : [];

    const addonTotal = addons.reduce((sum, addon) => {
      return (
        sum +
        toNumber(addon?.price || addon?.addonPrice) *
          (toNumber(addon?.quantity || addon?.qty || 1) || 1)
      );
    }, 0);

    return total + addonTotal;
  }, 0);
};

function ItemsCard({ items = [] }) {
  const [open, setOpen] = useState(false);
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const summary = useMemo(() => {
    const totalRestaurantPrice = safeItems.reduce((sum, item) => {
      return sum + getRestaurantUnitPrice(item) * getQuantity(item);
    }, 0);

    const totalSellingBeforeDiscount = safeItems.reduce((sum, item) => {
      return sum + getSellingBeforeDiscount(item) * getQuantity(item);
    }, 0);

    const totalDiscount = safeItems.reduce((sum, item) => {
      return sum + getDiscountAmount(item) * getQuantity(item);
    }, 0);

    const totalCustomerPrice = safeItems.reduce((sum, item) => {
      return sum + getCustomerUnitPrice(item) * getQuantity(item);
    }, 0);

    const totalAddonsCost = getAddonsTotal(safeItems);

    return {
      totalRestaurantPrice,
      totalSellingBeforeDiscount,
      totalDiscount,
      totalCustomerPrice,
      totalAddonsCost,
      grandTotalSelling: totalCustomerPrice + totalAddonsCost,
    };
  }, [safeItems]);

  return (
    <>
      <Button
        size="small"
        type="link"
        icon={<EyeOutlined />}
        onClick={() => setOpen(true)}
        className="p-0 text-[11px] font-bold"
      >
        {safeItems.length} item{safeItems.length > 1 ? "s" : ""}
      </Button>

      <Modal
        title="Order Items List"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={() => setOpen(false)}>
            OK
          </Button>,
        ]}
        width={520}
        centered
      >
        <div className="space-y-4">
          {safeItems.map((item, index) => {
            const quantity = getQuantity(item);
            const restaurantPrice = getRestaurantUnitPrice(item);
            const beforeDiscount = getSellingBeforeDiscount(item);
            const discountAmount = getDiscountAmount(item);
            const customerPrice = getCustomerUnitPrice(item);
            const categoryName = getCategoryName(item);
            const imageUrl = buildImageUrl(getItemImage(item));

            return (
              <div
                key={item?._id || item?.id || `${getItemName(item)}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={getItemName(item)}
                        className="h-full w-full object-cover border bg-white"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="m-0 text-base font-black text-slate-900">
                          {getItemName(item)}
                        </h4>

                        <p className="m-0 mt-1 text-xs italic text-slate-500">
                          From: {getRestaurantName(item)}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item?.foodType ? (
                            <Tag color="red" className="m-0">
                              {item.foodType}
                            </Tag>
                          ) : null}

                          {item?.isVeg !== undefined ? (
                            <Tag
                              color={item.isVeg ? "green" : "red"}
                              className="m-0"
                            >
                              {item.isVeg ? "Veg" : "Non-Veg"}
                            </Tag>
                          ) : null}

                          {categoryName ? (
                            <Tag color="blue" className="m-0">
                              {categoryName}
                            </Tag>
                          ) : null}

                          {discountAmount > 0 ? (
                            <Tag color="orange" className="m-0">
                              Discount {formatMoney(discountAmount)}
                            </Tag>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-slate-400">
                          Qty
                        </div>
                        <div className="text-lg font-black text-indigo-600">
                          x{quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Restaurant Price
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-700">
                      {formatMoney(restaurantPrice)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Selling Price
                    </div>
                    <div className="mt-1 text-sm font-black text-blue-600">
                      {formatMoney(customerPrice)}
                    </div>

                    {discountAmount > 0 ? (
                      <div className="mt-1 text-[10px] font-bold text-rose-500">
                        Before {formatMoney(beforeDiscount)}
                      </div>
                    ) : null}
                  </div>
                </div>

                {Array.isArray(item?.addons) && item.addons.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      Extra Addons
                    </p>

                    <div className="space-y-2">
                      {item.addons.map((addon, addonIndex) => {
                        const addonQuantity =
                          toNumber(addon?.quantity || addon?.qty || 1) || 1;
                        const addonPrice = toNumber(
                          addon?.price || addon?.addonPrice
                        );

                        return (
                          <div
                            key={addon?._id || addon?.id || addonIndex}
                            className="flex items-center justify-between rounded-md border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-sm"
                          >
                            <span className="font-medium text-slate-700">
                              {addon?.title || addon?.name || "Addon"}
                            </span>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">
                                Qty: {addonQuantity}
                              </span>

                              <span className="font-bold text-indigo-600">
                                +{formatMoney(addonPrice)}
                              </span>

                              <span className="font-bold text-indigo-600">
                                = {formatMoney(addonPrice * addonQuantity)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {safeItems.length > 0 ? (
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <div className="mb-4 text-[12px] font-black uppercase tracking-[0.22em] text-slate-400">
                Pricing Summary
              </div>

              <div className="space-y-3">
                <SummaryRow
                  label="Total Restaurant Price"
                  value={summary.totalRestaurantPrice}
                />
                <SummaryRow
                  label="Before Discount Selling"
                  value={summary.totalSellingBeforeDiscount}
                />
                <SummaryRow
                  label="Total Discount"
                  value={summary.totalDiscount}
                  danger
                />
                <SummaryRow
                  label="Total Addons Cost"
                  value={summary.totalAddonsCost}
                  warning
                />

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <Text className="!text-base !font-black !text-white">
                      Grand Total Selling
                    </Text>

                    <Text className="!text-2xl !font-black !text-emerald-400">
                      {formatMoney(summary.grandTotalSelling)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              No items found in this order.
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

function SummaryRow({ label, value, danger = false, warning = false }) {
  let colorClass = "!text-white";

  if (danger) {
    colorClass = "!text-rose-400";
  }

  if (warning) {
    colorClass = "!text-yellow-400";
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Text className="!text-sm !font-semibold !text-slate-300">{label}</Text>
      <Text className={`!text-sm !font-black ${colorClass}`}>
        {danger && value > 0 ? "-" : ""}
        {formatMoney(value)}
      </Text>
    </div>
  );
}

export default ItemsCard;
