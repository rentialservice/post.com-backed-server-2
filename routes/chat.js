import express from "express";

import {
    createChat,
    deleteOwnChats,
    updateChat
} from "../controllers/Chat/ChatController.js";

const router = express.Router();

router.post("/create", createChat);
router.delete("/delete", deleteOwnChats);
router.put("/update", updateChat);

export default router;