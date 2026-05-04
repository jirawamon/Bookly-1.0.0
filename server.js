const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const productsRouter = require('./routes/products');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/products', productsRouter);

/*
=====================================
STEP 1
Frontend -> Backend
POST /login
Encrypted via HTTPS
=====================================
*/

app.get('/login', (req, res) => {
   res.json({
      message: 'Use POST /login with email and password',
      example: {
         email: 'admin@gmail.com',
         password: '123456'
      }
   });
});

app.post('/login', async (req, res) => {

   const { email, password } = req.body;

   /*
   =====================================
   STEP 2
   Backend -> Database(JSON)
   findUser(email)
   =====================================
   */

   const users = JSON.parse(
      fs.readFileSync('./users.json', 'utf8')
   );

   const user = users.find(
      u => u.email === email
   );

   /*
   =====================================
   If user not found
   =====================================
   */

   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found'
      });
   }

   /*
   =====================================
   STEP 3
   bcrypt.compare()
   Gatekeeper
   =====================================
   */

   const isMatch = await bcrypt.compare(
      password,
      user.password
   );

   if (!isMatch) {
      return res.status(401).json({
         success: false,
         message: 'Invalid password'
      });
   }

   /*
   =====================================
   STEP 4
   jwt.sign()
   Create Passport(Token)
   =====================================
   */

   const token = jwt.sign(
      {
         id: user.id,
         email: user.email
      },
      process.env.JWT_SECRET,
      {
         expiresIn: '1h'
      }
   );

   /*
   =====================================
   STEP 5
   Backend -> Frontend
   Send token
   =====================================
   */

   res.json({
      success: true,
      token
   });

});

/*
=====================================
Server Start
=====================================
*/

// Serve frontend (index.html + assets) from project root
app.use(express.static(path.join(__dirname)));

// Basic error handler
app.use((err, req, res, next) => {
   console.error(err);
   res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});

app.post('/api/login', async (req, res) => {

   const { email, password } = req.body;

   const users = JSON.parse(
      fs.readFileSync('./users.json', 'utf8')
   );

   const user = users.find(
      u => u.email === email
   );

   if (!user) {
      return res.status(401).json({
         success: false,
         message: 'Unauthorized'
      });
   }

   const isMatch = await bcrypt.compare(
      password,
      user.password
   );

   if (!isMatch) {
      return res.status(401).json({
         success: false,
         message: 'Unauthorized'
      });
   }

   const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
   );

   res.status(200).json({
      token
   });

});