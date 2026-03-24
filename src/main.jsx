import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Login from "./screens/Login.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Order from "./screens/Order.jsx";
import AuthProvider from "./context/authContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Restaurant from "./screens/Restaurant.jsx";
import Riders from "./screens/Riders.jsx";
import RegisterRider from "./screens/RegisterRider.jsx";
import RiderPayment from "./screens/RiderPayment.jsx";
import MenuScreen from "./screens/MenuScreen.jsx";
import OrderMap from "./screens/OrderMap";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        {/* dashboard screen */}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <Restaurant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/menu/:restaurantId"
            element={
              <ProtectedRoute>
                <MenuScreen />
              </ProtectedRoute>
            }
          />
          {/* =====================riders ======================== */}
          <Route
            path="/riders"
            element={
              <ProtectedRoute>
                <Riders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider-register"
            element={
              <ProtectedRoute>
                <RegisterRider />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/rider-payment/:riderId"
            element={
              <ProtectedRoute>
                <RiderPayment />
              </ProtectedRoute>
            }
          />
          <Route path="/order-map" element={<OrderMap />} />
          {/* ==============auth================ */}
          {/* auth screen */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>,
);
