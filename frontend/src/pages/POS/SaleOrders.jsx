import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSaleOrders } from "../../services//posService";
import "./SaleOrders.css";

function SaleOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSaleOrders({
                page,
                limit,
                search,
            });

            setOrders(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Get sale orders error:", error);

            setError(
                error.response?.data?.message ||
                "Không thể tải danh sách đơn bán."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchOrders();
    };

    const handleOrderClick = (id) => {
        navigate(`/saleorders/${id}`);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(value || 0));
    };

    const formatDate = (value) => {
        if (!value) return "";

        return new Date(value).toLocaleDateString("vi-VN");
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="sale-orders-page">

            <div className="sale-orders-header">

                <div>
                    <h1>Danh sách đơn bán</h1>
                    <p>
                        Quản lý các đơn hàng bán đã thực hiện
                    </p>
                </div>

            </div>

            <div className="sale-orders-search">

                <input
                    type="text"
                    placeholder="Nhập mã đơn hoặc tên nhân viên..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={handleSearch}
                >
                    Tìm kiếm
                </button>

            </div>

            {error && (
                <div className="sale-orders-error">
                    {error}
                </div>
            )}

            <div className="sale-orders-table-container">

                <table className="sale-orders-table">

                    <thead>
                        <tr>
                            <th>Mã đơn bán</th>
                            <th>Khách hàng</th>
                            <th>Nhân viên</th>
                            <th>Ngày bán</th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="table-message"
                                >
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="table-message"
                                >
                                    Chưa có đơn bán.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() =>
                                        handleOrderClick(order.id)
                                    }
                                >

                                    <td className="sale-code">
                                        {order.saleCode}
                                    </td>

                                    <td>
                                        {order.customer_name ||
                                            "Khách lẻ"}
                                    </td>

                                    <td>
                                        {order.saler?.fullName ||
                                            order.saler?.username ||
                                            "—"}
                                    </td>

                                    <td>
                                        {formatDate(order.created_at)}
                                    </td>

                                    <td className="sale-total">
                                        {formatCurrency(
                                            order.total_amount
                                        )}
                                    </td>

                                    <td>
                                        {order.payment_method ===
                                        "cash"
                                            ? "Tiền mặt"
                                            : "Chuyển khoản"}
                                    </td>

                                    <td>
                                        <span className="sale-status">
                                            {order.status === "paid"
                                                ? "Đã thanh toán"
                                                : order.status}
                                        </span>
                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>

                </table>

            </div>

            {totalPages > 1 && (
                <div className="pagination">

                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() =>
                            setPage((prev) => prev - 1)
                        }
                    >
                        ←
                    </button>

                    <span>
                        Trang {page} / {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((prev) => prev + 1)
                        }
                    >
                        →
                    </button>

                </div>
            )}

        </div>
    );
}

export default SaleOrders;