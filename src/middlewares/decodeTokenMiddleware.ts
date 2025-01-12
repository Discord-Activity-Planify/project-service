import { NextFunction, Request, Response } from "express";

export const decodeTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization token' });
        return
    }

    const token = authHeader.split(' ')[1]; // Extract the token

    try {
        // Verify the token with Discord API
        const response = await fetch('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Discord API Error:', errorData);
            res.status(response.status).json({ error: errorData.message || 'Failed to authenticate user' });
            return
        }

        const userData = await response.json();

        // Attach user data to the request object
        req.userId = userData.id; // Discord user ID
        req.user = userData; // Full user object
        next();
    } catch (error: any) {
        console.error('Error verifying Discord token:', error.message);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
