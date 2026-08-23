const express = require('express');
const { getUsers } = require('../controller/userController');
const router = express.Router();

router.get("/getusers",
    getUsers
)
module.exports = router