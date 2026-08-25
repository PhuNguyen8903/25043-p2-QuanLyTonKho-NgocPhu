import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "../../services/supplierService";
import "./SupplierDetail.css";

function SupplierDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isCreateMode = !id;

    const [formData, setFormData] = useState({
        supplierName: "",
        phone: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchSupplier = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSupplierById(id);

                setFormData({
                    supplierName: data.supplierName || "",
                    phone: data.phone || "",
                    address: data.address || "",
                });
            } catch (error) {
                console.error("Get supplier detail error:", error);

                setError(
                    error.response?.data?.message ||
                    "Không thể tải thông tin nhà cung cấp."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSupplier();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.supplierName.trim()) {
            setError("Vui lòng nhập tên nhà cung cấp.");
            return false;
        }

        if (formData.phone.trim()) {
            const phoneRegex = /^[0-9+\-\s]{8,20}$/;

            if (!phoneRegex.test(formData.phone.trim())) {
                setError("Số điện thoại không hợp lệ.");
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

            const payload = {
                supplierName: formData.supplierName.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
            };

            if (isCreateMode) {
                const data = await createSupplier(payload);

                setSuccess("Tạo nhà cung cấp thành công.");

                if (data?.id) {
                    navigate(`/suppliers/${data.id}`, {
                        replace: true,
                    });
                }
            } else {
                await updateSupplier(id, payload);

                setSuccess(
                    "Cập nhật nhà cung cấp thành công."
                );
            }
        } catch (error) {
            console.error("Save supplier error:", error);

            setError(
                error.response?.data?.message ||
                "Không thể lưu nhà cung cấp."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa nhà cung cấp này không?"
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await deleteSupplier(id);

            navigate("/suppliers");
        } catch (error) {
            console.error("Delete supplier error:", error);

            setError(
                error.response?.data?.message ||
                "Không thể xóa nhà cung cấp."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.supplierName && !isCreateMode) {
        return (
            <div className="supplier-detail-loading">
                Đang tải thông tin nhà cung cấp...
            </div>
        );
    }

    return (
        <div className="supplier-detail-page">

            <div className="supplier-detail-header">

                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate("/suppliers")}
                    >
                        ← Quay về danh sách
                    </button>

                    <h1>
                        {isCreateMode
                            ? "Tạo nhà cung cấp"
                            : "Chi tiết nhà cung cấp"}
                    </h1>

                    {!isCreateMode && (
                        <p>
                            Mã nhà cung cấp: #{id}
                        </p>
                    )}
                </div>

            </div>

            {error && (
                <div className="supplier-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="supplier-alert success">
                    {success}
                </div>
            )}

            <section className="supplier-card">

                <div className="section-header">
                    <div>
                        <h2>Thông tin nhà cung cấp</h2>
                        <p>
                            Thông tin cơ bản của nhà cung cấp
                        </p>
                    </div>
                </div>

                <div className="supplier-form">

                    <div className="form-group">
                        <label>
                            Tên nhà cung cấp
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            name="supplierName"
                            value={formData.supplierName}
                            onChange={handleChange}
                            placeholder="Nhập tên nhà cung cấp..."
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Số điện thoại
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại..."
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>
                            Địa chỉ
                        </label>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ nhà cung cấp..."
                            rows="4"
                        />
                    </div>

                </div>

            </section>

            <div className="supplier-actions">

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/suppliers")}
                    disabled={loading}
                >
                    Hủy
                </button>

                <div className="action-right">

                    {!isCreateMode && (
                        <button
                            type="button"
                            className="delete-button"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Xóa
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

export default SupplierDetail;