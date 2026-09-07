const express = require('express');
const { getSaleOrder, getDetailSaleOrder, CreateSaleOrder } = require('../controller/posController');
const router = express.Router();


router.get("/",
    getSaleOrder
)

router.get("/:id",
    getDetailSaleOrder
)

router.post("/sale_order",
    CreateSaleOrder
)


module.exports = router