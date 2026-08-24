const { body } = require("express-validator");

const createSupplierValidator = () => {
    return [
        body("supplierName")
            .notEmpty().withMessage("Tên nhà cung cấp không được để trống")
            .isLength({ max: 150 }).withMessage("Tên nhà cung cấp tối đa 150 ký tự")
            .trim(),

        body("phone")
            .optional({ checkFalsy: true })
            .isLength({ max: 20 }).withMessage("Số điện thoại tối đa 20 ký tự")
            .trim(),

        body("address")
            .optional({ checkFalsy: true })
            .isLength({ max: 255 }).withMessage("Địa chỉ tối đa 255 ký tự")
            .trim(),
    ];
};

const updateSupplierValidator = () => {
    return [
        body("supplierName")
            .optional()
            .isLength({ max: 150 }).withMessage("Tên nhà cung cấp tối đa 150 ký tự")
            .trim(),

        body("phone")
            .optional({ checkFalsy: true })
            .isLength({ max: 20 }).withMessage("Số điện thoại tối đa 20 ký tự")
            .trim(),

        body("address")
            .optional({ checkFalsy: true })
            .isLength({ max: 255 }).withMessage("Địa chỉ tối đa 255 ký tự")
            .trim(),
    ];
};

module.exports = { createSupplierValidator, updateSupplierValidator };