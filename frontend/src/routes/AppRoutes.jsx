import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import MainLayout from "../components/layout/MainLayout";
import PurchaseOrders from "../pages/PurchaseOrders/PurchaseOrders"
import PurchaseOrderDetail from "../pages/PurchaseOrderDetail/PurchaseOrderDetail";
import Products from "../pages/Products/Products";
import Suppliers from "../pages/Suppliers/Suppliers";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import SupplierDetail from "../pages/SupplierDetail/SupplierDetail";
import Inventory from "../pages/Inventory/Inventory";


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
        <Route path="/products/create" element={<ProductDetail />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/create" element={<SupplierDetail />} />
        <Route path="/suppliers/:id" element={<SupplierDetail />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pos" element={<POS />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} /></Routes>
  );
}

export default AppRoutes;