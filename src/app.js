import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import feed from "./routes/feed.js";
import info from "./routes/info.js";

//express 사용
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));

app.use("/", feed);
app.use("/", info);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// http listen port 생성 서버 실행
app.listen(4000, () => console.log("hello)"));
