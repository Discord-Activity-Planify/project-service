import { Request, Response } from 'express';
import { Project } from '../db/models/Project';
import { sequelize } from '../db/database';
import { AccessProject } from '../db/models/AccessProject';

// /api/v1/projects/:projectId
// get
const getProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (projectId) {
        try {
            const data = await Project.findOne({ 
                where: { projectId: parseInt(projectId), isActive: true } 
            });
            if (data) {
                res.json({
                    projectId: data.toJSON().projectId,
                    name: data.toJSON().name,
                    description: data.toJSON().description
                });
            } else {
                res.status(404).json({ error: 'Project not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error fetching project' });
        }
    }
}

// /api/v1/projects?page={page}&limit={limit}
// get
const getProjects = async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const {userId} = req;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID is required' });
        return;
    }

    let whereClaus: {
        where: {
            isActive: boolean;
            projectId?: number[];
        };
        offset: number;
        limit?: number;
    } = {
        where: { isActive: true },
        offset: 0,
    }
    if (page && limit) {
        whereClaus.offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
        whereClaus.limit = parseInt(limit.toString());
    }
    try {
        const accessProjects = await AccessProject.findAll({
            where: {
                userId: userId,
                isActive: true
            },
            attributes: ['projectId']
        })

        const projectIds = accessProjects.map((access) => access.toJSON().projectId);
        
        if (!projectIds.length) {
            res.json({
                data: [],
                pagination: {},
            });
            return;
        }

        whereClaus.where.projectId = projectIds;

        const data = await Project.findAndCountAll(whereClaus);
        res.json({
            data: [
                ...data.rows.map((project) => ({
                    projectId: project.toJSON().projectId,
                    name: project.toJSON().name,
                    description: project.toJSON().description
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

// /api/v1/projects
// post
const createProject = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    const { name, description } = req.body;
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
        const project = await Project.create(
            { name, description },
            {transaction: t}
        );

        if (!project || !project.toJSON().projectId) {
            throw new Error('Failed to create project');
        }

        await AccessProject.create(
            {
                userId: userId,
                projectId: project.toJSON().projectId
            },
            {transaction: t}
        )

        await t.commit();
        
        res.status(201).json({projectId: project.toJSON().projectId});
    } catch (error) {
        if (t) await t.rollback();
        console.log(error);
        res.status(500).json({ erorr: 'Error creating project' });
    }
}

// /api/v1/projects/:projectId
// put
const editProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { name, description } = req.body;
    if (projectId) {
        try {
            const data = await Project.update({ name, description }, {
                where: { projectId: parseInt(projectId) }
            });
            if (data) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Project not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error editing project' });
        }
    } else {
        res.status(400).json({ error: 'Project ID is required' });
    }
}

// /api/v1/projects/:projectId
// delete
const deleteProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (projectId) {
        try {
            const data = await Project.update({ isActive: false }, {
                where: { projectId: parseInt(projectId) }
            });
            if (data) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Project not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error deleting project' });
        }
    } else {
        res.status(400).json({ error: 'Project ID is required' });
    }
}

export { getProject, getProjects, createProject, editProject, deleteProject }