import { Request, Response } from 'express';
import { sequelize } from '../db/database';
import { Card } from '../db/models/Board/List/Card/Card';
import { CardVersion } from '../db/models/Board/List/Card/CardVersion';
import dayjs from 'dayjs';
import { File } from '../db/models/Board/List/Card/File';
import { Assign } from '../db/models/Board/List/Card/Assign';
import { Acknowledgement } from '../db/models/Board/List/Card/Acknowledgement';

// /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards/:cardId
// get
const getCard = async (req: Request, res: Response) => {
    const { projectId, boardId, listId, cardId } = req.params;

    if (!projectId || !boardId || !listId || !cardId) {
        res.status(400).json({ error: "Bad request: Missing required parameters" });
        return;
    }

    try {
        // Fetch card details
        const card = await Card.findOne({
            where: {
                projectId: parseInt(projectId),
                boardId: parseInt(boardId),
                listId: parseInt(listId),
                cardId: parseInt(cardId),
                isActive: true,
            },
            attributes: ["cardId", "name", "description", "styleId", "startDate", "endDate", "reminderDaysInterval", "order", "versionNumber"],
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

        // Fetch acknowledgements
        const acknowledgements = await Acknowledgement.findAll({
            where: { cardId: parseInt(cardId) },
            attributes: ["userId", "isAcknowledged"],
        });

        res.status(200).json({
            cardId: card.toJSON().cardId,
            name: card.toJSON().name,
            description: card.toJSON().description,
            styleId: card.toJSON().styleId,
            startDate: card.toJSON().startDate,
            endDate: card.toJSON().endDate,
            reminderDaysInterval: card.toJSON().reminderDaysInterval,
            order: card.toJSON().order,
            assignedTo: assignedTo.map((assign) => assign.toJSON().userId),
            files: files.map((file) => ({
                name: file.toJSON().name,
                fileId: file.toJSON().fileId,
            })),
            acknowledgements: acknowledgements.map((ack) => ({
                userId: ack.toJSON().userId,
                isAcknowledged: ack.toJSON().isAcknowledged,
            })),
        });
    } catch (error) {
        console.error("Error fetching card:", error);
        res.status(500).json({ error: "Error fetching card details" });
    }
};

// /api/v1/projects/{projectId}/boards/{boardId}/lists/{listId}/cards?page={page}&limit={limit}&assignToMe={assignToMe}
// get
const getCards = async (req: Request, res: Response) => {
    const { projectId, boardId, listId } = req.params;
    const { page, limit, assignToMe = false } = req.query;
    const { userId } = req; // Assuming userId is attached to the request object via middleware

    if (!projectId || !boardId || !listId) {
        res.status(400).json({ error: "Bad request: Missing required parameters" });
        return;
    }

    if (assignToMe && !userId) {
        res.status(401).json({ error: "Unauthorized: User ID is required for 'assignToMe' filter" });
        return;
    }

    // Prepare pagination variables
    const offset = page && limit ? (parseInt(page.toString()) - 1) * parseInt(limit.toString()) : undefined;
    const parsedLimit = limit ? parseInt(limit.toString()) : undefined;

    try {
        // Fetch cards
        const cards = await Card.findAll({
            where: {
                projectId: parseInt(projectId),
                boardId: parseInt(boardId),
                listId: parseInt(listId),
                isActive: true,
            },
            attributes: ["cardId", "listId", "name", "startDate", "endDate", "styleId", "order", "versionNumber"],
            offset,
            limit: parsedLimit,
        });

        if (!cards || cards.length === 0) {
            res.status(404).json({ error: "No cards found in the list" });
            return;
        }

        // Create a map of cardId to versionNumber
        const cardVersionMap = cards.reduce((acc: Record<number, number>, card) => {
            acc[card.toJSON().cardId] = card.toJSON().versionNumber;
            return acc;
        }, {});

        const cardIds = Object.keys(cardVersionMap).map((id) => parseInt(id));

        // Fetch assignments for all cards
        const assignments = await Assign.findAll({
            where: { cardId: cardIds },
            attributes: ["cardId", "userId", "versionNumber"],
        });

        // Filter assignments to match version numbers
        const filteredAssignments = assignments.filter((assignment) => {
            return assignment.toJSON().versionNumber === cardVersionMap[assignment.toJSON().cardId];
        });

        // Group assignments by cardId
        const assignedMap = filteredAssignments.reduce((acc: Record<number, string[]>, assignment) => {
            if (!acc[assignment.toJSON().cardId]) {
                acc[assignment.toJSON().cardId] = [];
            }
            acc[assignment.toJSON().cardId].push(assignment.toJSON().userId);
            return acc;
        }, {});

        // Filter cards assigned to the current user if assignToMe is true
        const filteredCards = assignToMe === "true"
            ? cards.filter((card) => (assignedMap[card.toJSON().cardId] || []).includes(userId as string))
            : cards;

        // Build the response data
        const responseData = filteredCards.map((card) => ({
            cardId: card.toJSON().cardId,
            listId: card.toJSON().listId,
            name: card.toJSON().name,
            startDate: card.toJSON().startDate,
            endDate: card.toJSON().endDate,
            styleId: card.toJSON().styleId,
            order: card.toJSON().order,
            assignedTo: assignedMap[card.toJSON().cardId] || [],
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

// /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards
// post
const createCard = async (req: Request, res: Response) => {
    const { projectId, boardId, listId } = req.params;
    const { name, description, styleId, startDate, endDate, reminderDaysInterval, order } = req.body;
    const { assignedTo = [], files = [] } = req.body;
    
    if (!projectId || !boardId || !listId || !name || !order) {
        res.status(400).json({ error: 'Bad request'});
        return;
    }
    if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
    }
    
    if (assignedTo && !Array.isArray(assignedTo)) {
        res.status(400).json({ error: "'assignedTo' should be an array" });
        return;
    }
    if (files && !Array.isArray(files)) {
        res.status(400).json({ error: "'files' should be an array" });
        return;
    }
    
    if (styleId && isNaN(parseInt(styleId))) {
        res.status(400).json({ error: "'styleId' must be a valid number" });
        return;
    }
    
    const t = await sequelize.transaction();
    try {
        // Create the card
        const card = await Card.create(
            {
                projectId: parseInt(projectId),
                boardId: parseInt(boardId),
                listId: parseInt(listId),
                versionNumber: 1,
                name,
                description,
                styleId,
                startDate,
                endDate,
                reminderDaysInterval,
                order
            },
            { transaction: t }
        );

        // Validate the card creation
        if (!card || !card.toJSON().cardId) {
            throw new Error('Failed to create card');
        }

        await CardVersion.create(
            {
                versionNumber: 1,
                projectId: parseInt(projectId),
                boardId: parseInt(boardId),
                cardId: card.toJSON().cardId,
                name,
                description,
                styleId,
                startDate,
                endDate
            },
            { transaction: t }
        );

        for (const userId of assignedTo) {
            await Assign.create(
                {
                    cardId: card.toJSON().cardId,
                    versionNumber: 1,
                    userId,
                },
                { transaction: t }
            );
        }

        for (const file of files) {
            await File.create(
                {
                    cardId: card.toJSON().cardId,
                    versionNumber: 1,
                    name: file.name,
                    fileId: file.fileId
                },
                { transaction: t }
            );
        }
        
        // Commit transaction
        await t.commit();

        res.status(201).json({ cardId: card.toJSON().cardId });
    } catch (error) {
        // Rollback transaction in case of error
        await t.rollback();
        console.error('Error creating card:', error);
        res.status(500).json({ error: 'Error creating card' });
    }
}

// update order reminderinterval and ack

// /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards/:cardId
// put
const editCard = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    const { projectId, boardId, listId, cardId } = req.params;
    const { name, description, styleId, startDate, endDate, reminderDaysInterval, order } = req.body;
    const { assignedTo = [], files = [], acknowledgements = [] } = req.body;

    if (!projectId || !boardId || !listId || !cardId) {
        res.status(400).json({ error: "Bad request: Missing required parameters" });
        return;
    }

    if ((startDate && !dayjs(startDate).isValid()) || (endDate && !dayjs(endDate).isValid())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
    }

    if (assignedTo && !Array.isArray(assignedTo)) {
        res.status(400).json({ error: "'assignedTo' should be an array" });
        return;
    }
    if (files && !Array.isArray(files)) {
        res.status(400).json({ error: "'files' should be an array" });
        return;
    }
    if (styleId && isNaN(parseInt(styleId))) {
        res.status(400).json({ error: "'styleId' must be a valid number" });
        return;
    }

    try {
        const existingCard = await Card.findOne({
            where: { cardId: parseInt(cardId), projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId), isActive: true },
        });

        if (!existingCard) {
            res.status(404).json({ error: "Card not found" });
            return;
        }

        const versionNumber: number = existingCard.toJSON().versionNumber;
        const oldDescription = existingCard.toJSON().description;
        const oldStyleId = existingCard.toJSON().styleId;

        // Calculate file changes
        const currentFiles = await File.findAll({
            where: { cardId: parseInt(cardId), versionNumber: versionNumber },
            attributes: ["fileId"],
        });

        const currentFileIds = currentFiles.map((file) => file.toJSON().fileId);
        const newFileIds = files.map((file: { fileId: number}) => file.fileId);

        const addedNFiles = newFileIds.filter((id: number) => !currentFileIds.includes(id)).length;
        const deletedNFiles = currentFileIds.filter((id) => !newFileIds.includes(id)).length;

        if ( name || description || styleId || startDate || endDate || files.length > 0 || assignedTo.length > 0) {
            // Update card properties
            await Card.update(
                {
                    name,
                    description,
                    styleId,
                    startDate,
                    endDate,
                    versionNumber: versionNumber + 1,
                },
                {
                    where: { cardId: parseInt(cardId) },
                    transaction: t,
                }
            );

            // Add new version entry
            await CardVersion.create(
                {
                    cardId: parseInt(cardId),
                    versionNumber: versionNumber + 1,
                    projectId: parseInt(projectId),
                    boardId: parseInt(boardId),
                    listId: parseInt(listId),
                    name: name ? name : existingCard.toJSON().name,
                    description: description ? description : oldDescription,
                    styleId: styleId ? styleId : oldStyleId,
                    startDate: startDate ? startDate : existingCard.toJSON().startDate,
                    endDate: endDate ? endDate : existingCard.toJSON().endDate,
                    addedNFiles,
                    deletedNFiles,
                    styleIsChanged: styleId !== oldStyleId,
                    descriptionIsChanged: description !== oldDescription,
                },
                { transaction: t }
            );

            // Update assigned users
            if (assignedTo.length > 0) {
                // Add new assignments
                for (const userId of assignedTo) {
                    await Assign.create(
                        {
                            cardId: parseInt(cardId),
                            versionNumber: versionNumber + 1,
                            userId,
                        },
                        { transaction: t }
                    );
                }
            }

            // Update files
            if (files.length > 0) {
                // Add new files
                for (const file of files) {
                    await File.create(
                        {
                            cardId: parseInt(cardId),
                            versionNumber: versionNumber + 1,
                            name: file.name,
                            fileId: file.fileId,
                        },
                        { transaction: t }
                    );
                }
            }

            // Update acknowledgements
            if (acknowledgements.length > 0) {
                await Acknowledgement.destroy({ where: { cardId: parseInt(cardId) }, transaction: t });
                for (const userId of acknowledgements) {
                    await Acknowledgement.create(
                        {
                            cardId: parseInt(cardId),
                            userId: userId,
                        },
                        { transaction: t }
                    );
                }
            }
        }
        // Commit the transaction
        await t.commit();

        res.status(200).json({ success: true });
    } catch (error) {
        // Rollback in case of error
        await t.rollback();
        console.error("Error updating card:", error);
        res.status(500).json({ error: "Error updating card" });
    }
};

// PUT /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards/:cardId/order
const updateOrder = async (req: Request, res: Response) => {
    const { projectId, boardId, listId, cardId } = req.params;
    const { order } = req.body;

    if (!projectId || !boardId || !listId || !cardId || order === undefined) {
        res.status(400).json({ error: "Missing required parameters or order" });
        return;
    }

    try {
        const card = await Card.findOne({
            where: { cardId: parseInt(cardId), projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId), isActive: true },
        });

        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }

        await Card.update(
            { order },
            { where: { cardId: parseInt(cardId), projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId), isActive: true } }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Error updating order" });
    }
};

// PUT /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards/:cardId/reminder-interval
const updateReminderInterval = async (req: Request, res: Response) => {
    const { projectId, boardId, listId, cardId } = req.params;
    const { reminderDaysInterval } = req.body;

    if (!projectId || !boardId || !listId || !cardId || reminderDaysInterval === undefined) {
        res.status(400).json({ error: "Missing required parameters or reminderDaysInterval" });
        return;
    }

    try {
        const card = await Card.findOne({
            where: { cardId: parseInt(cardId), projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId), isActive: true },
        });

        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }

        await Card.update(
            { reminderDaysInterval },
            { where: { cardId: parseInt(cardId), projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId), isActive: true } }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating reminderDaysInterval:", error);
        res.status(500).json({ error: "Error updating reminderDaysInterval" });
    }
};

