import { Request, Response } from 'express';
import { AccessProject } from '../db/models/AccessProject';

// /api/v1/projects/:projectId/members
// get
const getMembers = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (projectId) {
        console.log("inin")
        try {
            const data = await AccessProject.findAll({
                where: { projectId: parseInt(projectId), isActive: true },
                attributes: ['userId']
            });

            res.json(data.map((item) => item.toJSON().userId));
        } catch (error) {
            res.status(500).json({ error: 'Error fetching members' });
        }
    } else {
        console.log(projectId)
        res.status(400).json({ error: 'Project ID is required' });
    }
}

export { getMembers }