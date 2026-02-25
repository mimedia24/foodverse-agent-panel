import { Button, Divider, Tag } from "antd";
import React, { useState } from "react";
import GlobalModal from "../molecules/GlobalModal";
import { image_uri } from "../../utils/constants";

function ItemsCard({ items }) {
  const [itemsModal, setItemsModal] = useState(false);
  const baseURL = image_uri;

  // --- Calculations using reduce ---

  // 1. Total Restaurant (Base) Price
  const totalBasePrice = items?.reduce(
    (acc, item) =>
      acc + Number(item.basedPrice || 0) * Number(item.quantity || 1),
    0,
  );

  const totalAddonsPrice = items?.reduce((acc, item) => {
    const itemsAddonArray =
      item.addons?.map((add) => (add.quantity || 1) * (add.price || 0)) || [];
    const itemTotalAddons = itemsAddonArray.reduce((sum, val) => sum + val, 0);
    return acc + itemTotalAddons;
  }, 0);

  const totalSellingPrice = items?.reduce((acc, item) => {
    const price = item.sellingPrice > 0 ? item.sellingPrice : item.offerPrice;
    return acc + Number(price || 0) * Number(item.quantity || 1);
  }, 0);

  return (
    <div>
      <Button
        type="primary"
        variant="outlined"
        onClick={() => setItemsModal(true)}
      >
        View menu ({items?.length || 0})
      </Button>

      <GlobalModal
        title={"Order Items List"}
        open={itemsModal}
        onOk={() => setItemsModal(false)}
        onCancel={() => setItemsModal(false)}
        width={600}
      >
        <div className="flex flex-col gap-4 py-2">
          {items?.map((item, index) => (
            <div
              key={item._id || index}
              className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors border-gray-200"
            >
              {/* Main Item Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <img
                    src={`${baseURL}${item.image}`}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border bg-white"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 italic">
                      From: {item.restaurantId?.name}
                    </p>
                    <div className="mt-2">
                      <Tag color={item.isVeg ? "green" : "red"}>
                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </Tag>
                      <Tag color="blue">{item.category}</Tag>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-xs text-gray-400 uppercase font-bold">
                    Qty
                  </span>
                  <span className="text-xl font-black text-indigo-600">
                    x{item.quantity}
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mt-4 grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-dashed border-gray-300">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Restaurant Price
                  </p>
                  <p className="text-base font-semibold text-gray-700">
                    TK {item.basedPrice}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-indigo-400 uppercase font-bold">
                    Offer Price
                  </p>
                  <p className="text-lg font-black text-indigo-600">
                    TK{" "}
                    {item.sellingPrice > 0
                      ? item.sellingPrice
                      : item.offerPrice}
                  </p>
                </div>
              </div>

              {/* Addons Section */}
              {item.addons?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Extra Addons
                  </p>
                  <div className="space-y-2">
                    {item.addons.map((addon) => (
                      <div
                        key={addon._id}
                        className="flex justify-between items-center text-sm bg-indigo-50/50 px-3 py-1.5 rounded-md border border-indigo-100"
                      >
                        <span className="text-gray-700 font-medium">
                          {addon.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">
                            Qty: {addon.quantity}
                          </span>
                          <span className="font-bold text-indigo-600">
                            +TK {addon.price}
                          </span>
                          <span className="font-bold text-indigo-600">
                            = TK {addon.price * addon.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Summary Footer Section */}
          {items?.length > 0 && (
            <div className="mt-4 p-5 bg-gray-900 rounded-2xl text-white">
              <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-widest">
                Pricing Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Total Restaurant Price:</span>
                  <span className="font-semibold text-gray-200">
                    TK {totalBasePrice}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Total Addons Cost:</span>
                  <span className="font-semibold text-amber-400">
                    + TK {totalAddonsPrice}
                  </span>
                </div>
                <Divider className="my-2 border-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-white">
                    Grand Total (Selling):
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-green-400">
                      TK {totalSellingPrice + totalAddonsPrice}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">
                      VAT & Platform fees may apply
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {items?.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No items found in this order.
            </div>
          )}
        </div>
      </GlobalModal>
    </div>
  );
}

export default ItemsCard;
