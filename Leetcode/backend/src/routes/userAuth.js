const express = require('express');

const authRouter = express.Router();
const {register, login, logout,adminRegister,deleteProfile} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // Assuming you have an adminMiddleware



authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister); // Assuming you have an adminRegister function
authRouter.delete('/profile',userMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware, (req, res) => {
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }
    try {
        res.status(200).json({
            message:"User logged in successfully",
            user:reply
          })
    } catch (error) {
        res.status(500).send("Error in checking: " + err.message);
    }
});

module.exports = authRouter;