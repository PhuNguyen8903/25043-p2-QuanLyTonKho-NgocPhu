import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getProducts,
    searchProducts,
} from "../../services/productService";
import "./Products.css";

function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);
            setError("");

            const result = await getProducts(
                page,
                pageSize
            );

            setProducts(
                Array.isArray(result?.data)
                    ? result.data
                    : []
            );

            setTotalProducts(
                Number(result?.total) || 0
            );

            setCurrentPage(page);
        } catch (error) {
            console.error(
                "Get products error:",
                error
            );

            setProducts([]);
            setTotalProducts(0);

            setError(
                error.response?.data?.message ||
                "Không thể tải danh sách sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (page = 1) => {
        try {
            setLoading(true);
            setError("");

            const keyword = search.trim();

            // Nếu không nhập gì
            // quay lại danh sách sản phẩm
            if (!keyword) {
                await fetchProducts(1);
                return;
            }

            const result = await searchProducts(
                keyword,
                page,
                pageSize
            );

            setProducts(
                Array.isArray(result?.data)
                    ? result.data
                    : []
            );

            setTotalProducts(
                Number(result?.total) || 0
            );

            setCurrentPage(page);
        } catch (error) {
            console.error(
                "Search products error:",
                error
            );

            setProducts([]);
            setTotalProducts(0);

            setError(
                error.response?.data?.message ||
                "Không thể tìm kiếm sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProducts(1);
    }, []);


    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch(1);
        }
    };

    const totalPages = Math.ceil(
        totalProducts / pageSize
    );

    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > totalPages ||
            loading
        ) {
            return;
        }

        if (search.trim()) {
            handleSearch(page);
        } else {
            fetchProducts(page);
        }
    };

    const handleCreate = () => {
        navigate("/products/create");
    };

    const handleProductClick = (id) => {
        navigate(`/products/${id}`);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(
            "vi-VN",
            {
                style: "currency",
                currency: "VND",
            }
        ).format(Number(value || 0));
    };

    return (
        <div className="products-page">
            <div className="products-header">

                <div>
                    <h1>
                        Danh sách Sản phẩm
                    </h1>

                    <p>
                        Quản lý thông tin sản phẩm trong hệ thống
                    </p>
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

            <div className="products-search-container">

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    onKeyDown={
                        handleSearchKeyDown
                    }
                    placeholder="Tìm kiếm theo mã hoặc tên sản phẩm..."
                />

                <button
                    type="button"
                    onClick={() =>
                        handleSearch(1)
                    }
                    disabled={loading}
                >
                    {loading
                        ? "Đang tìm..."
                        : "Tìm kiếm"}
                </button>
            </div>
            <div className="products-table-container">

                <table className="products-table">

                    <thead>
                        <tr>
                            <th>
                                Mã sản phẩm
                            </th>

                            <th>
                                Tên sản phẩm
                            </th>

                            <th>
                                Đơn vị tính
                            </th>

                            <th>
                                Đơn giá
                            </th>

                            <th>
                                Tồn kho
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="table-message"
                                >
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="table-message"
                                >
                                    Không tìm thấy sản phẩm.
                                </td>
                            </tr>
                        ) : (
                            products.map(
                                (product) => (
                                    <tr
                                        key={
                                            product.id
                                        }
                                        onClick={() =>
                                            handleProductClick(
                                                product.id
                                            )
                                        }
                                    >
                                        <td className="product-code">
                                            {
                                                product.productsCode
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.productsName
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.unit
                                            }
                                        </td>

                                        <td className="product-price">
                                            {formatCurrency(
                                                product.price
                                            )}
                                        </td>

                                        <td>
                                            {
                                                product.stock_quantity
                                            }
                                        </td>
                                    </tr>
                                )
                            )
                        )}

                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="products-pagination">

                        <button
                            type="button"
                            onClick={() =>
                                handlePageChange(
                                    currentPage - 1
                                )
                            }
                            disabled={
                                currentPage === 1 ||
                                loading
                            }
                        >
                            ← Trước
                        </button>

                        <div className="pagination-info">
                            Trang{" "}
                            <strong>
                                {currentPage}
                            </strong>{" "}
                            /{" "}
                            <strong>
                                {totalPages}
                            </strong>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                handlePageChange(
                                    currentPage + 1
                                )
                            }
                            disabled={
                                currentPage ===
                                totalPages ||
                                loading
                            }
                        >
                            Sau →
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Products;