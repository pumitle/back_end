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
      const sql = "select Upload_img.*, vote.*, COALESCE(vote.score, 0) AS score from Upload_img LEFT JOIN vote ON  Upload_img.upid = vote.up_fk_id";
      conn.query(sql,(err,result)=>{
          if(err){
              res.json(err);
          }else{
              res.json(result);
         
          }
      });
  }
  
  });


