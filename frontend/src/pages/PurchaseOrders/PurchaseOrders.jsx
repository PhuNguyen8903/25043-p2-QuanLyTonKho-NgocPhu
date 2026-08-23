import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPurchaseOrders } from "../../services/purchaseOrderService";
import "./PurchaseOrders.css";

const PAGE_SIZE = 10;
const STATUS_CONFIG = {
  draft: {
    label: "draft",
    className: "status-draft",
  },

  confirmed: {
    label: "confirmed",
    className: "status-confirmed",
  },

  stocked: {
    label: "stocked",
    className: "status-stocked",
  },
};

function PurchaseOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchOrders = async (page = 1, keyword = search) => {
    try {
      setLoading(true);
      setError("");
      const data = await getPurchaseOrders({
        page,
        limit: PAGE_SIZE,
        search: keyword,
      });
      setOrders(data.data || []);
      setTotal(data.total || 0);
      setCurrentPage(page);

    } catch (error) {
      console.error(
        "Get purchase orders error:",
        error
      );
      setOrders([]);
      setTotal(0);
      setError(
        error.response?.data?.message ||
        "Không thể tải danh sách đơn mua hàng."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, "");
  }, []);


  const handleSearch = () => {
    setSearch(searchInput);
    fetchOrders(1, searchInput);
  };


  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };


  const handleCreate = () => {
    navigate("/purchaseorders/create");
  };



  const handleOrderClick = (orderId) => {
    navigate(`/purchaseorders/${orderId}`);
  };


  const totalPages = Math.ceil(total / PAGE_SIZE);
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchOrders(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchOrders(currentPage + 1);
    }
  };


  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  };



  const formatDate = (date) => {
    if (!date) {
      return "-";
    }
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };


  const getStatus = (status) => {
    return (
      STATUS_CONFIG[status] || {
        label: "unknown",
        className: "status-unknown",
      }
    );
  };



  return (
    <div className="purchase-orders-page">

      <div className="purchase-orders-header">

        <div>
          <h1>
            Danh sách Đơn mua hàng
          </h1>
          <p>
            Quản lý và theo dõi các đơn mua hàng
          </p>
        </div>

        <button type="button" className="create-order-button" onClick={handleCreate}>
          <span className="create-order-icon">
            +
          </span>
          Tạo mới
        </button>
      </div>


      <div className="purchase-orders-filter">
        <div className="filter-group">
          <label htmlFor="order-search">
            Mã đơn hàng / Tên nhà cung cấp
          </label>

          <input id="order-search" type="text" value={searchInput} placeholder="Nhập mã đơn hàng hoặc tên nhà cung cấp..."
            onChange={(event) => setSearchInput(event.target.value)} onKeyDown={handleSearchKeyDown} />

        </div>

        <button type="button" className="search-button" onClick={handleSearch} disabled={loading}>
          {loading
            ? "Đang tìm..."
            : "Tìm kiếm"}
        </button>
      </div>

      {error && (
        <div className="orders-error">
          {error}
        </div>
      )}

      <div className="purchase-orders-table-container">
        <table className="purchase-orders-table">
          <thead>
            <tr>
              <th>
                Mã đơn hàng
              </th>
              <th>
                Tên nhà cung cấp
              </th>
              <th>
                Ngày mua hàng
              </th>
              <th>
                Nhân viên phụ trách
              </th>
              <th>
                Tổng tiền
              </th>
              <th>
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-message">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-message">
                  Không tìm thấy đơn mua hàng.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const status =
                  getStatus(order.status);
                return (
                  <tr key={order.id} onClick={() => handleOrderClick(order.id)}>
                    <td className="order-code">
                      {order.purchaseCode}
                    </td>
                    <td>
                      {order.supplier?.supplierName ||
                        "-"}
                    </td>
                    <td>
                      {formatDate(order.order_date)}
                    </td>
                    <td>
                      {order.assignedEmployee?.username ||
                        "-"}
                    </td>
                    <td className="order-total">
                      {formatCurrency(
                        order.total_cost
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="orders-pagination">
        <button type="button" disabled={currentPage === 1 || loading || totalPages === 0} onClick={handlePreviousPage}>
          ← Trước
        </button>
        <span>
          Trang{" "}
          <strong>{currentPage}</strong>
          {" / "}
          <strong>
            {totalPages || 1}
          </strong>
        </span>

        <button type="button" disabled={currentPage >= totalPages || loading || totalPages === 0} onClick={handleNextPage}>
          Sau →
        </button>
      </div>
    </div>
  );
}

export default PurchaseOrders;