import { Request, Response } from 'express';
import { AccessProject } from '../db/models/AccessProject';
import { getUserDataFromDiscord } from './getUserDataFromDiscord';

// /api/v1/projects/:projectId/members
// get
const getMembers = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (projectId) {
        try {
            const data = await AccessProject.findAll({
                where: { projectId: parseInt(projectId), isActive: true },
                attributes: ['userId']
            });
            const userDataPromises = data.map(async (item) => {
                const userData = await getUserDataFromDiscord(item.toJSON().userId);
                return {
                    ...userData
                };
            });

            const userData = await Promise.all(userDataPromises);

            res.json(userData);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching members' });
        }
    } else {
        console.log(projectId)
        res.status(400).json({ error: 'Project ID is required' });
    }
}

export { getMembers }