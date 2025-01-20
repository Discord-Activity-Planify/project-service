import { Request, Response } from 'express';
import { AccessProject } from '../db/models/AccessProject';
import { decodeToken } from './decodeToken';

// Use a Map for efficient client tracking
const clients: Map<string, { res: Response; userId: string }> = new Map();

// SSE Endpoint
export const sseHandler = async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: Token is required' });
        return;
    }
    const decodeData = await decodeToken(token);

    if (decodeData.error && decodeData.status) {
        res.status(decodeData.status).json({ error: decodeData.error });
        return;
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate a unique ID for the client
    const clientId = Date.now().toString();

    // Add the client to the map
    clients.set(clientId, { res, userId: decodeData.userId });

    // Notify the client about connection success
    res.write(`event: connected\ndata: {"message": "Connected", "clientId": "${clientId}"}\n\n`);

    // Remove the client on disconnection
    req.on('close', () => {
        clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
    });

    console.log(`Client connected: ${clientId}, UserID: ${decodeData.userId}`);
};

// Broadcast Updates
export const broadcastUpdate = async (event: string, data: any) => {
    if (!data.projectId) return;
    console.log(data)

    try {
        const userIdsModel = await AccessProject.findAll({
            where: { projectId: data.projectId, isActive: true },
            attributes: ['userId'],
        });
        
        const userIds = userIdsModel.map((model) => model.toJSON().userId);
        console.log(userIds)
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

        console.log('Active clients:', [...clients.keys()]);

        clients.forEach((client, clientId) => {
            if (userIds.includes(client.userId)) {
                try {
                    client.res.write(message);
                    console.log(message);
                    console.log(client)
                } catch (err) {
                    console.error(`Error broadcasting to client ${clientId}:`, err);
                }
            }
        });
    } catch (error) {
        console.error('Error in broadcastUpdate:', error);
    }
};

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('Server shutting down. Closing all SSE connections...');
    clients.forEach((client, clientId) => {
        try {
            client.res.end();
        } catch (err) {
            console.error(`Error closing client connection ${clientId}:`, err);
        }
    });
    clients.clear();
});
