import { Router } from "express";
import multer from "multer";

import {
  editUser,
  loginUser,
  getUserByUsername,
  getLikesByUserId,
  getTweetsByUserId,
  getMediaByUserId,
  verifyOtp,
  newAccessTokenGeneration,
  getUserDetails,
  setUsername,
  addBioTags,
  setPassword,
  fetchUserFeedRandom,
  addInterest,
} from "../controllers/user/user.js";

import { verifyJwt } from "../middlewares/authorization.js";
import { sendOtp } from "../controllers/verification/emailVerification.js";

const upload = multer();
const router = Router();

router.get("/", (req, res) => {
  res.send("Hello world from user of TweetApp ....!");
});

// authentication
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/set-username", setUsername);
router.post("/set-password", setPassword);
router.post("/add-bio-tags", addBioTags);
router.post("/add-interest", addInterest);
router.get("/get-user-details", getUserDetails);
router.post("/refresh", newAccessTokenGeneration);
router.get("/random-feed", fetchUserFeedRandom);

router.put("/edit-user",
  [verifyJwt, upload.fields([{ name: "avatar" }, { name: "cover" }])],
  editUser
);
router.post("/login-user", loginUser);
router.get("/get-user", getUserByUsername);
router.get("/get-tweets", getTweetsByUserId);
router.get("/get-likes", getLikesByUserId);
router.get("/get-media", getMediaByUserId);

export default router;
