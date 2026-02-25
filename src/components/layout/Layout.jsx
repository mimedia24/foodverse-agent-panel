import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Bike,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router";

const NavItem = ({ icon: Icon, label, active }) => (
  <button
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  console.log("[navigation]", location.pathname);

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between px-6 py-4 lg:justify-center">
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Foodverse<span className="text-blue-500">Admin</span>
          </h1>
          <button className="lg:hidden text-white" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          <Link to={"/"}>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={location.pathname === "/" ? true : false}
            />
          </Link>
          <Link to={"/orders"} className={"my-2"}>
            <NavItem
              icon={ShoppingCart}
              label="Orders"
              active={location.pathname.includes("/orders") ? true : false}
            />
          </Link>

          <Link to={"/restaurants"} className={"my-2"}>
            <NavItem
              icon={Utensils}
              label="Restaurants"
              active={location.pathname.includes("/restaurants") ? true : false}
            />
          </Link>

          <Link to={"/riders"} className={"my-2"}>
            <NavItem
              icon={Bike}
              label="Riders"
              active={location.pathname.includes("/riders") ? true : false}
            />
          </Link>
          <NavItem
            icon={Settings}
            label="Settings"
            active={location.pathname.includes("/settings") ? true : false}
          />
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b lg:hidden px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Deligo</h2>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
