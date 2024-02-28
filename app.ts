import express from "express";
import { router as votecars } from "./api/votecars";
import bodyParser from "body-parser";
const cors = require('cors');

export const app = express();



app.use(
    cors({
      origin: "*",
    })
  );

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/user" , votecars);
