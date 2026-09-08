import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSaleOrderById } from "../../services/posService";
import "./SaleOrderDetail.css";

function SaleOrderDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSaleOrderById(id);

                setOrder(data);
            } catch (error) {
                console.error(
                    "Get sale order detail error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Không thể tải thông tin đơn bán."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(value || 0));
    };

    const formatDate = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("vi-VN");
    };

    if (loading) {
        return (
            <div className="sale-detail-loading">
                Đang tải đơn bán...
            </div>
        );
    }

    if (error) {
        return (
            <div className="sale-detail-page">
                <div className="sale-detail-error">
                    {error}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/salesorders")
                    }
                >
                    ← Quay về danh sách
                </button>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="sale-detail-page">

            <div className="sale-detail-header">

                <div>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/saleorders")
                        }
                    >
                        ← 
                    </button>

                    <h1>
                        Chi tiết đơn bán
                    </h1>

                    <p>
                        Mã đơn: {order.saleCode}
                    </p>

                </div>

                <span className="sale-detail-status">
                    {order.status === "paid"? "Đã thanh toán": order.status}
                </span>

            </div>

            <section className="sale-detail-card">

                <div className="section-header">
                    <h2>Thông tin đơn hàng</h2>
                </div>

                <div className="sale-info-grid">

                    <div>
                        <span>Khách hàng</span>
                        <strong>
                            {order.customer_name ||"Khách lẻ"}
                        </strong>
                    </div>

                    <div>
                        <span>Số điện thoại</span>
                        <strong>
                            {order.customer_phone ||"—"}
                        </strong>
                    </div>

                    <div>
                        <span>Nhân viên bán hàng</span>
                        <strong>
                            {order.saler?.fullName ||
                                order.saler?.username ||
                                "—"}
                        </strong>
                    </div>

                    <div>
                        <span>Thời gian</span>
                        <strong>
                            {formatDate(
                                order.created_at
                            )}
                        </strong>
                    </div>

                </div>

            </section>


            <section className="sale-detail-card">

                <div className="section-header">
                    <h2>Chi tiết sản phẩm</h2>
                </div>

                <div className="sale-items-wrapper">

                    <table className="sale-items-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Đơn vị</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>

                        <tbody>

                            {order.items?.map(
                                (item, index) => (
                                    <tr key={item.id}>

                                        <td>
                                            {index + 1}
                                        </td>

                                        <td>
                                            {
                                                item.product
                                                    ?.productsCode
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.product
                                                    ?.productsName
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.product
                                                    ?.unit
                                            }
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                item.unit_price
                                            )}
                                        </td>

                                        <td>
                                            {item.quantity}
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                item.total_price
                                            )}
                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </section>

            <section className="sale-payment-card">

                <div className="sale-payment-row">
                    <span>Tạm tính</span>

                    <strong>
                        {formatCurrency(
                            order.subtotal
                        )}
                    </strong>
                </div>

                <div className="sale-payment-row">
                    <span>Giảm giá</span>

                    <strong>
                        {formatCurrency(
                            order.discount_amount
                        )}
                    </strong>
                </div>

                <div className="sale-payment-row total">
                    <span>Tổng tiền</span>

                    <strong>
                        {formatCurrency(
                            order.total_amount
                        )}
                    </strong>
                </div>

                <div className="sale-payment-row">
                    <span>Tiền khách đưa</span>

                    <strong>
                        {formatCurrency(
                            order.amount_paid
                        )}
                    </strong>
                </div>

                <div className="sale-payment-row">
                    <span>Tiền thừa</span>

                    <strong>
                        {formatCurrency(
                            order.change_amount
                        )}
                    </strong>
                </div>

                <div className="sale-payment-row">
                    <span>Phương thức thanh toán</span>

                    <strong>
                        {order.payment_method === "cash"
                            ? "Tiền mặt"
                            : "Chuyển khoản"}
                    </strong>
                </div>

            </section>

            <div className="sale-detail-actions">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/salesorders")
                    }
                >
                    Quay về danh sách
                </button>

            </div>

        </div>
    );
}

export default SaleOrderDetail;