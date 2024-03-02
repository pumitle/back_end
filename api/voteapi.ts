import express  from "express";
import { conn } from "../dbconn";
import jwt , { Secret, GetPublicKeyOrSecret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { VoteRes } from "../model/user_req";
import mysql from "mysql";
export const router = express.Router();




///Vote score Api 
router.post("/vote",(req,res)=>{

    const voteRes : VoteRes = req.body;
    // Check if the score is provided, otherwise set it to 0
    // if (voteRes.score === undefined || voteRes.score === null) {
    //     voteRes.score = 0;
    // }

    let sql = "INSERT INTO `vote`(`user_fk_id`,`up_fk_id`,`whowon`,`score`,`vote_date`) VALUES (?,?,?,?,?)";
    
    sql = mysql.format(sql,[
        voteRes.user_fk_id,
        voteRes.up_fk_id,
        voteRes.whowon,
        voteRes.score,
        voteRes.vote_date

    ]);

    conn.query(sql,(err,result)=>{
        if(err) throw err;{
            res.status(201).json({ success: true,result, message: 'Vote recorded successfully' });
        }
    });
 });
    

router.get("/",(req,res)=>{
  
    if(req.query.id){
      const id = req.query.id;
      const name = req.query.name;
      res.send(`Show id ${id} ${name}`)
  
  }else{
      const sql = "select * from vote";
      conn.query(sql,(err,result)=>{
          if(err){
              res.json(err);
          }else{
              res.json(result);

          }
      });
  }
  
  });


  
// router.get("/",(req,res)=>{
  
//     if(req.query.id){
//       const id = req.query.id;
//       const name = req.query.name;
//       res.send(`Show id ${id} ${name}`)
  
//   }else{
//       const sql = "select * from vote,Upload_img where up_fk_id = ";
//       conn.query(sql,(err,result)=>{
//           if(err){
//               res.json(err);
//           }else{
//               res.json(result);

//           }
//       });
//   }
  
//   });
