import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png"
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img className="sidebar-logo" src={logo}></img>
        <span>Yasuo</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/purchaseorders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>Đơn mua hàng</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>Sản phẩm</span>
        </NavLink>

        <NavLink
          to="/suppliers"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>Nhà cung cấp</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>Tồn kho</span>
        </NavLink>

        <NavLink
          to="/pos"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>POS</span>
        </NavLink>

        <NavLink
          to="/saleorders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>saleorders</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;