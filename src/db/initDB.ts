import { dbConnect, sequelize } from './database';
import { AccessProject } from './models/AccessProject';
import { Board } from './models/Board/Board';
import { Acknowledgement } from './models/Board/List/Card/Acknowledgement';
import { Assign } from './models/Board/List/Card/Assign';
import { Card } from './models/Board/List/Card/Card';
import { CardVersion } from './models/Board/List/Card/CardVersion';
import { Style } from './models/Board/List/Card/Style';
import { List } from './models/Board/List/List';
import { Project } from './models/Project';
import { File } from './models/Board/List/Card/File';

export async function initDB() {
    await dbConnect();
    // await sequelize.drop();
    await Project.sync();
    await Board.sync();
    await List.sync();
    await Card.sync();
    await CardVersion.sync();
    await Assign.sync();
    await File.sync();
    await Acknowledgement.sync();
    await AccessProject.sync();
    await Style.sync();
}