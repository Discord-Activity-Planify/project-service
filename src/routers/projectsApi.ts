import express from "express";
import boardsApi from "./boardsApi";
import listsApi from "./listsApi";
import cardsApi from "./cardsApi";
import cardHistoriesApi from "./cardHistoriesApi";
import membersApi from "./membersApi";
import { getProject, getProjects, createProject, editProject, deleteProject } from "../controllers/projectsController";

const router = express.Router()
router.use("/:projectId/boards", boardsApi)
router.use("/:projectId/boards/:boardId/lists", listsApi)
router.use("/:projectId/boards/:boardId/lists/:listId/cards", cardsApi)
router.use("/:projectId/boards/:boardId/lists/:listId/cards/:cardId/histories", cardHistoriesApi)
router.use("/:projectId/members", membersApi)

router.get("/:projectId", getProject)
router.get("/", getProjects) // ? query page, limit
router.post("/", createProject)
router.put("/:projectId", editProject)
router.delete("/:projectId", deleteProject)

export default router