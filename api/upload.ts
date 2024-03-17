import express from "express";
import { conn } from "../dbconn";
import jwt, { Secret, GetPublicKeyOrSecret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
export const router = express.Router();

///Get data from upload

router.get("/", (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    const name = req.query.name;
    res.send(`Show id ${id} ${name}`);
  } else {
    const sql = `SELECT Upload_img.*, SUM(COALESCE(vote.score, 100)) AS score
                 FROM Upload_img
                 LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id
                 GROUP BY Upload_img.upid`;
    conn.query(sql, (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
  }
});

router.get("/detail", (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    const name = req.query.name;
    res.send(`Show id ${id} ${name}`);
  } else {
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
        
        `;
    conn.query(sql, (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
  }
});

///
router.get("/noone", (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    const name = req.query.name;
    res.send(`Show id ${id} ${name}`);
  } else {
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
    LIMIT 1;
    
    `;
    conn.query(sql, (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
  }
});

//get data one car
router.get("/detailcar/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
        SELECT 
            upid, Upload_img.*, User.*,
            SUM(COALESCE(score, 100)) AS total_score
        FROM 
            Upload_img
            LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
            LEFT JOIN User ON Upload_img.uid_user = User.uid 
        WHERE 
            upid = ?
        GROUP BY 
            upid;
    `;

  conn.query(sql, [id], (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

router.get("/rewind/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
    Upload_img.upid, 
    Upload_img.*, 
    User.*, 
    SUM(COALESCE(vote.score, 100)) AS total_score,
    DATE(vote.vote_date) AS vote_date
FROM 
    Upload_img
    LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
    LEFT JOIN User ON Upload_img.uid_user = User.uid 
WHERE 
    Upload_img.upid = ?
    AND DATE(vote.vote_date) <= CURDATE() -- เลือกเฉพาะวันที่น้อยกว่าหรือเท่ากับวันปัจจุบัน
    AND DATE(vote.vote_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) -- และมากกว่าหรือเท่ากับ 7 วันก่อนหน้านี้
GROUP BY 
    Upload_img.upid, DATE(vote.vote_date)
ORDER BY
    DATE(vote.vote_date) DESC;
    `;

  conn.query(sql, [id], (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

router.get("/top10rank", (req, res) => {
  const sql = `
      SELECT 
        upid,
        Upload_img.*,
        User.*,
        SUM(COALESCE(score, 100)) AS total_score
      FROM 
        Upload_img
      LEFT JOIN 
        vote ON Upload_img.upid = vote.up_fk_id 
      LEFT JOIN 
        User ON Upload_img.uid_user = User.uid 
      GROUP BY 
        upid
      ORDER BY 
        total_score DESC
      LIMIT 10;
    `;

  conn.query(sql, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      // เรียงลำดับอันดับตามคะแนนทั้งหมด
      const rankedResult = result.map((item: any, index: any) => {
        return {
          ...item,
          rank: index + 1, // เพิ่มข้อมูลตำแหน่งอันดับลงในผลลัพธ์
        };
      });

      res.json(rankedResult); // ส่งผลลัพธ์ที่มีข้อมูลตำแหน่งอันดับกลับไป
    }
  });
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

// router.get("/befordate", async (req, res) => {
//     if (req.query.id) {
//         const id = req.query.id;
//         const name = req.query.name;
//         res.send(`Show id ${id} ${name}`);
//     } else {

//         const currentDate = new Date();
//         const formattedCurrentDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

//         const sql = `
//             SELECT
//                 upid, Upload_img.*, User.*,
//                 SUM(CASE WHEN DATE(vote_date) = '${formattedCurrentDate}' THEN 0 ELSE COALESCE(score, 100) END) AS total_score
//             FROM
//                 Upload_img
//                 LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id
//                 LEFT JOIN User ON Upload_img.uid_user = User.uid
//             GROUP BY
//                 upid
//             ORDER BY
//                 total_score DESC
//             LIMIT 10;
//         `;

//             conn.query(sql,(err,result)=>{
//                 if(err){
//                     res.json(err);
//                 }else{
//                     res.json(result);

//                 }
//             });
//     }
// });

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
