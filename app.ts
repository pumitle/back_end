import express from "express";
import { router as votecars } from "./api/votecars";
import { router as upload } from "./api/upload";
import { router as vote } from "./api/voteapi";
import { router as upimg } from "./api/uploadimg";
import { router as imgsert } from "./api/insertimg";
import { router as befordata } from "./api/befordate";
import bodyParser from "body-parser";
// const cors = require('cors');
import cors from "cors";

export const app = express();



app.use(
    cors({
      origin: "*",
    })
  );

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/user" , votecars);
app.use("/dataup" , upload);
app.use("/befor" , befordata);
app.use("/voteapi" , vote);
app.use("/voteapi" ,imgsert);
app.use("/upimg" , upimg);
app.use("/upimgs" ,express.static("upimg"));

