import express from "express";
import { getCard, getCards, createCard, editCard, deleteCard, updateAcknowledgements, updateOrder, updateReminderInterval } from "../controllers/cardsController";

const router = express.Router({mergeParams: true})

router.get("/:cardId", getCard)
router.get("/", getCards) // ? query page, limit
router.post("/", createCard)
router.put("/:cardId", editCard)
router.put("/:cardId/acknowledgements", updateAcknowledgements)
router.put("/:cardId/order", updateOrder)
router.put("/:cardId/reminder-interval", updateReminderInterval)
router.delete("/:cardId", deleteCard)

export default router