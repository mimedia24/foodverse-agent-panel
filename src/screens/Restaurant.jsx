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
  TrendingUp,
  Home,
  Cake,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  ArrowUpRight,
  Store,
  Wallet,
} from "lucide-react";
import { image_uri } from "../utils/constants";
import { Button, Input, Tag, Tooltip } from "antd";
import RestaurantDetails from "../components/ResturantDetails";
import { Link } from "react-router";

function Restaurant() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data, isLoading } = useQuery({
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

  console.log(restaurants);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Restaurant Partners
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Zone{" "}
              <span className="text-indigo-600 font-semibold">
                {user?.zoneId}
              </span>{" "}
              • {data?.total || 0} active partners
            </p>
          </div>
        </div>


        {/* KPI Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: <Store size={22} />,
              title: "Total Stores",
              value: data?.total || 0,
              color: "indigo",
            },
            {
              icon: <Wallet size={22} />,
              title: "Total Balance",
              value: "€ 42.5k",
              color: "emerald",
            },
            {
              icon: <Star size={22} />,
              title: "Average Rating",
              value: "4.8",
              color: "amber",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${item.color}-50 text-${item.color}-600 mb-4`}
              >
                {item.icon}
              </div>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                {item.title}
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Restaurant Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center py-24 opacity-60">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
              Loading restaurants...
            </p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <Store size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">
              No Restaurants Found
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              There are no partners registered in this zone.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            {restaurants.map((res) => (
              <RestaurantDetails res={res} />
            ))}
          </div>
        )}

        {/* Modern Pagination */}
        <div className="mt-20 flex justify-center gap-4">
          <Button
            shape="round"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </Button>

          <span className="px-6 py-2 bg-white border rounded-2xl shadow-sm font-bold text-slate-600">
            Page {page}
          </span>

          <Button
            shape="round"
            disabled={restaurants.length < limit}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default Restaurant;
