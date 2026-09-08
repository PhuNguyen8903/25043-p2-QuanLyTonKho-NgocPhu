import { useEffect, useState } from "react";
import { searchProducts } from "../../services/productService";
import "./Inventory.css";

function Inventory() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchProducts = async (
        keyword = "",
        page = 1
    ) => {
        try {
            setLoading(true);
            setError("");

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
                "Không thể tải dữ liệu tồn kho."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts("", 1);
    }, []);

    const handleSearch = () => {
        const keyword = searchInput.trim();

        setSearch(keyword);

        fetchProducts(keyword, 1);
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
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

        fetchProducts(
            search,
            page
        );
    };

    return (
        <div className="inventory-page">
            <div className="inventory-header">
                <div>
                    <h1>
                        Tra cứu Tồn kho
                    </h1>

                    <p>
                        Kiểm tra số lượng tồn kho của sản phẩm
                    </p>
                </div>
            </div>

            <div className="inventory-filter">
                <div className="inventory-search-group">
                    <label htmlFor="inventory-search">
                        Mã sản phẩm / Tên sản phẩm
                    </label>

                    <input
                        id="inventory-search"
                        type="text"
                        value={searchInput}
                        placeholder="Nhập mã hoặc tên sản phẩm..."
                        onChange={(event) =>
                            setSearchInput(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleSearchKeyDown
                        }
                    />

                </div>

                <button
                    type="button"
                    className="inventory-search-button"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading
                        ? "Đang tìm..."
                        : "Tìm kiếm"}
                </button>
            </div>

            {error && (
                <div className="inventory-error">
                    {error}
                </div>
            )}

            <div className="inventory-table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>
                                Mã sản phẩm
                            </th>

                            <th>
                                Tên sản phẩm
                            </th>

                            <th>
                                Số lượng tồn kho
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="inventory-table-message"
                                >
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="inventory-table-message"
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
                                    >

                                        <td className="inventory-product-code">
                                            {
                                                product.productsCode
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.productsName
                                            }
                                        </td>

                                        <td className="inventory-stock">
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
                    <div className="inventory-pagination">

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

                        <div className="inventory-pagination-info">
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
            {!loading &&
                totalProducts > 0 && (
                    <div className="inventory-result-count">

                        Hiển thị{" "}
                        <strong>
                            {products.length}
                        </strong>{" "}
                        sản phẩm trong tổng số{" "}
                        <strong>
                            {totalProducts}
                        </strong>{" "}
                        sản phẩm

                        {search && (
                            <>
                                {" "}cho từ khóa{" "}
                                <strong>
                                    "{search}"
                                </strong>
                            </>
                        )}

                    </div>
                )}

        </div>
    );
}

export default Inventory;