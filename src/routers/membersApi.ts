import express from "express";
import { getMembers } from "../controllers/membersController";

const router = express.Router()

router.get("/", getMembers)

export default router