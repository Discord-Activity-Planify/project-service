import express from "express";
import { invite } from "../controllers/invitationsController";

const router = express.Router()

router.post("/", invite)

export default router