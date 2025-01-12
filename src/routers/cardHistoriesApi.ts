import express from "express";
import { getHistory, getHistories } from "../controllers/cardHistoriesController";

const router = express.Router({mergeParams: true})

router.get("/:versionNumber", getHistory)
router.get("/", getHistories) // ? query page, limit

export default router