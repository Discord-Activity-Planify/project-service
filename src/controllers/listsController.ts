import { Request, Response } from 'express';
import { List } from '../db/models/Board/List/List';

// /api/v1/projects/:projectId/boards/:boardId/lists/:listId
// get
const getList = async (req: Request, res: Response) => {
    const { projectId, boardId, listId } = req.params;
    if (projectId && boardId && listId) {
        try {
            const data = await List.findOne({ 
                where: { listId: parseInt(listId), projectId: parseInt(projectId), boardId: parseInt(boardId), isActive: true } 
            });
            if (data) {
                res.json({
                    listId: data.toJSON().boardId,
                    name: data.toJSON().name,
                    order: data.toJSON().order
                });
            } else {
                res.status(404).json({ error: 'List not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error fetching list' });
        }
    }
}

// /api/v1/projects/:projectId/boards/:boardId/lists
// get
const getLists = async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const {userId} = req;
    const { projectId, boardId } = req.params;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID is required' });
        return;
    }
    if (!projectId || !boardId) {
        res.status(400).json({ error: 'Project ID and Board ID is required' });
        return;
    }

    let whereClaus: {
        where: {
            isActive: boolean;
            projectId: number;
            boardId: number;
        };
        offset: number;
        order: [[string, string]];
        limit?: number;
    } = {
        where: { isActive: true, projectId: parseInt(projectId), boardId: parseInt(boardId) },
        offset: 0,
        order: [['order', 'ASC']]
    }
    if (page && limit) {
        whereClaus.offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
        whereClaus.limit = parseInt(limit.toString());
    }
    try {
        const data = await List.findAndCountAll(whereClaus);
        res.json({
            data: [
                ...data.rows.map((list) => ({
                    listId: list.toJSON().listId,
                    name: list.toJSON().name,
                    order: list.toJSON().order
                }))
            ],
            paginaiton: {
                lastPage: page,
                limit: limit,
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error fetching lists' });
    }
}

// /api/v1/projects/:projectId/boards/:boardId/lists
// post
const createList = async (req: Request, res: Response) => {
    const { name, order } = req.body;
    const { projectId, boardId } = req.params;
    const { userId } = req
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    if (!order) {
        res.status(400).json({ error: 'Order is required' });
        return;
    }
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID is required' });
        return;
    }

    try {
        const list = await List.create(
            { projectId, name, order, boardId }
        );

        if (!list || !list.toJSON().listId) {
            throw new Error('Failed to create list');
        }
        
        res.status(201).json({listId: list.toJSON().listId});
    } catch (error) {
        console.log(error);
        res.status(500).json({ erorr: 'Error creating list' });
    }
}

// /api/v1/projects/:projectId/boards/:boardId/lists/:listId
// put
const editList = async (req: Request, res: Response) => {
    const { projectId, boardId, listId } = req.params;
    const { name, order } = req.body;
    const fieldsToUpdate: { name?: string; order?: number } = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (order !== undefined) fieldsToUpdate.order = order;

    if (projectId && boardId && listId) {
        try {
            const data = await List.update(fieldsToUpdate, {
                where: { projectId: parseInt(projectId), listId: parseInt(listId), boardId: parseInt(boardId) }
            });
            if (data) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'List not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error editing list' });
        }
    } else {
        res.status(400).json({ error: 'Project ID and BoardId and ListId is required' });
    }
}

// /api/v1/projects/:projectId/boards/:boardId/lists/:listId
// delete
const deleteList = async (req: Request, res: Response) => {
    const { projectId, boardId, listId } = req.params;
    if (projectId && boardId && listId) {
        try {
            const data = await List.update({ isActive: false }, {
                where: { projectId: parseInt(projectId), boardId: parseInt(boardId), listId: parseInt(listId) }
            });
            if (data) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'List not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error deleting list' });
        }
    } else {
        res.status(400).json({ error: 'Project ID and BoardId and ListId is required' });
    }
}

export { getList, getLists, createList, editList, deleteList }