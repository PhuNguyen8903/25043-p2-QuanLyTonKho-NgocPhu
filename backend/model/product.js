const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            models.Product.hasMany(models.PurchaseOrderItem, {
                 foreignKey: 'product_id',
                 as:'purchase_order_items'
                });
                
            models.Product.hasMany(models.SalesOrderItem, {
                 foreignKey: 'product_id' ,
                 as: 'sale_order_items'
                });
        }
    }

    Product.init({
        productsCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        productsName: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        sequelize,
        moduleName: "Product",
        tableName: "Products", // ten bang trong mysql
        timestamps: true, // create at update at
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
    return Product;
}