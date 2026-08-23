import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import MainLayout from "../components/layout/MainLayout";
import PurchaseOrders from "../pages/PurchaseOrders/PurchaseOrders"
import PurchaseOrderDetail from "../pages/PurchaseOrderDetail/PurchaseOrderDetail";


function Products() {
  return <h2>Danh sách Sản phẩm</h2>;
}

function Suppliers() {
  return <h2>Danh sách Nhà cung cấp</h2>;
}

function Inventory() {
  return <h2>Quản lý Tồn kho</h2>;
}

function POS() {
  return <h2>POS</h2>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path="/purchaseorders" element={<PurchaseOrders />} />
        <Route path="/purchaseorders/create" element={<PurchaseOrderDetail />} />
        <Route path="/purchaseorders/:id" element={<PurchaseOrderDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pos" element={<POS />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} /></Routes>
  );
}

export default AppRoutes;