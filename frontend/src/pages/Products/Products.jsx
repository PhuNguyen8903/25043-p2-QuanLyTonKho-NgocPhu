import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import "./Products.css";

function Products() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getProducts();

            setProducts(data);
        } catch (error) {
            console.error("Get products error:", error);

            setError(
                error.response?.data?.message ||
                "Không thể tải danh sách sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreate = () => {
        navigate("/products/create");
    };

    const handleProductClick = (id) => {
        navigate(`/products/${id}`);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(value));
    };

    return (
        <div className="products-page">

            <div className="products-header">
                <div>
                    <h1>Danh sách Sản phẩm</h1>
                    <p>Quản lý thông tin sản phẩm trong hệ thống</p>
                </div>

                <button
                    type="button"
                    className="create-product-button"
                    onClick={handleCreate}
                >
                    <span>+</span>
                    Tạo mới
                </button>
            </div>

            {error && (
                <div className="products-error">
                    {error}
                </div>
            )}

            <div className="products-table-container">
                <table className="products-table">

                    <thead>
                        <tr>
                            <th>Mã sản phẩm</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn vị tính</th>
                            <th>Đơn giá</th>
                            <th>Tồn kho</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="table-message">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="table-message">
                                    Chưa có sản phẩm.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr
                                    key={product.id}
                                    onClick={() =>
                                        handleProductClick(product.id)
                                    }
                                >
                                    <td className="product-code">
                                        {product.productsCode}
                                    </td>

                                    <td>
                                        {product.productsName}
                                    </td>

                                    <td>
                                        {product.unit}
                                    </td>

                                    <td className="product-price">
                                        {formatCurrency(product.price)}
                                    </td>

                                    <td>
                                        {product.stock_quantity}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

        </div>
    );
}

export default Products;