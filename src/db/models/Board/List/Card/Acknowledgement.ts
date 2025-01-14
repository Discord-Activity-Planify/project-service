import { sequelize } from "../../../../database";
import { DataTypes } from "sequelize";

export const Acknowledgement = sequelize.define(
    "Acknowledgements",
    {
        cardId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        isAcknowledged: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        timestamps: false
    }
)