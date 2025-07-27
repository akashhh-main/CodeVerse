const User = require('../models/user');
const validate= require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const redisClient = require('../config/redis');
const Submission = require('../models/submission');




const register= async(req, res) => {
    try{
        // Validate request body
        validate(req.body);
        const {firstName,emailId, password} = req.body;
        // Check if user already exists, User.create will throw an error if the user already exists
        req.body.password= await bcrypt.hash(password, 10);
        req.body.role= 'user'; // Default role is user
     const user=await User.create(req.body);
     const token=  jwt.sign({_id:user._id,emailId:emailId,role:'user'}, process.env.JWT_KEY, {expiresIn: 60*60});
     const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id,
      role:user.role
    }
      res.cookie('token', token, {maxAge:60*60*1000})
      res.status(201).json({
        message:"User registered successfully",
        user:reply
      })

    }catch(err){
       res.status(400).send("Error in registration: " + err.message);
    }
}



const login= async(req, res) => {
    try{
    const {emailId, password} = req.body;
    if (!emailId) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    const user = await User.findOne({emailId});
    if (!user) throw new Error('User not found');
    const match= await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid password');
    const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id,
      role:user.role
    }
      const token=  jwt.sign({_id:user._id,emailId:emailId,role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
      res.cookie('token', token, {maxAge:60*60*1000})
      res.status(201).json(
        {
          message:"User logged in successfully",
          user:reply
        }
      );

    }catch(err){
      res.status(401).send("Error in login: " + err.message);
    }
}


const logout = async(req, res) => {
    try{
        // Validation done by userMiddleware
        // UserMiddleware will ensure that the user is authenticated and not blocked
         // add token to redis blocklist
         const {token} = req.cookies;
         if(!token) throw new Error('Token is required');
         const payload = await jwt.decode(token);
         await redisClient.set(`token:${token}`, 'Blocked');
         await redisClient.expireAt(`token:${token}`, payload.exp); // Set expiration for 1 hour
        res.cookie("token", null,{expires: new Date(Date.now())}); // clear cookie
        res.status(200).send("User logged out successfully");
      
    
    }catch(err){
        res.status(503).send("Error in logout: " + err.message);
    }
}



const adminRegister= async(req, res) => {
    try{
        // Validate request body
        validate(req.body);
        const {firstName,emailId, password} = req.body;
        // Check if user already exists, User.create will throw an error if the user already exists
        req.body.password= await bcrypt.hash(password, 10);
        req.body.role= 'admin'; // Default role is user and i have given custom role method to jwt sign below so when user input there role admin has power to give respective role otherwise default it will register as admin
     const user=await User.create(req.body);
     const token=  jwt.sign({_id:user._id,emailId:emailId,role:user.role}, process.env.JWT_KEY, {expiresIn: 60*60});
      res.cookie('token', token, {maxAge:60*60*1000})
      res.status(201).send("User registered successfully");

    }catch(err){
       res.status(400).send("Error in registration: " + err.message);
    }
}


const deleteProfile= async(req, res) => {
  try{
    const userId= req.result._id;
    await User.findByIdAndDelete(userId);
    await Submission.deleteMany({userId});
    res.status(200).send("User deleted successfully");
    
  }catch(err){
    res.status(500).send("Error in deleting user: " + err.message);
  }
}



module.exports={register,login,logout, adminRegister,deleteProfile};