import { Request, Response } from 'express';
import { Board } from '../db/models/Board/Board';

// /api/v1/projects/:projectId/boards/:boardId
// get
const getBoard = async (req: Request, res: Response) => {
    const { projectId, boardId } = req.params;
    if (projectId && boardId) {
        try {
            const data = await Board.findOne({ 
                where: { projectId: parseInt(projectId), boardId: parseInt(boardId), isActive: true } 
            });
            if (data) {
                res.json({
                    boardId: data.toJSON().boardId,
                    name: data.toJSON().name,
                    description: data.toJSON().description
                });
            } else {
                res.status(404).json({ error: 'Board not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error fetching board' });
        }
    }
}

// /api/v1/projects/{projectId}/boards?page={page}&limit={limit}
// get
const getBoards = async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const {userId} = req;
    const { projectId } = req.params;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID is required' });
        return;
    }
    if (!projectId) {
        res.status(400).json({ error: 'Project ID is required' });
        return;
    }

    let whereClaus: {
        where: {
            isActive: boolean;
            projectId: number;
        };
        offset: number;
        limit?: number;
    } = {
        where: { isActive: true, projectId: parseInt(projectId) },
        offset: 0,
    }
    if (page && limit) {
        whereClaus.offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
        whereClaus.limit = parseInt(limit.toString());
    }
    try {
        const data = await Board.findAndCountAll(whereClaus);
        res.json({
            data: [
                ...data.rows.map((baord) => ({
                    boardId: baord.toJSON().boardId,
                    name: baord.toJSON().name,
                    description: baord.toJSON().description
                }))
            ],
            paginaiton: {
                lastPage: page,
                limit: limit,
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error fetching projects' });
    }
}

// /api/v1/projects/:projectId/boards
// post
const createBoard = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const { projectId } = req.params;
    const { userId } = req
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID is required' });
        return;
    }

    try {
        const board = await Board.create(
            { projectId, name, description }
        );

        if (!board || !board.toJSON().boardId) {
            throw new Error('Failed to create board');
        }
        
        res.status(201).json({boardId: board.toJSON().boardId});
    } catch (error) {
        console.log(error);
        res.status(500).json({ erorr: 'Error creating project' });
    }
}

// /api/v1/projects/:projectId/boards/:boardId
// put
const editBoard = async (req: Request, res: Response) => {
    const { projectId, boardId } = req.params;
    const { name, description } = req.body;
    if (projectId && boardId) {
        try {
            const data = await Board.update({ name, description }, {
                where: { projectId: parseInt(projectId), boardId: parseInt(boardId) }
            });
            if (data) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Board not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error editing board' });
        }
    } else {
        res.status(400).json({ error: 'Project ID and BoardId is required' });
    }
}

// /api/v1/projects/:projectId/boards/:boardId
// delete
const deleteBoard = async (req: Request, res: Response) => {
    const { projectId, boardId } = req.params;
    if (projectId && boardId) {
        try {
            const data = await Board.update({ isActive: false }, {
                where: { projectId: parseInt(projectId), boardId: parseInt(boardId) }
            });
            if (data) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Board not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error deleting board' });
        }
    } else {
        res.status(400).json({ error: 'Project ID and BoardId is required' });
    }
}

export { getBoard, getBoards, createBoard, editBoard, deleteBoard }