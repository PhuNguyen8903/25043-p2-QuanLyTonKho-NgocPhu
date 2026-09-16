const mysql = require('mysql2');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + "/../config/config.js")[env]
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, { ...config, dialectModule: mysql });

//khởi tạo db
db.User = require("./user")(sequelize, Sequelize)
db.Product = require("./product")(sequelize, Sequelize)
db.Supplier = require("./supplier")(sequelize, Sequelize)
db.PurchaseOrder = require("./purchaseOrder")(sequelize, Sequelize)
db.PurchaseOrderItem = require("./purchaseOrderItem")(sequelize, Sequelize)
db.SalesOrder = require("./salesOrder")(sequelize, Sequelize)
db.SalesOrderItem = require("./salesOrderItem")(sequelize, Sequelize)
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;