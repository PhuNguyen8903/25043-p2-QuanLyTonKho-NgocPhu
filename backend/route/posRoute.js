const express = require('express');
const { getSaleOrder, getDetailSaleOrder, CreateSaleOrder } = require('../controller/posController');
const handlerValidation = require('../middleware/validateErrorHandler');
const { createSaleOrderValidator } = require('../validator/posValidator');
const authorize = require('../middleware/authorize');
const router = express.Router();


router.get("/",
    getSaleOrder
)

router.get("/:id",
    getDetailSaleOrder
)

router.post("/sale_order",
    createSaleOrderValidator(),
    handlerValidation,
    CreateSaleOrder
)


module.exports = router