import express from "express";
import { getList, getLists, createList, editList, deleteList } from "../controllers/listsController";

const router = express.Router()

router.get("/:listId", getList)
router.get("/", getLists) // ? query page, limit
router.post("/", createList)
router.put("/:listId", editList)
router.delete("/:listId", deleteList)

export default router