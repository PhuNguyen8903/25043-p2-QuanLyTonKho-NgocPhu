const { User, Sequelize } = require("../model");

exports.getUsers  = async (req,res,next)=>{
    try {
        const users = await User.findAll({
            // where:{
            //     role : 'employee'
            // },
            attributes: ['id', 'fullName', 'username'],
        });
        res.json(users)
    } catch (error) {
        next(error)
    }
}