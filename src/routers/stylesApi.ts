import express from "express";
import { getStyles } from "../controllers/stylesController";

const router = express.Router()

router.get("/", getStyles)

export default router