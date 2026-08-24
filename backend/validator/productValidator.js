const { body } = require("express-validator");

const createProductValidator = () => {
    return [
        body("productsName")
            .notEmpty().withMessage("Tên sản phẩm không được để trống")
            .isLength({ max: 150 }).withMessage("Tên sản phẩm tối đa 150 ký tự")
            .trim(),

        body("unit")
            .notEmpty().withMessage("Đơn vị tính không được để trống")
            .isLength({ max: 20 }).withMessage("Đơn vị tính tối đa 20 ký tự")
            .trim(),

        body("price")
            .notEmpty().withMessage("Đơn giá không được để trống")
            .isFloat({ min: 0 }).withMessage("Đơn giá phải là số không âm"),
    ];
};

const updateProductValidator = () => {
    return [
        body("productsName")
            .optional()
            .isLength({ max: 150 }).withMessage("Tên sản phẩm tối đa 150 ký tự")
            .trim(),

        body("unit")
            .optional()
            .isLength({ max: 20 }).withMessage("Đơn vị tính tối đa 20 ký tự")
            .trim(),

        body("price")
            .optional()
            .isFloat({ min: 0 }).withMessage("Đơn giá phải là số không âm"),
    ];
};

module.exports = { createProductValidator, updateProductValidator };