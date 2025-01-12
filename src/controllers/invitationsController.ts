import { Request, Response } from 'express';
import { AccessProject } from '../db/models/AccessProject';
import { Project } from '../db/models/Project';

// /api/v1/projects/:projectId/invite
// POST
const invite = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!projectId || !userId) {
        res.status(400).json({ error: 'Invalid input data' });
        return;
    }

    try {
        // Check if the project exists
        const project = await Project.findOne({
            where: { projectId: parseInt(projectId), isActive: true },
        });

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        // Add the new user to the project
        await AccessProject.create({
            projectId: parseInt(projectId),
            userId: userId,
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ error: 'Error inviting user' });
    }
};

export { invite };
