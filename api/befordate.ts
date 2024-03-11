import express  from "express";
import { conn } from "../dbconn";
import jwt , { Secret, GetPublicKeyOrSecret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
export const router = express.Router();

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
        SUM(COALESCE(score, 100)) AS total_score
        FROM 
        Upload_img
        LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
        LEFT JOIN User ON Upload_img.uid_user = User.uid 
        WHERE
        DATE(vote_date) != CURDATE()
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