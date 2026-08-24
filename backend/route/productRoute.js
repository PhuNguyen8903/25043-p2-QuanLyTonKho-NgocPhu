const express = require('express');
const {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controller/productController');
const { createProductValidator, updateProductValidator } = require('../validator/productValidator');
const handlerValidation = require('../middleware/validateErrorHandler');
const authorize = require('../middleware/authorize');
const router = express.Router();

router.get("/", 
    getProduct
);

router.get("/:id", 
    getProductById
);

router.post("/", 
    createProductValidator(), 
    handlerValidation, 
    createProduct
);


router.put("/:id", 
    updateProductValidator(), 
    handlerValidation, 
    updateProduct
);


router.delete("/:id",
    authorize("admin"),
    deleteProduct
);

module.exports = router;