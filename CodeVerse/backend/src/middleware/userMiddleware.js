const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');



const userMiddleware=async(req, res, next) => {
    try{
   const{token}= req.cookies;
    if(!token) throw new Error('Token is required');
    const payload = await jwt.verify(token, process.env.JWT_KEY);
    const {_id}= payload;
    if(!_id) throw new Error('id is required');
    const result= await User.findById(_id);
    if(!result) throw new Error('User not found');
    //check if user is blocked by redis or not
    const isBlocked = await redisClient.exists(`token:${token}`);
    if(isBlocked) throw new Error('User is blocked');
    req.result = result;
    next();

   } catch(err){
        res.status(500).send("Error in user middleware: " + err.message);
    }
}

module.exports = userMiddleware;