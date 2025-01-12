import { sequelize } from "../database";
import { DataTypes } from "sequelize";

export const AccessProject = sequelize.define(
    "AccessProjects",
    {
        userId: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        projectId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: false
    }
)