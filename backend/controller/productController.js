const { Op, where } = require("sequelize");
const { Product, PurchaseOrderItem, Supplier, PurchaseOrder } = require("../model");


exports.getProduct = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        if (!products) {
            return res.status(400).json({ message: "ko co product" })
        }
        res.status(200).json(products)
    } catch (error) {
        next(error)
    }
}

exports.getProductById = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        if (!productId) {
            return res.status(400).json({ message: "id sản phẩm không hợp lệ" });
        }

        const product = await Product.findByPk(productId, {
            include: [
                {
                    model: PurchaseOrderItem,
                    as: 'purchase_order_items',
                    include: [
                        {
                            model: PurchaseOrder,
                            as: 'purchaseOrder',
                            include: [
                                { model: Supplier, as: 'supplier', attributes: ['id', 'supplierName'] }
                            ],
                        },
                    ],
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const { productsName, unit, price } = req.body;
        const productsCode = `P${Date.now()}`;
        const newProduct = await Product.create({
            productsCode,
            productsName,
            unit,
            price
        })
        res.status(201).json(newProduct);
    } catch (error) {
        next(error)
    }
}

exports.updateProduct = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        const { productsName, unit, price } = req.body;
        if (!productId)
            return res.status(404).json({ message: "ko tim thay id san pham" })

        const product = await Product.findByPk(productId);
        if (!product)
            return res.status(401).json({ message: "ko tim thay san pham" })

        await product.update({
            productsName,
            unit,
            price
        })
        res.status(200).json({ message: "update thanh cong" })
    } catch (error) {
        next(error)
    }
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        if (!productId)
            return res.status(404).json({ message: "ko tim thay id san pham" })

        const product = await Product.findByPk(productId);
        if (!product)
            return res.status(401).json({ message: "ko tim thay san pham" })

        console.log(product);
        const isAdmin = req.session.userRole === "admin";
        if (!isAdmin) {
            return res.status(403).json({ message: 'Bạn không có quyền xoa bài viết này.' });
        }

        const hasBeenUsed = await PurchaseOrderItem.findOne({ where: { product_id: productId } });
        if (hasBeenUsed) {
            return res.status(400).json({ message: "Không thể xoá sản phẩm đã từng xuất hiện trong đơn mua hàng" });
        }

        await product.destroy()
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}


exports.searchProduct = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const where = {};
        if (search) {
            where[Op.or] = [
                { productsCode: { [Op.like]: `%${search}%` } },
                { productsName: { [Op.like]: `%${search}%` } }
            ];
        }
        const products = await Product.findAll({
            where,
            attributes: ['id', 'productsCode', 'productsName', 'stock_quantity'],
        });
        if (!products) {
            return res.status(400).json({ message: "ko co product" })
        }
        res.status(200).json(products)
    } catch (error) {
        next(error)
    }
}
