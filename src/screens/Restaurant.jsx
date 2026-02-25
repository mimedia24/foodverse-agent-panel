import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";
import {
  MapPin,
  Star,
  Clock,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  TrendingUp,
  Home,
  Cake,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { image_uri } from "../utils/constants";

function Restaurant() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["restaurants", user?.zoneId, page],
    queryFn: async () => {
      const response = await api.post("/zone/restaurant-list", {
        zoneId: user?.zoneId,
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!user?.zoneId,
  });

  const restaurants = data?.result || [];

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Restaurant Directory
          </h1>
          <p className="text-gray-500">
            Managing {data?.total || 0} establishments in Zone {user?.zoneId}
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC3173]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {restaurants.map((res) => (
              <div
                key={res._id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row"
              >
                {/* Left: Image & Quick Badges */}
                <div className="relative md:w-48 w-full h-48 md:h-auto">
                  <img
                    src={`${image_uri}${res.image}`}
                    alt={res.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {res.isVerify && (
                      <span className="bg-blue-500 text-white p-1 rounded-full">
                        <ShieldCheck size={14} />
                      </span>
                    )}
                    {res.isPopular && (
                      <span className="bg-orange-500 text-white p-1 rounded-full">
                        <TrendingUp size={14} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Detailed Content */}
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {res.name}
                      </h2>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        ID: {res._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${res.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {res.isOpen ? "OPEN" : "CLOSED"}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 italic">
                    "{res.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Column 1: Contact & Location */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={14} className="text-[#DC3173]" />{" "}
                        {res.address}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={14} /> {res.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 truncate">
                        <Mail size={14} /> {res.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <User size={14} /> Owner: {res.owner}
                      </div>
                    </div>

                    {/* Column 2: Stats & Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} /> {res.openingTime} -{" "}
                        {res.closingTime}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Star
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />{" "}
                        {res.averageReview} ({res.totalReviews} reviews)
                      </div>
                      <div className="flex items-center gap-2 text-green-600 font-bold">
                        € {res.balance.toLocaleString()}{" "}
                        <span className="text-[10px] text-gray-400 font-normal">
                          Balance
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {res.isHomeMade && (
                          <Home
                            size={16}
                            className="text-purple-500"
                            title="Homemade"
                          />
                        )}
                        {res.isCake && (
                          <Cake
                            size={16}
                            className="text-pink-500"
                            title="Cakes Available"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${res.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100"}`}
                    >
                      STATUS: {res.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Updated: {new Date(res.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-12 gap-6 pb-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft />
          </button>

          <span className="font-bold text-gray-700">Page {page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={restaurants.length < limit || isPlaceholderData}
            className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Restaurant;
