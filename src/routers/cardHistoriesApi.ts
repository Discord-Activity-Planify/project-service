import express from "express";
import { getHistory, getHistories } from "../controllers/cardHistoriesController";

const router = express.Router()

router.get("/:versionNumber", getHistory)
router.get("/", getHistories) // ? query page, limit

export default router