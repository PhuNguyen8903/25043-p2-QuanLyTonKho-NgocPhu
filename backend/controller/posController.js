const { Op } = require("sequelize");
const { salesOrderItem, SalesOrder, User, Product, SalesOrderItem } = require("../model");


exports.CreateSaleOrder = async (req, res, next) => {
    try {
        const { assigned_employee_id,customer_name,customer_phone,amount_paid, payment_method,items } = req.body;
        const user_Id = req.session.userId;
        
        const employee = await User.findByPk(assigned_employee_id);
        if (!employee) {
            return res.status(404).json({ message: "nhân viên ko tồn tại" });
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

        const saleCode = `SO${Date.now()}`;

        const newSaleOrder = await SalesOrder.create({
            saleCode,
            customer_name,
            customer_phone,
            assigned_employee_id,
            subtotal,
            discount_amount,
            total_amount,
            amount_paid,
            change_amount,
            payment_method,
            status:"paid",
            created_by: user_Id,
            update_by : user_Id,
            items: itemsWithTotal
        },{
            include:[{
                model: SalesOrderItem,
                as: 'items'
            }]
        });
        res.status(201).json(newSaleOrder);
        
    } catch (error) {
        next(error)
    }
}


//  ham bao gom gett all, phan trang offset, search theo saler va ma don ban
exports.getSaleOrder = async (req, res, next) => {
    try {
        const pageSize = parseInt(req.query.limit) || 10;
        const currentPage = parent(req.query.page) || 1;
        const search = req.query.search || "";
        const where = {};
        if (search) {
            //tim ma đơn bán trung voi search
            const matchedEmployee = await User.findAll({
                where: { username: { [Op.like]: `%${search}%` } },
                attributes: ['id']
            });
            const userId = matchedEmployee.map(u => u.id);
            where[Op.or] = [
                { saleCode: { [Op.like]: `%${search}%` } },
                { user_Id: { [Op.in]: userId } }
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
        if (!getOrder) {
            return res.status(401).json({ message: "ko tim thay don hang" });
        }
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
                model: salesOrderItem,
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