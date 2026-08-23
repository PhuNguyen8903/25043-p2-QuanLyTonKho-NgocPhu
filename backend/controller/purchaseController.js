const { PurchaseOrder,Product, PurchaseOrderItem, Supplier, User, Sequelize } = require("../model");
const { Op } = Sequelize;


exports.searchOrders = async (req, res, next) => {
    try {
        const pageSize = parseInt(req.query.limit) || 10;
        const currentPage = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const where = {};
        if (search) {
            //  tìm các supplier_id có tên khớp search
            const matchedSuppliers = await Supplier.findAll({
                where: { supplierName: { [Op.like]: `%${search}%` } },
                attributes: ['id'],
            });
            const supplierIds = matchedSuppliers.map(s => s.id);

            where[Op.or] = [
                { purchaseCode: { [Op.like]: `%${search}%` } },
                { supplier_id: { [Op.in]: supplierIds } },
            ];
        }

        const orders = await PurchaseOrder.findAndCountAll({
            where,
            include: [{ model: Supplier, as: 'supplier' }],
            limit: pageSize,
            offset: (currentPage - 1) * pageSize,
        });

        res.json({ data: orders.rows, total: orders.count }); // trả cho front end 2 data 1 là orders 2 là trang đã tính
    } catch (error) {
        next(error);
    }
};


exports.createOrder = async (req, res, next) => {
    try {
        const { supplier_id, assigned_employee_id, order_date, note, items } = req.body;
        const userId = req.session.userId;
        const supplier = await Supplier.findByPk(supplier_id);
        if (!supplier) {
            return res.status(404).json({ message: "Nhà cung cấp không tồn tại" })
        }

        const employee = await User.findByPk(assigned_employee_id);
        if (!employee) {
            return res.status(404).json({ message: "nhân viên ko tồn tại" });
        }

        //tính tổng giá tiền đơn hàng 
        let amount = 0;
        let total_cost = 0;
        //cho map chạy qua từng item trong đơn hàng rồi tính
        const itemsWithTotal = items.map((item) => {
            const finalCost = item.quantity * item.unit_price;
            amount += item.quantity;
            total_cost += finalCost;
            return {
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: finalCost,
            }
        })

        const purchaseCode = `PO${Date.now()}`;


        const newOrder = await PurchaseOrder.create({
            purchaseCode,
            supplier_id,
            assigned_employee_id,
            order_date,
            amount,
            total_cost: total_cost,
            status: "draft",
            note,
            created_by: userId,
            update_by: userId,
            items: itemsWithTotal,
        }, {
            include: [{ model: PurchaseOrderItem, as: "items" }],
        });
        res.status(201).json(newOrder);

    } catch (error) {
        next(error)
    }
}


exports.updateDraftOrder = async (req, res, next) => {
    try {
        const purOrderId = parseInt(req.params.id);
        const userId = req.session.userId;
        const { supplier_id, assigned_employee_id, order_date, note, items } = req.body;

        const purOrder = await PurchaseOrder.findByPk(purOrderId);
        if (!purOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        if (purOrder.status !== 'draft') {
            return res.status(400).json({ message: "Chỉ được sửa đơn khi còn ở trạng thái Bản nháp" });
        }


        if (supplier_id) {
            const supplier = await Supplier.findByPk(supplier_id);
            if (!supplier) {
                return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
            }
        }

        if (assigned_employee_id) {
            const employee = await User.findByPk(assigned_employee_id);
            if (!employee) {
                return res.status(404).json({ message: "Nhân viên phụ trách không tồn tại" });
            }
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Đơn mua hàng phải có ít nhất 1 sản phẩm" });
        }

        let amount = 0;
        let total_cost = 0;
        const itemsWithTotal = items.map((item) => {
            const lineTotal = item.quantity * item.unit_price;
            amount += item.quantity;
            total_cost += lineTotal;
            return {
                purchase_order_id: purOrderId,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: lineTotal,
            };
        });

        // Xoá items cũ tạo lại items mới
        await PurchaseOrderItem.destroy({ where: { purchase_order_id: purOrderId } });

        // tạo item với nhiều dùng 1 lúc 
        await PurchaseOrderItem.bulkCreate(itemsWithTotal);
        //nếu dùng create 
        // for(const item of itemsWithTotal){
        //     await purchaseOrder.create(item)
        // }

        await purOrder.update({
            supplier_id,
            assigned_employee_id,
            order_date,
            note,
            amount,
            total_cost,
            update_by: userId,
            // status không đổi
        });

        const updatedOrder = await PurchaseOrder.findByPk(purOrderId, {
            include: [{ model: PurchaseOrderItem, as: 'items' }],
        });

        res.status(200).json(updatedOrder);
    } catch (error) {
        next(error);
    }
};


exports.confirmOrder = async (req, res, next) => {
    try {
        const purOrderId = parseInt(req.params.id);
        const userId = req.session.userId;
        const purOrder = await PurchaseOrder.findByPk(purOrderId)
        if (!purOrder) {
            return res.status(404).json({ message: "ko tìm thấy order" })
        }
        if (purOrder.status !== 'draft') {
            return res.status(400).json({ message: "Chỉ xác nhận được đơn ở trạng thái Bản nháp" });
        }

        await purOrder.update({
            status: 'confirmed',
            update_by: userId
        })
        res.status(200).json(purOrder)
    } catch (error) {
        next(error);
    }
}

exports.receiveOrder = async (req, res, next) => {
    try {
        const purOrderId = parseInt(req.params.id);
        const userId = req.session.userId;
        const order = await PurchaseOrder.findByPk(purOrderId, {
            include: [{ model: PurchaseOrderItem, as: 'items' }],
        });
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: "Chỉ nhập kho được đơn đã Xác nhận" });
        }

        for (const item of order.items) {
            await Product.increment(
                { stock_quantity: item.quantity },
                { where: { id: item.product_id } }
            );
        }
        await order.update({
            status: 'stocked',
            update_by: userId,
        });

        res.status(200).json(order);
    } catch (error) {
        next(error)
    }
}


exports.getOrdersbyId = async (req, res, next) => {
    try {
        const purchase_order_id = parseInt(req.params.id);
        if (!purchase_order_id)
            return res.status(401).json({ message: "ko tim thay purchaseid" })

        const purOrder = await PurchaseOrder.findByPk(purchase_order_id, {
            include: [
                { model: PurchaseOrderItem, as: 'items' },
                { model: Supplier, as: 'supplier' },
                { model: User, as: 'assignedEmployee' },
            ]
        })
        res.status(200).json(purOrder);
    } catch (error) {
        next(error)
    }
}