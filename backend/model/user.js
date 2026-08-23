const { Model } = require("sequelize");


module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            models.User.hasMany(models.PurchaseOrder, {
                foreignKey: 'created_by', as: 'createdOrders'
            });

            models.User.hasMany(models.PurchaseOrder, {
                foreignKey: 'update_by', as: 'updatedOrders'
            });

            models.User.hasMany(models.PurchaseOrder, {
                foreignKey: 'assigned_employee_id', as: 'assignedOrders'
            });
            User.hasMany(models.SalesOrder, {
                foreignKey: 'created_by', as: 'createdSalesOrders'
            });
            User.hasMany(models.SalesOrder, {
                foreignKey: 'update_by', as: 'updatedSalesOrders'
            });
            User.hasMany(models.SalesOrder, {
                foreignKey: 'assigned_employee_id', as: 'saledOrders'
            });
        }
    }

    User.init({
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: true
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'employee'),
            allowNull: false,
            defaultValue: 'employee',
        },
    }, {
        sequelize,
        modelName: "User",
        tableName: "Users", // ten bang trong mysql
        timestamps: false, // create at update at
        defaultScope: {
            attributes: { exclude: ["password"] }
        },

        scopes: {
            withPassword: {
                attributes: {}
            }
        }
    })
    return User;
}