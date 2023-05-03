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
  databaseURL: "https://sheather-463c7-default-rtdb.firebaseio.com",
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
