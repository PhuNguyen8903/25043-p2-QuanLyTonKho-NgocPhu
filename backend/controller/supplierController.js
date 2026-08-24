const { Supplier, PurchaseOrder } = require("../model");

exports.getSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.findAll();
        res.status(200).json(suppliers);
    } catch (error) {
        next(error);
    }
};

exports.getSupplierById = async (req, res, next) => {
    try {
        const supplierId = parseInt(req.params.id);
        if (!supplierId) {
            return res.status(400).json({ message: "id nhà cung cấp không hợp lệ" });
        }

        const supplier = await Supplier.findByPk(supplierId, {
            include: [
                {
                    model: PurchaseOrder,
                    as: 'purchaseOrders',
                    attributes: ['id', 'purchaseCode', 'order_date', 'status', 'total_cost'],
                },
            ],
        });

        if (!supplier) {
            return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
        }

        res.status(200).json(supplier);
    } catch (error) {
        next(error);
    }
};

exports.createSupplier = async (req, res, next) => {
    try {
        const { supplierName, phone, address } = req.body;

        const newSupplier = await Supplier.create({
            supplierName,
            phone,
            address,
        });

        res.status(201).json(newSupplier);
    } catch (error) {
        next(error);
    }
};

exports.updateSupplier = async (req, res, next) => {
    try {
        const supplierId = parseInt(req.params.id);
        const { supplierName, phone, address } = req.body;

        if (!supplierId) {
            return res.status(400).json({ message: "id nhà cung cấp không hợp lệ" });
        }

        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
        }

        await supplier.update({
            supplierName,
            phone,
            address,
        });

        res.status(200).json(supplier);
    } catch (error) {
        next(error);
    }
};

exports.deleteSupplier = async (req, res, next) => {
    try {
        const supplierId = parseInt(req.params.id);
        if (!supplierId) {
            return res.status(400).json({ message: "id nhà cung cấp không hợp lệ" });
        }

        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
        }

        // Chặn xoá nếu đã từng có đơn mua hàng (FK RESTRICT sẽ chặn ở DB, nhưng check trước để trả lỗi rõ ràng hơn)
        const hasOrders = await PurchaseOrder.findOne({ where: { supplier_id: supplierId } });
        if (hasOrders) {
            return res.status(400).json({ message: "Không thể xoá nhà cung cấp đã có đơn mua hàng" });
        }

        await supplier.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};