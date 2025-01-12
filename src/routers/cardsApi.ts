import express from "express";
import { getCard, getCards, createCard, editCard, deleteCard } from "../controllers/cardsController";

const router = express.Router({mergeParams: true})

router.get("/:cardId", getCard)
router.get("/", getCards) // ? query page, limit
router.post("/", createCard)
router.put("/:cardId", editCard)
router.delete("/:cardId", deleteCard)

export default router