import express from "express";
import { getBoard, getBoards, createBoard, editBoard, deleteBoard } from "../controllers/boardsController";

const router = express.Router()

router.get("/:boardId", getBoard)
router.get("/", getBoards) // ? query page, limit
router.post("/", createBoard)
router.put("/:boardId", editBoard)
router.delete("/:boardId", deleteBoard)

export default router