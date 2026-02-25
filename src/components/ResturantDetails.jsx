import React from "react";
import { Tag, Tooltip } from "antd";
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
  Calendar,
} from "lucide-react";
import { image_uri } from "../utils/constants";

function RestaurantDetails({ res }) {
  return (
    <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">

      {/* Image Section */}
      <div className="relative h-72">
        <img
          src={`${image_uri}${res.image}`}
          alt={res.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-4 left-4 flex gap-2">
          {res.isVerify && (
            <Tag color="blue" icon={<ShieldCheck size={14} />}>
              Verified
            </Tag>
          )}
          {res.isPopular && (
            <Tag color="orange" icon={<TrendingUp size={14} />}>
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

      {/* Content */}
      <div className="p-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{res.name}</h2>
          <p className="text-sm text-slate-500">{res.description}</p>
        </div>

        {/* Contact & Owner */}
        <div className="flex justify-start items-center gap-4">
            <div>
                
          <Info icon={<MapPin size={16} />} label="Address" value={res.address} />
          <Info icon={<Phone size={16} />} label="Phone" value={res.phone} />
          <Info icon={<Mail size={16} />} label="Email" value={res.email} />
          <Info icon={<Clock size={16} />} label="Time" value={`${res.openingTime} - ${res.closingTime}`} />
          </div>
          <div>
            <Info icon={<Star size={16} />} label="Rating" value={`${res.averageReview} (${res.totalReviews} reviews)`} />
          <Info icon={<Wallet size={16} />} label="Balance" value={`€ ${res.balance}`} />
          <Info icon={<Home size={16} />} label="Homemade" value={res.isHomeMade ? "Yes" : "No"} />
          <Info icon={<Cake size={16} />} label="Cake Available" value={res.isCake ? "Yes" : "No"} />
        </div></div>

        {/* Status Section */}
        <div className="flex flex-wrap gap-2">
          <Tag color="purple">Status: {res.status}</Tag>
          <Tag color="cyan">Zone: {res.zoneId}</Tag>
          <Tag>Timezone: {res.timeZone}</Tag>
          <Tag>Transactions: {res.transactions?.length || 0}</Tag>
          <Tag>Reviews: {res.reviews?.length || 0}</Tag>
        </div>

        {/* Location Coordinates */}
        {res.restaurantCoordinator?.coordinates && (
          <div className="text-xs text-slate-400">
            Coordinates: {res.restaurantCoordinator.coordinates.join(", ")}
          </div>
        )}

        {/* Footer Meta */}
        <div className="text-xs text-slate-400 border-t pt-4">
          Last Updated: {new Date(res.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

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

export default RestaurantDetails;