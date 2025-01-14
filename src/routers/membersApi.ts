import express from "express";
import { getMembers } from "../controllers/membersController";

const router = express.Router({mergeParams: true})

router.get("/", getMembers)

export default router