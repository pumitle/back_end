import express  from "express";
import { conn } from "../dbconn";
import jwt , { Secret, GetPublicKeyOrSecret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import {  UploadRes } from "../model/user_req";
import mysql from "mysql";
export const router = express.Router();




router.post("/imgsert",(req,res)=>{

    const uploadImg : UploadRes = req.body;

    let sql = "INSERT INTO `Upload_img`(`img_car`,`name_img`,`detail`,`uid_user`) VALUES (?,?,?,?)";

    sql = mysql.format(sql,[
        uploadImg.img_car,
        uploadImg.name_img,
        uploadImg.detail,
        uploadImg.uid_user,
     

    ]);

    conn.query(sql,(err,result)=>{
        if(err) throw err;{
            res.status(201).json({ success: true,result, message: 'Uplsuccessfully' });
        }
    });
 });
    