import express from "express";
import cors from "cors";
import feed from "./routes/feed.js";
import info from "./routes/info.js";

//express 사용
const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
const PORT = process.env.port || 4000;

app.use("/", feed);
app.use("/", info);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// http listen port 생성 서버 실행
app.listen(4000, () => console.log("hello)"));
