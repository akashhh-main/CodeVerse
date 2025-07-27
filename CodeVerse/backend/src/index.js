const express = require('express');
const app = express();
// At the very TOP of src/index.js
require('dotenv').config({ path: '../.env' }); // ✅ CORRECT PATH to .env

 const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

 app.use(express.json()); 
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);


const InitializeConnection = async () => {
  try {
    await Promise.all([main()],redisClient.connect());
    console.log('Database and Redis connection established successfully');


      app.listen(process.env.PORT, ()=>{
      console.log(`Server is running on port ${process.env.PORT}`);
      })

      
  } catch (err) {
  console.error('Error establishing connections:', err);
    
  } 
};

InitializeConnection();

