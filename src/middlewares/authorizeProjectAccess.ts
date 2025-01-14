import { NextFunction, Request, Response } from "express";
import { AccessProject } from "../db/models/AccessProject";

export const authorizeProjectAccess = async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const userId = req.userId; // From decodeTokenMiddleware

    if (!userId || !projectId) {
        res.status(400).json({ error: 'Invalid request parameters' });
        return;
    }

    try {
        const hasAccess = await AccessProject.findOne({
            where: { userId, projectId, isActive: true },
        });

        if (!hasAccess) {
            res.status(403).json({ error: 'Access denied to this project' });
            return;
        }

        next(); // User is authorized
    } catch (error: any) {
        console.error('Error during authorization:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
