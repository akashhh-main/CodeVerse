const redisClient = require('../config/redis');

const submitCodeRateLimiter=async(req, res, next) =>{
    const userId=req.result._id;
    const rediskey=`submitCode:${userId}`;
   try{
    //check if redis key exists
   const exists= await redisClient.exists(rediskey);
   if(exists) return res.status(429).send("Too many requests, please try again later");
   
   //set coolDown period
   await redisClient.set(rediskey,'cooldown_active',{
    EX:10,
    NX:true
   });
   next();
   }catch{
    res.status(500).send("Error in submitCodeRateLimiter: " + err.message);
   }
}

module.exports=submitCodeRateLimiter;