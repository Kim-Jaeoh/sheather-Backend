import express from "express";
import fs from "fs";
import moment from "moment";

const jsonData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8")); // json 파일 읽기
const router = express.Router();

//// GET
// 피드
router.get("/api/feed", (req, res) => {
  return res.send(jsonData.feed);
});

// 팔로잉 피드 최신 리스트
router.get("/api/feed/following/recent", (req, res) => {
  const { users, limit, page } = req.query;
  const dataFilter = jsonData.feed.filter((data) =>
    users.includes(data.displayName)
  );
  const filterRecent = dataFilter
    .filter((data) => data.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt);
  return res.send(filterRecent.slice((page - 1) * limit, page * limit));
});

// 팔로잉 피드 인기 리스트
router.get("/api/feed/following/popular", (req, res) => {
  const { users, limit, page } = req.query;
  const dataFilter = jsonData.feed.filter((data) =>
    users.includes(data.displayName)
  );
  const filterPopular = dataFilter.sort(
    (a, b) => b.like.length - a.like.length
  );
  return res.send(filterPopular.slice((page - 1) * limit, page * limit));
});

// 팔로잉 피드 시간별 리스트
router.get("/api/feed/following/date", (req, res) => {
  const { users, value, min, max, cat, limit, page } = req.query;
  const dataFilter = jsonData.feed.filter((data) =>
    users.includes(data.displayName)
  );
  const dayFilter = dataFilter.filter(
    (data) => moment(data?.createdAt).format("YYYYMMDD") === value
  );
  const date = (time) => new Date(time);

  let filter;
  if (cat === "recent") {
    filter = dayFilter
      .filter((data) => {
        const hour = date(data.createdAt).getHours();
        return hour >= Number(min) && hour <= Number(max);
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  if (cat === "popular") {
    filter = dayFilter
      .filter((data) => {
        const hour = date(data.createdAt).getHours();
        return hour >= Number(min) && hour <= Number(max);
      })
      .sort((a, b) => {
        return b.like.length - a.like.length;
      });
  }
  return res.send(filter.slice((page - 1) * limit, page * limit));
});

// 피드 최신 리스트
router.get("/api/feed/recent", (req, res) => {
  const { limit, page } = req.query;
  const filterRecent = jsonData.feed
    .filter((data) => data.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt);
  return res.send(filterRecent.slice((page - 1) * limit, page * limit));
});

// 피드 인기 리스트
router.get("/api/feed/popular", (req, res) => {
  const { limit, page } = req.query;
  const filterPopular = jsonData.feed.sort(
    (a, b) => b.like.length - a.like.length
  );
  return res.send(filterPopular.slice((page - 1) * limit, page * limit));
});

// 피드 시간별 리스트
router.get("/api/feed/date", (req, res) => {
  const { value, min, max, cat, limit, page } = req.query;
  const date = (time) => new Date(time);
  const dayFilter = jsonData.feed.filter(
    (data) => moment(data?.createdAt).format("YYYYMMDD") === value
  );

  if (!dayFilter) {
    return null;
  }

  let filter;
  if (cat === "recent") {
    filter = dayFilter
      .filter((data) => {
        const hour = date(data.createdAt).getHours();
        return hour >= Number(min) && hour <= Number(max);
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  if (cat === "popular") {
    filter = dayFilter
      .filter((data) => {
        const hour = date(data.createdAt).getHours();
        return hour >= Number(min) && hour <= Number(max);
      })
      .sort((a, b) => {
        return b.like.length - a.like.length;
      });
  }
  return res.send(filter.slice((page - 1) * limit, page * limit));
});

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
  const hashFilter = jsonData.feed.filter((data) =>
    data.tag.includes(decodeURIComponent(keyword))
  );
  return res.send(hashFilter.slice((page - 1) * limit, page * limit));
});

//// POST
// 글 업로드
router.post("/api/feed", (req, res) => {
  const reqData = req.body;
  jsonData.feed.push(reqData);
  return res.send("succeess");
});

// 댓글 업로드
router.post("/api/comment", (req, res) => {
  const { id, comment } = req.body;
  const filter = jsonData.feed.filter((data) => data.id === id);
  filter[0].comment = comment;
  return res.send("succeess");
});

// 답글 업로드
router.post("/api/reply", (req, res) => {
  const { commentId, reply } = req.body;
  const filter = jsonData.feed.filter((data) =>
    data.comment.some((com) => com.commentId === commentId)
  );
  filter[0].reply = reply;
  return res.send("succeess");
});

// 좋아요
router.post("/api/like", (req, res) => {
  const { id, like } = req.body;
  const filter = jsonData.feed.filter((data) => data.id === id);
  filter[0].like = like;
  return res.send("succeess");
});

//// PATCH
// 피드 수정
router.patch("/api/feed/:id", (req, res) => {
  const { id } = req.params;
  const { text, feel, wearInfo, editAt, tag } = req.body;
  const filter = jsonData.feed.filter((data) => data.id === id);
  if (!filter) {
    return res.status(404).send("Not Found");
  }
  Object.assign(filter[0], { text, feel, wearInfo, editAt, tag });
  return res.send("succeess");
});

//// DELETE
// 피드 삭제
router.delete("/api/feed/:id", (req, res) => {
  const { id } = req.params;
  const filter = jsonData.feed.filter((data) => data.id !== id);
  res.send((jsonData.feed = filter));
  return res.send("succeess");
});

// 댓글 삭제
router.delete("/api/comment/:id", (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const filter = jsonData.feed.filter((data) => data.id === id);
  filter[0].comment = comment;
  return res.send("succeess");
});

// 답글 삭제
router.delete("/api/reply/:commentId", (req, res) => {
  const { commentId } = req.params;
  const { reply } = req.body;
  const filter = jsonData.feed.filter((data) =>
    data.some((com) => com.commendId === id)
  );
  filter[0].reply = reply;
  return res.send("succeess");
});

export default router;
