import express  from "express";
import { conn,queryAsync } from "../dbconn";
import jwt , { Secret, GetPublicKeyOrSecret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UploadResult } from "firebase/storage";
import mysql from "mysql";
import { UserResponese } from "../model/user_req";
import { ValueX } from "../model/user_req";

export const router = express.Router();




router.get("/",(req,res)=>{
    if(req.query.id){
        const id = req.query.id;
        const name = req.query.name;
        res.send(`Show id ${id} ${name}`)

    }else{
        const sql = "select * from User";
        conn.query(sql,(err,result)=>{
            if(err){
                res.json(err);
            }else{
                res.json(result);
            }
        });
    }
});


///get id
router.get("/:id",(req,res)=>{
    const id =req.params.id;
 
      const sql = `select * from User where uid = ?`;
      conn.query(sql,[id],(err,result)=>{
          if(err){
              res.json(err);
          }else{
              res.json(result);
          }
      });
  
});



/////Login//////
router.post("/login",  (req, res) => {
  const { email, password } = req.body;

  if (!email|| !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const sql = "SELECT * FROM User WHERE email = ? AND password = ?";
  conn.query(sql, [email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length > 0) {
      // User found, credentials are valid
      // res.json({ message: "Login successful" });
      const user = result[0];
      const userResponse = {
        uid: user.uid,
        username: user.username,
        email: user.email,
        password: user.password,
        mobile_number: user.mobile_number,
        url_user: user.url_user,
        img_user: user.img_user,
        type: user.type
      };
        // Generate a JWT token
        const token = jwt.sign(userResponse, 'your-secret-key', { expiresIn: '1h' });

        // Include the token in the response
      
      res.json({ message: "Login successful", user: userResponse, token });
    } else {
      // User not found or invalid credentials
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});



/////Register//////
  router.post("/signin", (req, res) => {
    const { username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const query = 'INSERT INTO User (username, password, email, type) VALUES (?,?,?,?)';
    
    conn.query(query, [username, password, email, 'user'], (error, results) => {
        if (error) {
            console.error('Error during registration:', error);
            return res.status(500).json({ error: 'Error during registration' });
        }

        // Registration successful
        res.status(201).json({ success: true, user: results, message: "Register successful" });
    });
});


//Get car by id user
router.get("/profile/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
  SELECT 
  Upload_img.*, 
  SUM(COALESCE(vote.score, 100)) AS total_score
  FROM 
  User
  LEFT JOIN Upload_img ON Upload_img.uid_user = User.uid 
  LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
  WHERE 
  User.uid = ?
  GROUP BY 
  User.uid, Upload_img.upid
  `;

  conn.query(sql, [id], (err, result) => {
      if (err) {
          res.json(err);
      } else {
          res.json(result);
      }
  });
});


///put edit user detail
router.put("/edit/:id",async(req,res)=>{

  let id = req.params.id;
  let user: UserResponese = req.body;
  

  let sql='select * from User where uid = ?';
  sql = mysql.format(sql,[id]);

  const result = await queryAsync(sql);
  const jsonStr = JSON.stringify(result);
  const jsonObj = JSON.parse(jsonStr);
  const userRes: UserResponese = jsonObj[0];

  const updateuser = {...userRes, ...user};


   sql =  "update  `User` set `username`=?, `email`=?, `password`=?, `mobile_number`=?, `url_user`=?, `img_user`=? where `uid`=?";
  sql = mysql.format(sql ,[
    updateuser.username,
    updateuser.email,
    updateuser.password,
    updateuser.mobile_number,
    updateuser.url_user,
    updateuser.img_user,
    id
    ]);
    conn.query(sql,(err,result)=>{
      if(err) throw err;
      res.status(201).json({ affected_row : result.affectedRow });
    });
});


///Delete cars detail
router.delete("/del/:id",async(req,res)=>{
  let id = req.params.id;

  conn.query("delete from vote where up_fk_id = ?", [id], (err, result) => {
    if (err) throw err;
    
    conn.query("DELETE FROM  Upload_img WHERE upid = ?", [id], (err, result) => {
      if (err) throw err;
      
      res.status(200).json({ affected_row: result.affectedRows });
    });
 });

});



////Update ค่า x
router.put("/numberx/:id",(req,res)=>{
  let id = req.params.id;
  let numX: ValueX = req.body;
  let sql = " update  `ValueX` set `X`=? where `id_X`=?";
  sql = mysql.format(sql,[
    numX.X,
    id
  ]);
  conn.query(sql,(err,result) =>{
      if(err) throw err;
      res.status(201).json({ affected_row: result.affectedRows });
  });

});


router.get("/valuex/:id",(req,res)=>{
  let id = req.params.id;
  const sql = `select * from ValueX where id_X = ?`;
  conn.query(sql, [id],(err,result) =>{
    if (err) {
      res.json(err);
  } else {
      res.json(result);
  }
  });

});



////Upadat Type User ให้เป็น Admin หรือ user
router.put("/type/:id",(req,res)=>{
  let id = req.params.id;
  let user = req.body;
  let sql = "UPDATE `User` SET `type` = CASE WHEN ? = 'Admin' THEN 'Admin' ELSE 'User' END WHERE `uid`=?";
  sql = mysql.format(sql,[
    user.type,
    id
  ]);
  conn.query(sql,(err,result) =>{
      if(err) throw err;
      res.status(201).json({ affected_row: result.affectedRows });
  });
});





