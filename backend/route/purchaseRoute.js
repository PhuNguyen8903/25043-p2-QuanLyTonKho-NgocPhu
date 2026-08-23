const express = require('express');
const { createOrder, searchOrders, getOrdersbyId, updateDraftOrder, confirmOrder, receiveOrder } = require('../controller/purchaseController');
const { createOrderValidator } = require('../validator/purchaseOrderValidator');
const handlerValidation = require('../middleware/validateErrorHandler');
const router = express.Router();



router.get("/", 
    searchOrders
);

router.get("/:id", 
    getOrdersbyId
);


router.post("/", 
    createOrderValidator(),
    handlerValidation,
    createOrder
    );


router.put("/:id", 
    createOrderValidator(),
    handlerValidation,
    updateDraftOrder
);

router.patch("/:id/confirm",
    confirmOrder
);


router.patch("/:id/receive", 
    receiveOrder
);

module.exports = router