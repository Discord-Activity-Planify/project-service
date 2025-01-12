import { Request, Response } from 'express';
import { Style } from '../db/models/Board/List/Card/Style';

// /api/v1/styles
// GET
const getStyles = async (req: Request, res: Response) => {
    try {
        // Fetch all styles
        const styles = await Style.findAll();

        // Respond with the data
        res.json(styles);
    } catch (error) {
        console.error('Error fetching styles:', error);
        res.status(500).json({ error: 'Failed to fetch styles' });
    }
};

export { getStyles };
