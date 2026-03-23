import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/authContext";
import api from "../api/config";
import Layout from "../components/layout/Layout";
import { Link, useSearchParams } from "react-router";
import { image_uri } from "../utils/constants";
import { Button, Popconfirm, Tooltip, Tag } from "antd";
import {
  Plus,
  Trash2,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import RiderStatus from "../components/riders/RiderStatus";

const StatusBadge = ({ status }) => {
  const configs = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    busy: "bg-amber-100 text-amber-700 border-amber-200",
    offline: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${configs[status] || configs.offline}`}
    >
      {status}
    </span>
  );
};

function Riders() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 6;

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["riders", user?.zoneId, page],
    queryFn: async () => {
      const { data } = await api.post("/zone/rider-list", {
        zoneId: user?.zoneId,
        page,
        limit,
      });
      return data;
    },
    enabled: !!user?.zoneId,
  });

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  const riders = apiResponse?.result || [];
  const totalPages = apiResponse?.totalPages || 1;

  return (
    <Layout>
      <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Rider Fleet
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Zone <span className="text-indigo-600">#{user?.zoneId}</span> •{" "}
              {apiResponse?.totalRiders || 0} Total Riders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={"/rider-register"}>
              <Button
                type="primary"
                size="large"
                icon={<Plus size={18} />}
                className="rounded-xl font-bold h-11 shadow-indigo-100 shadow-lg"
              >
                Register New Rider
              </Button>
            </Link>
          </div>
        </div>

        {/* Mini Stats Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Avg Earning", value: "$450", color: "text-green-600" },
            { label: "Active Now", value: "12", color: "text-blue-600" },
            {
              label: "Pending Payout",
              value: "$1,200",
              color: "text-orange-600",
            },
            { label: "Fleet Health", value: "98%", color: "text-purple-600" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                {stat.label}
              </p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {riders.map((rider) => (
                <div
                  key={rider._id}
                  className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Top Info Bar */}
                  <div className="p-6 flex items-start gap-5">
                    <div className="relative shrink-0">
                      <img
                        src={`${rider.profileImage}`}
                        alt={rider.name}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-gray-50"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-full ${rider.riderStatus === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate capitalize">
                          {rider.name}
                        </h3>
                        <StatusBadge status={rider.session} />
                      </div>
                      <p className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-tighter">
                        ID: {rider._id}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-gray-500 text-xs font-medium">
                          <Phone size={12} /> {rider.phoneNumber}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-gray-500 text-xs font-medium">
                          <Tag
                            color="blue"
                            className="m-0 border-none bg-transparent p-0 lowercase"
                          >
                            {rider.riderType}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Grid */}
                  <div className="px-6 grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-blue-50/50">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                        Total Earnings
                      </p>
                      <p className="text-xl font-black text-blue-700">
                        ৳ {rider.earning}
                      </p>
                    </div>
                    <div className="bg-[#FDF2F8] p-4 rounded-2xl border border-pink-50/50">
                      <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">
                        Cash Collection
                      </p>
                      <p className="text-xl font-black text-pink-700">
                        ৳ {rider.cashCollection}
                      </p>
                    </div>
                  </div>

                  {/* Address & Actions */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-2 text-gray-500 text-xs leading-relaxed line-clamp-1 italic bg-gray-50/50 p-2 rounded-lg">
                      <MapPin size={14} className="shrink-0 text-gray-400" />
                      {rider.address || "No address provided"}
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex gap-2">
                        <Link to={`/rider-payment/${rider._id}`}>
                          <Button
                            icon={<CreditCard size={16} />}
                            className="rounded-xl font-bold flex items-center gap-2 border-none bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            Pay Rider
                          </Button>
                        </Link>
                        <Popconfirm
                          title="Delete Rider?"
                          description="This action cannot be undone."
                          onConfirm={() => console.log("deleted")}
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            danger
                            type="text"
                            icon={<Trash2 size={18} />}
                            className="rounded-xl"
                          />
                        </Popconfirm>
                      </div>

                      {/* Rider Status Dropdowns (From your custom component) */}
                      <RiderStatus
                        initialAccount={rider.status}
                        initialDuty={rider.session}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modern Pagination */}
            <div className="mt-12 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium ml-2">
                Showing{" "}
                <span className="text-gray-900 font-bold">
                  {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, apiResponse?.totalRiders || 0)}
                </span>{" "}
                of {apiResponse?.totalRiders || 0}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-400 hover:bg-gray-50"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Riders;
