import { sequelize } from "../../../../database";
import { DataTypes } from "sequelize";

export const File = sequelize.define(
    "Files",
    {
        fileId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cardId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        versionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
)