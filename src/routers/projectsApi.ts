import express from "express";
import boardsApi from "./boardsApi";
import listsApi from "./listsApi";
import cardsApi from "./cardsApi";
import cardHistoriesApi from "./cardHistoriesApi";
import membersApi from "./membersApi";
import invitationsApi from "./invitationsApi";
import { getProject, getProjects, createProject, editProject, deleteProject } from "../controllers/projectsController";
import { authorizeProjectAccess } from '../middlewares/authorizeProjectAccess';

const router = express.Router()
router.use("/:projectId/boards", authorizeProjectAccess, boardsApi)
router.use("/:projectId/boards/:boardId/lists", authorizeProjectAccess, listsApi)
router.use("/:projectId/boards/:boardId/lists/:listId/cards", authorizeProjectAccess, cardsApi)
router.use("/:projectId/boards/:boardId/lists/:listId/cards/:cardId/histories", authorizeProjectAccess, cardHistoriesApi)
router.use("/:projectId/members", authorizeProjectAccess, membersApi)
router.use("/:projectId", authorizeProjectAccess, invitationsApi)

router.get("/:projectId", authorizeProjectAccess, getProject)
router.get("/", getProjects) // ? query page, limit
router.post("/", createProject)
router.put("/:projectId", authorizeProjectAccess, editProject)
router.delete("/:projectId", authorizeProjectAccess, deleteProject)

export default router