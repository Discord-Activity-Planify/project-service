import { Request, Response } from 'express';
import { CardVersion } from '../db/models/Board/List/Card/CardVersion';
import { Assign } from '../db/models/Board/List/Card/Assign';
import { File } from '../db/models/Board/List/Card/File';

// /api/v1/projects/:projectId/boards/:boardId/cards/:cardId/histories/:versionNumber
// get
const getHistory = async (req: Request, res: Response) => {
    const { projectId, boardId, cardId, versionNumber } = req.params;

    if (!projectId || !boardId || !cardId || ! versionNumber) {
        res.status(400).json({ error: "Bad request: Missing required parameters" });
        return;
    }

    try {
        // Fetch card details
        const card = await CardVersion.findOne({
            where: {
                projectId: parseInt(projectId),
                boardId: parseInt(boardId),
                cardId: parseInt(cardId),
                versionNumber: parseInt(versionNumber),
            },
            attributes: ["versionNumber", "name", "description", "styleId", "startDate", "endDate"],
        });

        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }

        // Fetch assigned users
        const assignedTo = await Assign.findAll({
            where: { cardId: parseInt(cardId), versionNumber: card.toJSON().versionNumber },
            attributes: ["userId"],
        });

        // Fetch attached files
        const files = await File.findAll({
            where: { cardId: parseInt(cardId), versionNumber: card.toJSON().versionNumber },
            attributes: ["name", "fileId"],
        });

        res.status(200).json({
            versionNumber: card.toJSON().versionNumber,
            name: card.toJSON().name,
            description: card.toJSON().description,
            styleId: card.toJSON().styleId,
            startDate: card.toJSON().startDate,
            endDate: card.toJSON().endDate,
            assignedTo: assignedTo.map((assign) => assign.toJSON().userId),
            files: files.map((file) => ({
                name: file.toJSON().name,
                fileId: file.toJSON().fileId,
            })),
        });
    } catch (error) {
        console.error("Error fetching card:", error);
        res.status(500).json({ error: "Error fetching card details" });
    }
};

// /projects/{projectId}/boards/{boardId}/cards/{cardId}/histories?page={page}&limit={limit}
// get
const getHistories = async (req: Request, res: Response) => {
    const { projectId, boardId, cardId } = req.params;
    const { page, limit } = req.query;

    if (!projectId || !boardId || !cardId) {
        res.status(400).json({ error: "Bad request: Missing required parameters" });
        return;
    }

    // Prepare pagination variables
    const offset = page && limit ? (parseInt(page.toString()) - 1) * parseInt(limit.toString()) : undefined;
    const parsedLimit = limit ? parseInt(limit.toString()) : undefined;

    try {
        // Fetch cards
        const cards = await CardVersion.findAll({
            where: {
                projectId: parseInt(projectId),
                boardId: parseInt(boardId),
                cardId: parseInt(cardId),
            },
            attributes: ["versionNumber", "name", "description", "addedNFiles", "deletedNFiles", "startDate", "styleIsChanged", "versionDate", "descriptionIsChanged"],
            offset,
            limit: parsedLimit,
            order: [["versionNumber", "DESC"]],
        });

        if (!cards || cards.length === 0) {
            res.status(404).json({ error: "No cards found in the list" });
            return;
        }

        const versionNumbers = cards.map((card) => parseInt(card.toJSON().versionNumber));

        // Fetch assignments for all cards
        const assignments = await Assign.findAll({
            where: { cardId: cardId, versionNumber: versionNumbers },
            attributes: ["userId", "versionNumber"],
        });

        // Group assignments by cardId
        const assignedMap = assignments.reduce((acc: Record<number, string[]>, assignment) => {
            if (!acc[assignment.toJSON().versionNumber]) {
                acc[assignment.toJSON().versionNumber] = [];
            }
            acc[assignment.toJSON().versionNumber].push(assignment.toJSON().userId);
            return acc;
        }, {});

        // Build the response data
        const responseData = cards.map((card) => ({
            versionNumber: card.toJSON().versionNumber,
            name: card.toJSON().name,
            description: card.toJSON().description,
            addedNFile: card.toJSON().addedNFiles,
            deletedNFile: card.toJSON().deletedNFiles,
            startDate: card.toJSON().startDate,
            assignedTo: assignedMap[card.toJSON().versionNumber] || [],
            styleIsChanged: card.toJSON().styleIsChanged,
            versionDate: card.toJSON().versionDate,
            descriptionIsChanged: card.toJSON().descriptionIsChanged,
        }));

        res.json({
            data: responseData,
            pagination: {
                lastPage: page || null,
                limit: limit || null,
            },
        });
    } catch (error) {
        console.error("Error fetching cards:", error);
        res.status(500).json({ error: "Error fetching cards" });
    }
};

export { getHistory, getHistories }