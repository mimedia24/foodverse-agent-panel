import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/authContext";
import api from "../api/config";
import Layout from "../components/layout/Layout";
import { useSearchParams } from "react-router";
import { image_uri } from "../utils/constants";

// Enhanced Status Badges
const Badge = ({ children, colorClass }) => (
  <span
    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colorClass}`}
  >
    {children}
  </span>
);

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
      return data; // Returning the whole object to get result + pagination info
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
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Rider Management
            </h1>
            <p className="text-gray-500">
              Zone ID: {user?.zoneId} | Total Pages: {totalPages}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border font-medium">
            Current Page: {page}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riders.map((rider) => (
                <div
                  key={rider._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* Header Section */}
                  <div className="p-5 flex items-start justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`${image_uri}/${rider.profileImage}`}
                          alt={rider.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${rider.riderStatus === "active" ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize leading-tight">
                          {rider.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mb-1">
                          ID: {rider._id}
                        </p>
                        <div className="flex gap-1">
                          <Badge
                            colorClass={
                              rider.session === "busy"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-blue-100 text-blue-600"
                            }
                          >
                            {rider.session}
                          </Badge>
                          <Badge colorClass="bg-gray-100 text-gray-600">
                            {rider.riderType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className="px-5 pb-4 flex-grow space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-green-50 p-2 rounded-xl">
                        <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider">
                          Earnings
                        </p>
                        <p className="text-lg font-black text-green-700">
                          ${rider.earning}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-xl">
                        <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">
                          Cash Col.
                        </p>
                        <p className="text-lg font-black text-blue-700">
                          ${rider.cashCollection}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">📧</span>
                        <span className="truncate">{rider.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-lg">📞</span>
                        <span className="font-semibold">
                          {rider.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-500 italic text-xs leading-relaxed">
                        <span className="text-lg not-italic">📍</span>
                        {rider.address}
                      </div>
                    </div>
                  </div>

                  {/* Footer / Documents Section */}
                  <div className="p-4 bg-gray-50 border-t mt-auto flex justify-between items-center">
                    <div className="flex gap-2">
                      <a
                        href={`${image_uri}/${rider.nidFront}`}
                        target="_blank"
                        className="text-[10px] bg-white border px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      >
                        NID Front
                      </a>
                      <a
                        href={`${image_uri}/${rider.nidBack}`}
                        target="_blank"
                        className="text-[10px] bg-white border px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      >
                        NID Back
                      </a>
                    </div>
                    {rider.isBanned && (
                      <span className="text-red-600 font-black text-[10px] border-2 border-red-600 px-2 rounded animate-pulse">
                        BANNED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex justify-center items-center gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-6 py-2 bg-white text-gray-700 font-bold rounded-xl shadow-sm border disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                ← Previous
              </button>
              <span className="text-gray-400 font-medium">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md disabled:bg-gray-300 hover:bg-indigo-700 transition-all"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Riders;
