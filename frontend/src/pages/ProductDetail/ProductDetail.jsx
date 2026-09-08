import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../../services/productService";
import "./ProductDetail.css";

function ProductDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isCreateMode = !id;

    const [formData, setFormData] = useState({
        productsCode: "",
        productsName: "",
        unit: "",
        price: "",
        stock_quantity: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!id) return;

        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProductById(id);

                setFormData({
                    productsCode: data.productsCode || "",
                    productsName: data.productsName || "",
                    unit: data.unit || "",
                    price: data.price ?? "",
                    stock_quantity: data.stock_quantity ?? 0,
                });
            } catch (error) {
                console.error("Load product error:", error);

                setError(
                    error.response?.data?.message ||
                    "Không thể tải thông tin sản phẩm."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.productsName.trim()) {
            setError("Vui lòng nhập tên sản phẩm.");
            return false;
        }

        if (!formData.unit.trim()) {
            setError("Vui lòng nhập đơn vị tính.");
            return false;
        }

        if (
            formData.price === "" ||
            Number(formData.price) < 0
        ) {
            setError("Đơn giá không hợp lệ.");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = {
                productsName: formData.productsName.trim(),
                unit: formData.unit.trim(),
                price: Number(formData.price),
            };

            if (isCreateMode) {
                const data = await createProduct(payload);

                setSuccess("Tạo sản phẩm thành công.");

                if (data.id) {
                    navigate(`/products/${data.id}`, {
                        replace: true,
                    });
                }
            } else {
                await updateProduct(id, payload);

                setSuccess("Cập nhật sản phẩm thành công.");
            }
        } catch (error) {
            console.error("Save product error:", error);

            setError(
                error.response?.data?.message ||
                "Có lỗi xảy ra khi lưu sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isCreateMode) return;

        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn xóa sản phẩm này không?"
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await deleteProduct(id);

            navigate("/products");
        } catch (error) {
            console.error("Delete product error:", error);

            setError(
                error.response?.data?.message ||
                "Không thể xóa sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(value));
    };

    if (loading && !isCreateMode && !formData.productsCode) {
        return (
            <div className="product-detail-loading">
                Đang tải thông tin sản phẩm...
            </div>
        );
    }

    return (
        <div className="product-detail-page">

            <div className="product-detail-header">
                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate("/products")}
                    >
                        ← 
                    </button>

                    <h1>
                        {isCreateMode
                            ? "Tạo sản phẩm"
                            : "Chi tiết sản phẩm"}
                    </h1>

                    {!isCreateMode && (
                        <p>
                            Mã sản phẩm:{" "}
                            <strong>
                                {formData.productsCode}
                            </strong>
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <div className="product-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="product-alert success">
                    {success}
                </div>
            )}

            <section className="product-card">

                <div className="section-header">
                    <div>
                        <h2>Thông tin sản phẩm</h2>
                        <p>
                            Thông tin cơ bản của sản phẩm
                        </p>
                    </div>
                </div>

                <div className="product-form-grid">

                    <div className="form-group">
                        <label>
                            Mã sản phẩm
                        </label>

                        <input
                            type="text"
                            value={
                                isCreateMode
                                    ? "Tự động tạo"
                                    : formData.productsCode
                            }
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Tên sản phẩm
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            name="productsName"
                            value={formData.productsName}
                            onChange={handleChange}
                            placeholder="Nhập tên sản phẩm..."
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Đơn vị tính
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            placeholder="Ví dụ: Cái, Chiếc, Hộp..."
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Đơn giá
                            <span>*</span>
                        </label>

                        <input
                            type="number"
                            name="price"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Nhập đơn giá..."
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Tồn kho
                        </label>

                        <input
                            type="number"
                            value={formData.stock_quantity}
                            readOnly
                        />

                        <small>
                            Tồn kho được cập nhật tự động khi
                            nhập hàng.
                        </small>
                    </div>

                </div>

            </section>

            {!isCreateMode && (
                <section className="product-card">

                    <div className="section-header">
                        <div>
                            <h2>Thông tin tồn kho</h2>
                            <p>
                                Số lượng sản phẩm hiện đang có
                                trong kho
                            </p>
                        </div>
                    </div>

                    <div className="stock-info">
                        <div className="stock-number">
                            {formData.stock_quantity}
                        </div>

                        <div>
                            <span>Tồn kho hiện tại</span>
                            <strong>
                                {formData.stock_quantity > 0
                                    ? "Đang còn hàng"
                                    : "Hết hàng"}
                            </strong>
                        </div>
                    </div>

                </section>
            )}

            <div className="product-actions">

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/products")}
                    disabled={loading}
                >
                    Quay về danh sách
                </button>

                <div className="action-right">

                    {!isCreateMode && (
                        <button
                            type="button"
                            className="delete-button"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Xóa sản phẩm
                        </button>
                    )}

                    <button
                        type="button"
                        className="save-button"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading
                            ? "Đang lưu..."
                            : "Lưu lại"}
                    </button>

                </div>
            </div>

        </div>
    );
}

export default ProductDetail;