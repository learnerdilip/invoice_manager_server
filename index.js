require("dotenv").config();
const express = require("express");
const db = require("./db");
const userRouter = require("./user/router");
const roomRouter = require("./room/router");
const documentRouter = require("./product/router");

const app = express();

const port = process.env.PORT || 4000;

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(roomRouter);
app.use(documentRouter);

app.listen(port, () => console.log(`Server started on port ${port}`));
