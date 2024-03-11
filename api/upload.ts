import express  from "express";
import { conn } from "../dbconn";
import jwt , { Secret, GetPublicKeyOrSecret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
export const router = express.Router();


///Get data from upload

router.get("/",(req,res)=>{
  
    if(req.query.id){
      const id = req.query.id;
      const name = req.query.name;
      res.send(`Show id ${id} ${name}`)
  
  }else{
      const sql = "select Upload_img.*, vote.*, COALESCE(vote.score, 100) AS score from Upload_img LEFT JOIN vote ON  Upload_img.upid = vote.up_fk_id";
      conn.query(sql,(err,result)=>{
          if(err){
              res.json(err);
          }else{
              res.json(result);
         
          }
      });
  }
  
  });


  router.get("/detail",(req,res)=>{
  
    if(req.query.id){
      const id = req.query.id;
      const name = req.query.name;
      res.send(`Show id ${id} ${name}`)
  
  }else{
      const sql = `SELECT 
    upid,Upload_img.*,User.*,
    SUM(COALESCE(score, 100)) AS total_score
    FROM 
    Upload_img
     LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
    LEFT JOIN User ON Upload_img.uid_user = User.uid 
    GROUP BY 
    upid
    ORDER BY 
    total_score DESC
    LIMIT 10;
    
    ` ;
      conn.query(sql,(err,result)=>{
          if(err){
              res.json(err);
          }else{
              res.json(result);
         
          }
      });
  }
  
  });

//   SELECT 
//   Upload_img.upid,
//   Upload_img.img_car,
//   Upload_img.name_img,
//   Upload_img.detail,
//   User.username,
//   SUM(COALESCE(vote.score, 100)) AS total_score
// FROM 
//   Upload_img
//   LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
//   LEFT JOIN User ON Upload_img.uid_user = User.uid 
// GROUP BY 
//   Upload_img.upid, 
//   Upload_img.img_car,
//   Upload_img.name_img,
//   Upload_img.detail,
//   User.username
// ORDER BY 
//   total_score DESC
// LIMIT 10;


router.get("/befordate", async (req, res) => {
    if (req.query.id) {
        const id = req.query.id;
        const name = req.query.name;
        res.send(`Show id ${id} ${name}`);
    } else {
    
        const currentDate = new Date();
        const formattedCurrentDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

        const sql = `
            SELECT 
                upid, Upload_img.*, User.*,
                SUM(CASE WHEN DATE(vote_date) = '${formattedCurrentDate}' THEN 0 ELSE COALESCE(score, 100) END) AS total_score
            FROM 
                Upload_img
                LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
                LEFT JOIN User ON Upload_img.uid_user = User.uid 
            GROUP BY 
                upid
            ORDER BY 
                total_score DESC
            LIMIT 10;
        `;

            conn.query(sql,(err,result)=>{
                if(err){
                    res.json(err);
                }else{
                    res.json(result);
               
                }
            });
    }
});

// SELECT 
// upid, Upload_img.*, User.*,
// SUM(COALESCE(score, 100)) AS total_score
// FROM 
// Upload_img
// LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
// LEFT JOIN User ON Upload_img.uid_user = User.uid 
// WHERE
// DATE(vote_date) != CURDATE()
// GROUP BY 
// upid
// ORDER BY 
// total_score DESC
// LIMIT 10;
// `