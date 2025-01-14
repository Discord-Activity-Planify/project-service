import express from "express";
import { invite } from "../controllers/invitationsController";

const router = express.Router({mergeParams: true})

router.post("/", invite)

export default router