// PUT /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards/:cardId/acknowledgements
const updateAcknowledgements = async (req: Request, res: Response) => {
    const { projectId, boardId, listId, cardId } = req.params;
    const { acknowledgements = [] } = req.body;

    if (!projectId || !boardId || !listId || !cardId || !Array.isArray(acknowledgements)) {
        res.status(400).json({ error: "Missing required parameters or invalid acknowledgements format" });
        return;
    }

    const t = await sequelize.transaction();

    try {
        const card = await Card.findOne({
            where: { cardId: parseInt(cardId), projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId), isActive: true },
        });

        if (!card) {
            await t.rollback();
            res.status(404).json({ error: "Card not found" });
            return;
        }

        for (const ack of acknowledgements) {
            const { userId, isAcknowledged } = ack;
            if (userId === undefined || isAcknowledged === undefined) {
                await t.rollback();
                res.status(400).json({ error: "Invalid acknowledgement format" });
                return;
            }

            await Acknowledgement.update(
                { isAcknowledged },
                {
                    where: { cardId: parseInt(cardId), userId },
                    transaction: t,
                }
            );
        }

        await t.commit();
        res.status(200).json({ success: true });
    } catch (error) {
        await t.rollback();
        console.error("Error updating acknowledgements:", error);
        res.status(500).json({ error: "Error updating acknowledgements" });
    }
};


// /api/v1/projects/:projectId/boards/:boardId/lists/:listId/cards/:cardId
// delete
const deleteCard = async (req: Request, res: Response) => {
    const { projectId, boardId, listId, cardId } = req.params;

    if (!projectId || !boardId || !listId || !cardId) {
        res.status(400).json({ error: "Bad request: Missing required parameters" });
        return;
    }

    try {
        const card = await Card.findOne({
            where: { 
                cardId: parseInt(cardId), 
                projectId: parseInt(projectId), 
                boardId: parseInt(boardId), 
                listId: parseInt(listId),
                isActive: true,
            },
        });

        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }

        // Soft delete the card by marking it as inactive
        await Card.update(
            { isActive: false },
            {
                where: { 
                    cardId: parseInt(cardId), 
                    projectId: parseInt(projectId), 
                    boardId: parseInt(boardId), 
                    listId: parseInt(listId),
                },
            }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({ error: "Error deleting card" });
    }
};


export { getCard, getCards, createCard, editCard, deleteCard, updateOrder, updateReminderInterval, updateAcknowledgements };