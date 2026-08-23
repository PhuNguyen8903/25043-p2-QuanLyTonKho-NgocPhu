import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    confirmPurchaseOrder,
    receivePurchaseOrder,
} from "../../services/purchaseOrderService";
import "./PurchaseOrderDetail.css";
import { getEmployees } from "../../services/userService";



const suppliers = [
    {
        id: 1,
        supplierName: "Công ty TNHH ABC",
    },
    {
        id: 2,
        supplierName: "Công ty XYZ",
    },
    {
        id: 3,
        supplierName: "Công ty Samsung Việt Nam",
    },
];


const products = [
    {
        id: 1,
        productCode: "SP001",
        productName: "Laptop Dell Inspiron",
    },
    {
        id: 2,
        productCode: "SP002",
        productName: "Chuột Logitech",
    },
    {
        id: 3,
        productCode: "SP003",
        productName: "Bàn phím cơ Keychron",
    },
    {
        id: 4,
        productCode: "SP004",
        productName: "Màn hình Samsung",
    },
];


function PurchaseOrderDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isCreateMode = !id;

    const [formData, setFormData] = useState({
        supplier_id: "",
        assigned_employee_id: "",
        order_date: "",
        note: "",
    });

    const [items, setItems] = useState([
        {
            product_id: "",
            product_name: "",
            quantity: 1,
            unit_price: 0,
        },
    ]);

    const [status, setStatus] = useState("draft");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [employees, setEmployees] = useState([]);

    const isReadOnly =
        status === "confirmed" ||
        status === "stocked";

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployees();
                setEmployees(data);
            } catch (error) {
                console.error("Get employees error:", error);
            }
        };

        fetchEmployees();
    }, []);


    useEffect(() => {
        if (!id) return;

        const loadOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getPurchaseOrderById(id);

                setFormData({
                    supplier_id: data.supplier_id || "",
                    assigned_employee_id:
                        data.assigned_employee_id || "",
                    order_date: data.order_date || "",
                    note: data.note || "",
                });

                setStatus(data.status || "draft");

                if (data.items && data.items.length > 0) {
                    setItems(
                        data.items.map((item) => {
                            const product = products.find(
                                (p) => p.id === item.product_id
                            );

                            return {
                                product_id: item.product_id,
                                product_name:
                                    product?.productName || "",
                                quantity: item.quantity,
                                unit_price: Number(item.unit_price),
                            };
                        })
                    );
                }
            } catch (error) {
                console.error(
                    "Load purchase order error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Không thể tải thông tin đơn hàng."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleProductChange = (index, productId) => {
        const product = products.find(
            (p) => p.id === Number(productId)
        );

        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        product_id: productId,
                        product_name:
                            product?.productName || "",
                    }
                    : item
            )
        );
    };

    const handleItemChange = (
        index,
        field,
        value
    ) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };


    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                product_id: "",
                product_name: "",
                quantity: 1,
                unit_price: 0,
            },
        ]);
    };


    const removeItem = (index) => {
        if (items.length === 1) return;

        setItems((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };



    const calculateItemTotal = (item) => {
        return (
            Number(item.quantity || 0) *
            Number(item.unit_price || 0)
        );
    };


    const totalCost = items.reduce(
        (total, item) =>
            total + calculateItemTotal(item),
        0
    );


    const buildPayload = () => {
        return {
            supplier_id: Number(formData.supplier_id),

            assigned_employee_id: Number(
                formData.assigned_employee_id
            ),

            order_date: formData.order_date,

            note: formData.note,

            items: items.map((item) => ({
                product_id: Number(item.product_id),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
            })),
        };
    };



    const validateForm = () => {
        if (!formData.supplier_id) {
            setError("Vui lòng chọn nhà cung cấp.");
            return false;
        }

        if (!formData.assigned_employee_id) {
            setError(
                "Vui lòng nhập nhân viên phụ trách."
            );
            return false;
        }

        if (!formData.order_date) {
            setError("Vui lòng chọn ngày mua hàng.");
            return false;
        }

        if (items.length === 0) {
            setError(
                "Đơn hàng phải có ít nhất một sản phẩm."
            );
            return false;
        }

        for (const item of items) {
            if (!item.product_id) {
                setError(
                    "Vui lòng chọn đầy đủ sản phẩm."
                );
                return false;
            }

            if (
                !item.quantity ||
                Number(item.quantity) <= 0
            ) {
                setError(
                    "Số lượng phải lớn hơn 0."
                );
                return false;
            }

            if (
                item.unit_price === "" ||
                Number(item.unit_price) < 0
            ) {
                setError(
                    "Đơn giá không hợp lệ."
                );
                return false;
            }
        }

        return true;
    };


    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = buildPayload();

            if (isCreateMode) {
                const data =
                    await createPurchaseOrder(payload);

                setSuccess(
                    "Tạo đơn mua hàng thành công."
                );


                if (data.id) {
                    navigate(
                        `/purchaseorders/${data.id}`,
                        { replace: true }
                    );
                }
            } else {
                await updatePurchaseOrder(id, payload);

                setSuccess(
                    "Cập nhật đơn mua hàng thành công."
                );
            }
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.message ||
                "Có lỗi xảy ra khi lưu đơn hàng."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleConfirm = async () => {
        if (!id) {
            setError(
                "Bạn cần lưu đơn hàng trước khi xác nhận."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const data =
                await confirmPurchaseOrder(id);

            setStatus(data.status);

            setSuccess(
                "Đơn hàng đã được xác nhận."
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Không thể xác nhận đơn hàng."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleReceive = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const data =
                await receivePurchaseOrder(id);

            setStatus(data.status);

            setSuccess(
                "Đã xác nhận nhập kho thành công."
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Không thể xác nhận nhập kho."
            );
        } finally {
            setLoading(false);
        }
    };



    const formatCurrency = (value) => {
        return new Intl.NumberFormat(
            "vi-VN"
        ).format(value);
    };


    if (loading && id && items.length === 0) {
        return (
            <div className="purchase-detail-loading">
                Đang tải đơn hàng...
            </div>
        );
    }


    return (
        <div className="purchase-detail-page">
            <div className="purchase-detail-header">
                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/purchaseorders")
                        }
                    >
                        ← Quay về danh sách
                    </button>

                    <h1>
                        {isCreateMode
                            ? "Tạo đơn mua hàng"
                            : "Chi tiết đơn mua hàng"}
                    </h1>

                    {!isCreateMode && (
                        <p>
                            Mã đơn hàng: #{id}
                        </p>
                    )}
                </div>


                <div
                    className={`order-status status-${status}`}
                >
                    {status === "draft" &&
                        "Bản nháp"}

                    {status === "confirmed" &&
                        "Đã xác nhận"}

                    {status === "stocked" &&
                        "Đã nhập kho"}
                </div>
            </div>

            {error && (
                <div className="purchase-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="purchase-alert success">
                    {success}
                </div>
            )}

            <section className="purchase-card">
                <div className="section-header">
                    <div>
                        <h2>Thông tin chung</h2>
                        <p>
                            Thông tin cơ bản của đơn mua hàng
                        </p>
                    </div>
                </div>


                <div className="form-grid">
                    <div className="form-group">
                        <label>
                            Nhà cung cấp
                            <span>*</span>
                        </label>

                        <select
                            name="supplier_id"
                            value={formData.supplier_id}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        >
                            <option value="">
                                -- Chọn nhà cung cấp --
                            </option>

                            {suppliers.map((supplier) => (
                                <option
                                    key={supplier.id}
                                    value={supplier.id}
                                >
                                    {supplier.supplierName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            Nhân viên phụ trách <span>*</span>
                        </label>

                        <select
                            value={formData.assigned_employee_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    assigned_employee_id: Number(e.target.value)
                                })
                            }
                        >
                            <option value="">
                                -- Chọn nhân viên phụ trách --
                            </option>

                            {employees.map((employee) => (
                                <option
                                    key={employee.id}
                                    value={employee.id}
                                >
                                    {employee.fullName || employee.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            Ngày mua hàng
                            <span>*</span>
                        </label>

                        <input
                            type="date"
                            name="order_date"
                            value={formData.order_date}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>


                    <div className="form-group full-width">
                        <label>Ghi chú</label>

                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Nhập ghi chú cho đơn hàng..."
                            rows="4"
                            disabled={isReadOnly}
                        />
                    </div>
                </div>
            </section>


            <section className="purchase-card">
                <div className="section-header">
                    <div>
                        <h2>Chi tiết sản phẩm</h2>
                        <p>
                            Danh sách sản phẩm trong đơn hàng
                        </p>
                    </div>

                    {!isReadOnly && (
                        <button
                            type="button"
                            className="add-item-button"
                            onClick={addItem}
                        >
                            + Thêm sản phẩm
                        </button>
                    )}
                </div>


                <div className="items-table-wrapper">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                                {!isReadOnly && (
                                    <th></th>
                                )}
                            </tr>
                        </thead>


                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>

                                    <td>
                                        {index + 1}
                                    </td>


                                    <td>
                                        <select
                                            value={
                                                item.product_id
                                            }
                                            onChange={(e) =>
                                                handleProductChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            disabled={isReadOnly}
                                        >
                                            <option value="">
                                                Chọn sản phẩm
                                            </option>

                                            {products.map(
                                                (product) => (
                                                    <option
                                                        key={product.id}
                                                        value={product.id}
                                                    >
                                                        {product.productCode}
                                                    </option>
                                                )
                                            )}

                                        </select>
                                    </td>


                                    <td>
                                        <input
                                            type="text"
                                            value={
                                                item.product_name
                                            }
                                            placeholder="Tự động"
                                            readOnly
                                        />
                                    </td>


                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "quantity",
                                                    e.target.value
                                                )
                                            }
                                            disabled={isReadOnly}
                                        />
                                    </td>


                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.unit_price}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "unit_price",
                                                    e.target.value
                                                )
                                            }
                                            disabled={isReadOnly}
                                        />
                                    </td>

                                    <td className="item-total">

                                        {formatCurrency(
                                            calculateItemTotal(item)
                                        )}{" "}
                                        ₫

                                    </td>

                                    {!isReadOnly && (
                                        <td>
                                            <button
                                                type="button"
                                                className="remove-item-button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                disabled={
                                                    items.length === 1
                                                }
                                            >
                                                ×
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </section>


            <section className="purchase-summary">

                <div>
                    <span>
                        Tổng số lượng
                    </span>

                    <strong>
                        {items.reduce(
                            (total, item) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        )}
                    </strong>
                </div>


                <div className="summary-total">
                    <span>
                        Tổng tiền đơn hàng
                    </span>

                    <strong>
                        {formatCurrency(totalCost)} ₫
                    </strong>
                </div>
            </section>


            <div className="purchase-actions">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/purchaseorders")
                    }
                >
                    Quay về danh sách
                </button>


                <div className="action-right">
                    {status === "draft" && (
                        <>
                            <button
                                type="button"
                                className="save-button"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                Lưu lại
                            </button>


                            {!isCreateMode && (
                                <button
                                    type="button"
                                    className="confirm-button"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    Xác nhận đơn hàng
                                </button>
                            )}

                        </>

                    )}


                    {status === "confirmed" && (

                        <button
                            type="button"
                            className="receive-button"
                            onClick={handleReceive}
                            disabled={loading}
                        >
                            Xác nhận nhập kho
                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}

export default PurchaseOrderDetail;