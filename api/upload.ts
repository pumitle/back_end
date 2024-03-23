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
    const sql = `SELECT User.*,Upload_img.*, SUM(COALESCE(vote.score, 100)) AS score
                 FROM Upload_img
                 LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id
                 LEFT JOIN User ON Upload_img.uid_user = User.uid 
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

// router.get("/rewind/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = `
//     SELECT 
//     Upload_img.upid, 
//     Upload_img.*, 
//     User.*, 
//     SUM(COALESCE(vote.score, 100)) AS total_score,
//     DATE(vote.vote_date) AS vote_date
// FROM 
//     Upload_img
//     LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
//     LEFT JOIN User ON Upload_img.uid_user = User.uid 
// WHERE 
//     Upload_img.upid = ?
//     AND DATE(vote.vote_date) <= CURDATE() -- เลือกเฉพาะวันที่น้อยกว่าหรือเท่ากับวันปัจจุบัน
//     AND DATE(vote.vote_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) -- และมากกว่าหรือเท่ากับ 7 วันก่อนหน้านี้
// GROUP BY 
//     Upload_img.upid, DATE(vote.vote_date)
// ORDER BY
//     DATE(vote.vote_date) DESC;
//     `;

//   conn.query(sql, [id], (err, result) => {
//     if (err) {
//       res.json(err);
//     } else {
//       res.json(result);
//     }
//   });
// });

router.get("/rewind/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
  SELECT 
  Upload_img.upid, 
  Upload_img.*, 
  User.*, 
  DATE(vote.vote_date) AS vote_date,
  CASE 
      WHEN DATE(vote.vote_date) = (SELECT MIN(DATE(v1.vote_date)) FROM vote v1 WHERE v1.up_fk_id = Upload_img.upid) 
          THEN SUM(COALESCE(vote.score, 100))
      ELSE 
          SUM(COALESCE(vote.score, 100)) + (
              SELECT SUM(COALESCE(v1.score, 100))
              FROM vote v1
              WHERE Upload_img.upid = v1.up_fk_id 
                  AND DATE(v1.vote_date) < DATE(vote.vote_date)
          )
  END AS total_score
FROM 
  Upload_img
  LEFT JOIN vote ON Upload_img.upid = vote.up_fk_id 
  LEFT JOIN User ON Upload_img.uid_user = User.uid 
WHERE 
  Upload_img.upid = ?
GROUP BY 
  Upload_img.upid, DATE(vote.vote_date), vote_date -- รวมคะแนนตามวันที่
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
        total_score DESC;
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



///////////////////////////////////////////////////////////
router.get("/databyuser/:user_id", (req, res) => {
  const user_id = req.params.user_id;

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
    WHERE
      User.uid = ?
    GROUP BY 
      upid
    ORDER BY 
      total_score DESC
    LIMIT 10;s
  `;

  conn.query(sql, [user_id], (err, result) => {
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
