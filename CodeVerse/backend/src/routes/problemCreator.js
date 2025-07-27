const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware');
const userMiddleware=require('../middleware/userMiddleware');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,allProblemSolvedByUser,submittedProblem}=require('../controllers/userProblem');






problemRouter.post('/create',adminMiddleware,createProblem);
problemRouter.put('/update/:id',adminMiddleware,updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);
//above three need admin access









problemRouter.get('/problemById/:id',userMiddleware,getProblemById);
problemRouter.get('/getAllProblem',userMiddleware,getAllProblem);
problemRouter.get('/problemSolvedByUser',userMiddleware,allProblemSolvedByUser);
problemRouter.get('/submittedProblem/:pid',userMiddleware,submittedProblem);






module.exports=problemRouter;