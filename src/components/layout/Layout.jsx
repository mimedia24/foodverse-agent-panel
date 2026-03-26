import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Bike,
  Settings,
  Menu,
  X,
  LogOut,
  MapPin,
  ListOrdered,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../context/authContext";

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)]"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`}
  >
    <Icon size={19} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const closeAfterClick = () => {
    if (window.innerWidth < 1024) toggleSidebar();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[linear-gradient(180deg,#020617_0%,#07132d_100%)] text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-5 py-5 border-b border-white/10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-blue-300">
              Food Verse Agent
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Admin <span className="text-blue-500">Panel</span>
            </h1>
          </div>

          <button
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={toggleSidebar}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="px-4 py-5 space-y-2">
          <Link to="/" onClick={closeAfterClick}>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={
                location.pathname === "/" || location.pathname === "/dashboard"
              }
            />
          </Link>

          <Link to="/orders" onClick={closeAfterClick}>
            <NavItem
              icon={ShoppingCart}
              label="Orders"
              active={location.pathname.includes("/orders")}
            />
          </Link>

          <Link to="/order-map" onClick={closeAfterClick}>
            <NavItem
              icon={MapPin}
              label="Order Map"
              active={location.pathname.includes("/order-map")}
            />
          </Link>          

          <Link to="/restaurants" onClick={closeAfterClick}>
            <NavItem
              icon={Utensils}
              label="Restaurants"
              active={location.pathname.includes("/restaurants")}
            />
          </Link>

          <Link to="/riders" onClick={closeAfterClick}>
            <NavItem
              icon={Bike}
              label="Riders"
              active={
                location.pathname.startsWith("/rider") ||
                location.pathname.includes("/riders")
              }
            />
          </Link>

          <Link to="/all-menus" onClick={closeAfterClick}>
            <NavItem
              icon={ListOrdered}
              label="All Menus"
              active={location.pathname.includes("/all-menus")}
            />
          </Link>
          
          <Link to="/reports" onClick={closeAfterClick}>
            <NavItem
             icon={BarChart3}
             label="Reports"
             active={location.pathname.includes("/reports")}
           />
          </Link>

          <button className="w-full text-left">
            <NavItem
              icon={Settings}
              label="Settings"
              active={location.pathname.includes("/settings")}
            />
          </button>

          <div className="pt-4 mt-4 border-t border-white/10">
            <div onClick={() => logout()}>
              <NavItem icon={LogOut} label="Logout" />
            </div>
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-4 px-4 py-3 md:px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-600">
                Food Verse Agent Admin
              </p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Agent Panel
              </h2>
            </div>
          </div>
        </header>

        <main className="overflow-x-hidden overflow-y-auto p-4 md:p-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
