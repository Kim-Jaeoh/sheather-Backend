import express from "express";
import fs from "fs";
import admin from "firebase-admin";
import dotenv from "dotenv"; // dotenv 모듈 import
dotenv.config(); // .env 파일 로드

// json 파일 읽기
const jsonData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));
const router = express.Router();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FB_PROJECT_ID.replace(/\\n/g, "\n"),
    private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FB_CLIENT_EMAIL.replace(/\\n/g, "\n"),
  }),
  databaseURL: "https://sheather-458bd-default-rtdb.firebaseio.com",
});

//// GET
// 정보
router.get("/api/clothes", (req, res) => {
  const { cat, detail, limit, page } = req.query;
  const catFilter = jsonData.feed.filter((data) => data.wearInfo[cat] !== "");
  if (detail === "전체") {
    return res.send(catFilter.slice((page - 1) * limit, page * limit));
  } else {
    const filterWear = catFilter.filter(
      (data) => data.wearInfo[cat] === decodeURIComponent(detail)
    );
    return res.send(filterWear.slice((page - 1) * limit, page * limit));
  }
});

// 날씨
router.get("/api/weather", (req, res) => {
  const { cat, detail, limit, page } = req.query;
  const filterWear = jsonData.feed.filter(
    (data) => data.weatherInfo[cat] == decodeURIComponent(detail)
  );

  return res.send(filterWear.slice((page - 1) * limit, page * limit));
});

// 지역
router.get("/api/region", (req, res) => {
  const { cat, detail, limit, page } = req.query;
  const catFilter = jsonData.feed.filter((data) => data[cat] !== "");
  const filterWear = catFilter.filter(
    (data) => data[cat] === decodeURIComponent(detail)
  );

  return res.send(filterWear.slice((page - 1) * limit, page * limit));
});

// 태그 검색
router.get("/api/search", (req, res) => {
  const { keyword, limit, page } = req.query;
  if (keyword) {
    const hashFilter = jsonData.feed.filter((data) =>
      data.tag.includes(decodeURIComponent(keyword))
    );
    return res.send(hashFilter.slice((page - 1) * limit, page * limit));
  }
});

//// POST
// 알림
router.post("/api/push_send", async (req, res, next) => {
  const {
    data: { message, token },
  } = req.body;

  let payload = {
    token,
    notification: {
      title: "SHEATHER",
      body: message,
    },
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
  };

  admin
    .messaging()
    .send(payload)
    .then((response) => {
      console.log("성공: : ", response);
    })
    .catch((err) => {
      console.log("에러 : ", err);
    });
});

export default router;
