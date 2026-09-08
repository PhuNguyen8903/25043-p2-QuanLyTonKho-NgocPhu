const { Op } = require("sequelize");
const { SalesOrder, User, Product, SalesOrderItem } = require("../model");


exports.CreateSaleOrder = async (req, res, next) => {
    try {
        const { customer_name, customer_phone, amount_paid, payment_method, items } = req.body;
        const user_Id = req.session.userId;
        const employee = await User.findByPk(user_Id);
        if (!employee) {
            return res.status(404).json({ message: "nhân viên ko tồn tại" });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "gio hang ko duoc trong" })
        }
        // lap qua san pham trong gio hang
        for (const item of items) {
            //tim san pham trong gio
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                return res.status(404).json({ message: `ko tim thay san pham: ${item.product_id}` });
            }
            if (item.quantity <= 0) {
                return res.status(400).json({ message: `so luong san pham ${item.product_id} ko hop le` });
            }
            if (item.quantity > product.stock_quantity) {
                return res.status(400).json({ message: `san pham ${product.productsName} chi con ${product.stock_quantity}` })
            }
        }
        
        if(payment_method === "tranfer"){
            return res.status(400).json({message: "hien tai chua ho tro phuong thuc thanh toan nay"});
        }

        let subtotal = 0;
        const itemsWithTotal = items.map((item) => {
            const lineTotal = item.quantity * item.unit_price;
            subtotal += lineTotal;
            return { ...item, total_price: lineTotal };
        });

        const discountPercent = req.body.discountPercent || 0;
        const discount_amount = subtotal * (discountPercent / 100);
        const total_amount = subtotal - discount_amount;
        const change_amount = amount_paid - total_amount;
        if (change_amount < 0) {
            return res.status(400).json({ message: "chua du tien thanh toan" })
        }
        
        const saleCode = `SO${Date.now()}`;

        const newSaleOrder = await SalesOrder.create({
            saleCode,
            customer_name,
            customer_phone,
            assigned_employee_id: user_Id,
            subtotal,
            discount_amount,
            total_amount,
            amount_paid,
            change_amount,
            payment_method,
            status: "paid",
            created_by: user_Id,
            update_by: user_Id,
            items: itemsWithTotal
        }, {
            include: [{
                model: SalesOrderItem,
                as: 'items'
            }]
        });
        // tru ton kho 
        for (const item of items) {
            await Product.decrement({ stock_quantity: item.quantity },
                { where: { id: item.product_id } }
            )
        };
        res.status(201).json(newSaleOrder);

    } catch (error) {
        next(error)
    }
}


//  ham bao gom gett all, phan trang offset, search theo saler va ma don ban
exports.getSaleOrder = async (req, res, next) => {
    try {
        const pageSize = parseInt(req.query.limit) || 10;
        const currentPage = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const where = {};
        if (search) {
            //tim người bán trung voi search
            const matchedEmployee = await User.findAll({
                where: { username: { [Op.like]: `%${search}%` } },
                attributes: ['id']
            });
            const userId = matchedEmployee.map(u => u.id);
            where[Op.or] = [
                { saleCode: { [Op.like]: `%${search}%` } },
                { assigned_employee_id: { [Op.in]: userId } }
            ]
        }
        const getOrder = await SalesOrder.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'saler',
                    attributes: ["id", "username"]
                }
            ],
            limit: pageSize,
            offset: (currentPage - 1) * pageSize
        });
        res.json({ data: getOrder.rows, total: getOrder.count });;
    } catch (error) {
        next(error);
    }
}

exports.getDetailSaleOrder = async (req, res, next) => {
    try {
        const saleOrderId = parseInt(req.params.id);
        const saleOrder = await SalesOrder.findByPk(saleOrderId, {
            include: [{
                model: SalesOrderItem,
                as: "items",
                include: [{
                    model: Product,
                    as: "product",
                    attributes: ["id", "productsCode", "productsName", "unit", "price"],
                }]
            },
            {
                model: User,
                as: "saler",
                attributes: ["id", "username", "fullName"]
            }]
        });
        if (!saleOrder)
            return res.status(404).json({ message: "loi ko tim thay don ban hang" });
        res.status(200).json(saleOrder);
    } catch (error) {
        next(error);
    }
}