const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Supplier extends Model {
        static associate(models) {
            models.Supplier.hasMany(models.PurchaseOrder, {
                    foreignKey: 'supplier_id',
                    as: 'purchaseOrders'
                });
        }
    }

    Supplier.init({
        supplierName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: "Supplier",
        tableName: "Suppliers", // ten bang trong mysql
        timestamps: false, // create at update at
    })
    return Supplier;
}