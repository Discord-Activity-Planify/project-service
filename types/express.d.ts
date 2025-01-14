import 'express';

declare module 'express' {
    export interface Request {
        userId?: string; // Add optional property for userId
        user?: Record<string, any>; // Add optional property for full user object
    }
}
