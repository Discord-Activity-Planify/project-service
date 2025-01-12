import { sequelize } from "../../../database";
import { DataTypes } from "sequelize";

export const List = sequelize.define(
    "Lists",
    {
        listId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        boardId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false
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