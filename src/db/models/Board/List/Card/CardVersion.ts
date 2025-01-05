import { sequelize } from "../../../../database";
import { DataTypes } from "sequelize";

export const CardVersion = sequelize.define(
    "CardVersions",
    {
        cardId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        versionNumber: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
        },
        styleId: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        startDate: {
            type: DataTypes.DATE,
        },
        endDate: {
            type: DataTypes.DATE,
        },
        verisonDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        descriptionIsChanged: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        addedNFiles: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        deletedNFiles: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        styleIsChanged: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }
)