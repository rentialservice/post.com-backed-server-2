import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import {Server} from "socket.io";
import user from "./routes/user.js";
import initializeChatModule from "./socket.js";

import follower from "./routes/follower.js";
import tweet from "./routes/tweet.js";
import feed from "./routes/feed.js";
import explore from "./routes/explore.js";
import bookmarks from "./routes/bookmarks.js";
import trendings from "./routes/trending.js";
import chat from "./routes/chat.js";
import admin from "./routes/admin/admins.js";

const app = express();
const server=http.createServer(app);
const io=new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.query.token;
//       const payload = await ValidateSign(token, process.env.SECRET);
//       socket.userId = payload.id;
//       next();
//     } catch (err) {}
//   });
app.use((req, res, next) => {
  req.io = io;
  next();
});

initializeChatModule(io);

app.get('/', ((req,res)=>{
  res.send("Hello world from TweetApp ....!")
}));

app.get('/healthz', ((req,res)=>{
  res.status(200).json({
    message: "Health check successfully",
  });
}));

app.use("/user", user);
app.use("/follow", follower);
app.use("/tweet", tweet);
app.use("/feed", feed);
app.use("/explore", explore);
app.use("/bookmarks", bookmarks);
app.use("/trending", trendings);
app.use("/chat", chat);
app.use("/admin", admin);
const PORT = process.env.PORT || 4002;
server.listen(PORT, () => console.log(`server started on port ${PORT}`));
