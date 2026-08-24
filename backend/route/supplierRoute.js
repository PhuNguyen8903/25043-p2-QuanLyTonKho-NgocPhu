const express = require('express');
const { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier} = require('../controller/supplierController');
const { createSupplierValidator, updateSupplierValidator } = require('../validator/supplierValidator');
const handlerValidation = require('../middleware/validateErrorHandler');
const requireRole = require('../middleware/requireRole');
const router = express.Router();

router.get("/", 
    getSuppliers
);

router.get("/:id", 
    getSupplierById
);

router.post("/", 
    createSupplierValidator(), 
    handlerValidation, 
    createSupplier
);

router.put("/:id", 
    updateSupplierValidator(), 
    handlerValidation, 
    updateSupplier
);

router.delete("/:id", 
    requireRole("admin"), 
    deleteSupplier
);

module.exports = router;