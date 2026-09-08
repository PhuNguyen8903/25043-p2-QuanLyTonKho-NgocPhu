import { useState } from "react";
import {
    searchProducts,
    createSaleOrder,
} from "../../services/posService";
import "./POS.css";

function POS() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const [discountPercent, setDiscountPercent] = useState(0);
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [completedOrder, setCompletedOrder] = useState(null);


    const handleSearch = async () => {
        try {
            setSearchLoading(true);
            setError("");
            setSuccess("");

            const data = await searchProducts(search);

            setProducts(data);
        } catch (error) {
            console.error("Search products error:", error);

            setProducts([]);

            setError(
                error.response?.data?.message ||
                "Không thể tìm kiếm sản phẩm."
            );
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };


    const addToCart = (product) => {
        setError("");
        setSuccess("");

        if (Number(product.stock_quantity) <= 0) {
            setError(
                `Sản phẩm "${product.productsName}" đã hết hàng.`
            );
            return;
        }

        const existingProduct = cart.find(
            (item) => item.product_id === product.id
        );

        if (existingProduct) {
            if (
                existingProduct.quantity + 1 >
                Number(product.stock_quantity)
            ) {
                setError(
                    `Sản phẩm "${product.productsName}" chỉ còn ${product.stock_quantity} sản phẩm.`
                );
                return;
            }

            setCart((prev) =>
                prev.map((item) =>
                    item.product_id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item
                )
            );

            setSuccess(
                `Đã tăng số lượng ${product.productsName}.`
            );

            return;
        }

        setCart((prev) => [
            ...prev,
            {
                product_id: product.id,
                productsCode: product.productsCode,
                productsName: product.productsName,
                unit: product.unit,
                price: Number(product.price),
                quantity: 1,
                stock_quantity: Number(product.stock_quantity),
            },
        ]);
    };


    const increaseQuantity = (productId) => {
        setError("");

        setCart((prev) =>
            prev.map((item) => {
                if (item.product_id !== productId) {
                    return item;
                }

                if (item.quantity + 1 > item.stock_quantity) {
                    setError(
                        `Sản phẩm "${item.productsName}" chỉ còn ${item.stock_quantity} sản phẩm.`
                    );

                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
            })
        );
    };

    const decreaseQuantity = (productId) => {
        setCart((prev) =>
            prev.map((item) =>
                item.product_id === productId
                    ? {
                        ...item,
                        quantity: Math.max(
                            1,
                            item.quantity - 1
                        ),
                    }
                    : item
            )
        );
    };

    const handleQuantityChange = (productId, value) => {
        const quantity = Number(value);

        setError("");

        setCart((prev) =>
            prev.map((item) => {
                if (item.product_id !== productId) {
                    return item;
                }

                if (quantity <= 0) {
                    return {
                        ...item,
                        quantity: 1,
                    };
                }

                if (quantity > item.stock_quantity) {
                    setError(
                        `Sản phẩm "${item.productsName}" chỉ còn ${item.stock_quantity} sản phẩm.`
                    );

                    return {
                        ...item,
                        quantity: item.stock_quantity,
                    };
                }

                return {
                    ...item,
                    quantity,
                };
            })
        );
    };


    const removeFromCart = (productId) => {
        setCart((prev) =>
            prev.filter(
                (item) => item.product_id !== productId
            )
        );
    };


    const subtotal = cart.reduce(
        (total, item) =>
            total +
            item.quantity * item.price,
        0
    );

    const discountAmount = subtotal * (Number(discountPercent || 0) / 100);
    const totalAmount = subtotal - discountAmount;
    const changeAmount = Number(amountPaid || 0) - totalAmount;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN").format(
            Number(value || 0)
        );
    };


    const handlePayment = async () => {
        setError("");
        setSuccess("");
        setCompletedOrder(null);

        if (paymentMethod === "transfer") {
        setError(
            "Phương thức chuyển khoản hiện chưa được hỗ trợ."
        );
        return;
        }

        if (cart.length === 0) {
            setError(
                "Giỏ hàng không được để trống."
            );
            return;
        }

        for (const item of cart) {
            if (item.quantity <= 0) {
                setError(
                    `Số lượng ${item.productsName} không hợp lệ.`
                );
                return;
            }

            if (
                item.quantity > item.stock_quantity
            ) {
                setError(
                    `Sản phẩm ${item.productsName} không đủ tồn kho.`
                );
                return;
            }
        }

        if ( amountPaid === "" || Number(amountPaid) < totalAmount ) {
            setError(
                "Số tiền khách đưa chưa đủ để thanh toán."
            );
            return;
        }

        try {
            setLoading(true);

            const payload = {
                customer_name:customerName || null,

                customer_phone: customerPhone || null,
                amount_paid: Number(amountPaid),
                payment_method: paymentMethod,

                discountPercent:Number(discountPercent || 0),

                items: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                })),
            };

            const data =await createSaleOrder(payload);

            setSuccess("Thanh toán thành công." );
            setCompletedOrder(data);

            // reset giỏ hàng
            setCart([]);
            setCustomerName("");
            setCustomerPhone("");
            setAmountPaid("");
            setDiscountPercent(0);

        } catch (error) {
            console.error(
                "Create sale order error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Thanh toán thất bại."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleReset = () => {
        setSearch("");
        setProducts([]);
        setCart([]);

        setCustomerName("");
        setCustomerPhone("");

        setDiscountPercent(0);
        setAmountPaid("");
        setPaymentMethod("cash");

        setError("");
        setSuccess("");
        setCompletedOrder(null);
    };

    return (
        <div className="pos-page">
            <div className="pos-header">
                <div>
                    <h1>POS Bán hàng</h1>

                    <p>
                        Tạo đơn bán hàng và thanh toán
                    </p>
                </div>
            </div>


            {error && (
                <div className="pos-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="pos-alert success">
                    {success}
                </div>
            )}
            {completedOrder && (
                <div className="payment-success-card">
                    <div>
                        <strong>
                            Thanh toán thành công
                        </strong>

                        <p>
                            Mã đơn bán:{" "}
                            <b>
                                {completedOrder.saleCode}
                            </b>
                        </p>
                    </div>

                    <div>
                        <span>
                            Tổng tiền
                        </span>

                        <strong>
                            {formatCurrency(
                                completedOrder.total_amount
                            )} ₫
                        </strong>
                    </div>
                </div>
            )}
            <div className="pos-layout">

                <div className="pos-left">
                    <section className="pos-card">

                        <div className="pos-section-title">
                            <div>
                                <h2>
                                    Tìm kiếm sản phẩm
                                </h2>

                                <p>
                                    Tìm theo mã hoặc tên sản phẩm
                                </p>
                            </div>
                        </div>

                        <div className="product-search">

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                onKeyDown={
                                    handleSearchKeyDown
                                }
                                placeholder="Nhập mã hoặc tên sản phẩm..."
                            />

                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={searchLoading}
                            >
                                {searchLoading
                                    ? "Đang tìm..."
                                    : "Tìm kiếm"}
                            </button>
                        </div>
                    </section>

                    <section className="pos-card">

                        <div className="pos-section-title">
                            <div>
                                <h2>
                                    Sản phẩm
                                </h2>

                                <p>
                                    Chọn sản phẩm để thêm vào đơn
                                </p>
                            </div>
                        </div>

                        <div className="product-result-table-wrapper">
                            <table className="product-result-table">
                                <thead>
                                    <tr>
                                        <th>Mã SP</th>
                                        <th>Tên sản phẩm</th>
                                        <th>ĐVT</th>
                                        <th>Đơn giá</th>
                                        <th>Tồn kho</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="table-empty"
                                            >
                                                Chưa có sản phẩm.
                                            </td>
                                        </tr>
                                    ):(
                                        products.map(
                                            (product) => (
                                                <tr  key={ product.id  }>
                                                    <td>{  product.productsCode} </td>
                                                    <td> { product.productsName }</td>
                                                    <td>{ product.unit}</td>
                                                    <td>
                                                        {formatCurrency(
                                                            product.price
                                                        )}{" "}
                                                        ₫
                                                    </td>
                                                    <td> { product.stock_quantity }   </td>
                                                    <td>
                                                        <button type="button" className="add-product-button" onClick={() => addToCart(product)}>
                                                            + Thêm
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="pos-card">
                        <div className="pos-section-title">
                            <div>
                                <h2>
                                    Giỏ hàng
                                </h2>

                                <p>
                                    Sản phẩm đang được chọn
                                </p>
                            </div>
                            <span className="cart-count">
                                {cart.length} sản phẩm
                            </span>
                        </div>

                        <div className="cart-table-wrapper">
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Mã SP</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="table-empty"
                                            >
                                                Giỏ hàng đang trống.
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        item.product_id
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.productsCode
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.productsName
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatCurrency(
                                                            item.price
                                                        )}{" "}
                                                        ₫
                                                    </td>

                                                    <td>

                                                        <div className="quantity-control">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    decreaseQuantity(
                                                                        item.product_id
                                                                    )
                                                                }
                                                            >
                                                                −
                                                            </button>

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={
                                                                    item.stock_quantity
                                                                }
                                                                value={
                                                                    item.quantity
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleQuantityChange(
                                                                        item.product_id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    increaseQuantity(
                                                                        item.product_id
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>

                                                        </div>

                                                        <small>
                                                            Tồn:{" "}
                                                            {
                                                                item.stock_quantity
                                                            }
                                                        </small>

                                                    </td>

                                                    <td className="cart-item-total">
                                                        {formatCurrency(
                                                            item.quantity *
                                                            item.price
                                                        )}{" "}
                                                        ₫
                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="remove-cart-button"
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.product_id
                                                                )
                                                            }
                                                        >
                                                            ×
                                                        </button>

                                                    </td>

                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>


                <div className="pos-right">
                    <section className="pos-card">
                        <div className="pos-section-title">
                            <div>
                                <h2>
                                    Thông tin khách hàng
                                </h2>

                                <p>
                                    Không bắt buộc
                                </p>
                            </div>
                        </div>

                        <div className="customer-form">
                            <div className="form-group">
                                <label>
                                    Tên khách hàng
                                </label>

                                <input
                                    type="text"
                                    value={
                                        customerName
                                    }
                                    onChange={(e) =>
                                        setCustomerName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập tên khách hàng..."
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Số điện thoại
                                </label>

                                <input
                                    type="text"
                                    value={
                                        customerPhone
                                    }
                                    onChange={(e) =>
                                        setCustomerPhone(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập số điện thoại..."
                                />
                            </div>
                        </div>
                    </section>

                    <section className="pos-card payment-card">
                        <div className="pos-section-title">
                            <div>
                                <h2>
                                    Thanh toán
                                </h2>

                                <p>
                                    Thông tin thanh toán đơn hàng
                                </p>
                            </div>
                        </div>

                        <div className="payment-summary">
                            <div>
                                <span>
                                    Tạm tính
                                </span>

                                <strong>
                                    {formatCurrency(
                                        subtotal
                                    )}{" "}
                                    ₫
                                </strong>
                            </div>

                            <div className="discount-row">
                                <span>
                                    Giảm giá (%)
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={
                                        discountPercent
                                    }
                                    onChange={(e) =>
                                        setDiscountPercent(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            <div>
                                <span>
                                    Tiền giảm
                                </span>

                                <strong>
                                    {formatCurrency(
                                        discountAmount
                                    )}{" "}
                                    ₫
                                </strong>
                            </div>

                            <div className="payment-total">

                                <span>
                                    Tổng thanh toán
                                </span>

                                <strong>
                                    {formatCurrency(
                                        totalAmount
                                    )}{" "}
                                    ₫
                                </strong>
                            </div>
                        </div>

                        <div className="payment-form">
                            <div className="form-group">

                                <label>
                                    Tiền khách đưa
                                    <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        amountPaid
                                    }
                                    onChange={(e) =>
                                        setAmountPaid(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập số tiền..."
                                />
                            </div>

                            <div className="change-row">
                                <span>
                                    Tiền thừa
                                </span>

                                <strong
                                    className={
                                        changeAmount < 0
                                            ? "not-enough"
                                            : ""
                                    }
                                >
                                    {formatCurrency(
                                        Math.max(
                                            0,
                                            changeAmount
                                        )
                                    )}{" "}
                                    ₫
                                </strong>

                            </div>

                            <div className="form-group">

                                <label>
                                    Phương thức thanh toán
                                </label>

                                <select
                                    value={
                                        paymentMethod
                                    }
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="cash">
                                        Tiền mặt
                                    </option>

                                    <option value="transfer">
                                        Chuyển khoản
                                    </option>
                                </select>

                            </div>

                        </div>

                        <div className="payment-actions">

                            <button
                                type="button"
                                className="reset-button"
                                onClick={
                                    handleReset
                                }
                                disabled={loading}
                            >
                                Hủy đơn
                            </button>

                            <button
                                type="button"
                                className="payment-button"
                                onClick={
                                    handlePayment
                                }
                                disabled={
                                    loading ||
                                    cart.length === 0
                                }
                            >
                                {loading
                                    ? "Đang thanh toán..."
                                    : "Thanh toán"}
                            </button>

                        </div>

                    </section>

                </div>

            </div>

        </div>
    );
}

export default POS;