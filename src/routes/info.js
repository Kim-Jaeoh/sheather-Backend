import express from "express";
import fs from "fs";
import admin from "firebase-admin";
import dotenv from "dotenv"; // dotenv 모듈 import
dotenv.config(); // .env 파일 로드

const router = express.Router();

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FB_PROJECT_ID.replace(/\\n/g, "\n"),
    private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FB_CLIENT_EMAIL.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.FB_DATABASE_URL,
});

//// POST
// 알림
router.post("/api/push-send", (req, res, next) => {
  const {
    data: { message, token, link },
  } = req.body;

  let payload = {
    token,
    notification: {
      title: "SHEATHER",
      body: message,
    },
    webpush: {
      fcmOptions: {
        link: link,
      },
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
