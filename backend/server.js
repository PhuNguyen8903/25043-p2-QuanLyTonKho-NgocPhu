require("dotenv").config();

const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser")
const session = require('express-session');
const mysql = require('mysql2');
const MySQLStrore = require('express-mysql-session')(session);
const app = express();
const config = require("./config/config");
const authRoute = require("./route/authRoute.js");
const userRoute = require("./route/userRoute.js");
const productRoute = require("./route/productRoute.js")
const purchaseRoute = require("./route/purchaseRoute.js");
const supplierRoute = require("./route/supplierRoute.js");
const posRoute = require("./route/posRoute.js");
const requestLoggerMiddleware = require("./middleware/reqLogger.js")
const errorHandleMiddleware = require("./middleware/errorHandler.js")
const db = require("./model/index.js")
const port = process.env.PORT;


app.use(requestLoggerMiddleware)
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);

app.use(express.json()); // convert body to json
app.use(cookieParser());

const dbConfig = config[config.env]
const pool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

const sessionStore = new MySQLStrore({
    clearExpired: true,
    checkExpirationInterval: 10 * 60 * 1000, //10p
    expiration: 1 * 60 * 60 * 1000,
    },
    pool
);

app.set('trust proxy', 1);

app.use(session({
    secret: config.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: "strict",
        secure: config.env === "production",
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000, // khop voi expiration 
    }
}))

// health check publish api
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// route o day
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/product", productRoute);
app.use("/api/supplier", supplierRoute);
app.use("/api/pos", posRoute);

app.use(errorHandleMiddleware)

db.sequelize.authenticate()
    .then(() => {
        console.log("ket noi csdl thanh cong")
    })
    .catch(err => {
        console.log("ko the ket noi csdl:", err)
    })

app.listen(port, () => {
    console.log(`server is listening at http://localhost:${port}`)
})