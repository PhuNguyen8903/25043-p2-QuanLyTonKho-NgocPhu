const { body } = require("express-validator");

const createOrderValidator = () => {
    return [
        body("supplier_id")
            .notEmpty().withMessage("Vui lòng chọn nhà cung cấp")
            .isInt({ min: 1 }).withMessage("supplier_id không hợp lệ"),

        body("assigned_employee_id")
            .notEmpty().withMessage("Vui lòng chọn nhân viên phụ trách")
            .isInt({ min: 1 }).withMessage("assigned_employee_id không hợp lệ"),

        body("order_date")
            .notEmpty().withMessage("Vui lòng chọn ngày mua hàng")
            .isDate().withMessage("Ngày mua hàng không đúng định dạng (YYYY-MM-DD)"),

        body("note")
            .optional({ checkFalsy: true })
            .isString().withMessage("Ghi chú không hợp lệ")
            .isLength({ max: 2000 }).withMessage("Ghi chú tối đa 2000 ký tự"),

        body("items")
            .isArray({ min: 1 }).withMessage("Đơn mua hàng phải có ít nhất 1 sản phẩm"),

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

}
module.exports = {createOrderValidator}