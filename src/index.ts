import express, { json, urlencoded } from 'express';
import config from './config';
import projectsApi from './routers/projectsApi';
import stylesApi from './routers/stylesApi';
import { initDB } from './db/initDB';
import { corsMiddleware } from './middlewares/corsMiddleware';
import { decodeTokenMiddleware }from './middlewares/decodeTokenMiddleware';

async function main(): Promise<void> {
    const app = express();
    const port = config.app.port;
    const host = config.app.host;

    await initDB();

    app.use(json())
    app.use(urlencoded({ extended: true}))
    app.use(corsMiddleware);
    app.use(decodeTokenMiddleware);

    // api/v1
    app.use('/api/v1/projects', projectsApi)
    app.use('api/v1/styles', stylesApi)

    app.listen(port, () => console.log(`Server is running on http://${host}:${port}`))
}
main()