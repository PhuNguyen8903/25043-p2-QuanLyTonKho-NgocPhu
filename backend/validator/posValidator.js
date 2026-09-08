const { body } = require("express-validator");

const createSaleOrderValidator = () => {
    return [
        body("customer_name")
            .optional({ checkFalsy: true })
            .isLength({ max: 100 }).withMessage("Tên khách hàng tối đa 100 ký tự")
            .trim(),

        body("customer_phone")
            .optional({ checkFalsy: true })
            .isLength({ max: 20 }).withMessage("Số điện thoại tối đa 20 ký tự")
            .trim(),

        body("amount_paid")
            .notEmpty().withMessage("Vui lòng nhập tiền khách đưa")
            .isFloat({ min: 0 }).withMessage("Tiền khách đưa phải là số không âm"),

        body("payment_method")
            .notEmpty().withMessage("Vui lòng chọn phương thức thanh toán")
            .isIn(["cash", "transfer"]).withMessage("Phương thức thanh toán không hợp lệ"),

        body("discountPercent")
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage("Phần trăm giảm giá phải từ 0 đến 100"),

        body("items")
            .isArray({ min: 1 }).withMessage("Giỏ hàng phải có ít nhất 1 sản phẩm"),

        body("items.*.product_id")
            .notEmpty().withMessage("Thiếu mã sản phẩm")
            .isInt({ min: 1 }).withMessage("Mã sản phẩm không hợp lệ"),

        body("items.*.quantity")
            .notEmpty().withMessage("Thiếu số lượng")
            .isInt({ min: 1 }).withMessage("Số lượng phải là số nguyên lớn hơn 0"),

        body("items.*.unit_price")
            .notEmpty().withMessage("Thiếu đơn giá")
            .isFloat({ min: 0 }).withMessage("Đơn giá phải là số không âm"),
    ];
};

module.exports = { createSaleOrderValidator };