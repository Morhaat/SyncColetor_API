const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Order = sequelize.define("Order", {
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
    },
    externalId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "unique_external_id",
    },
    status: {
        type: DataTypes.ENUM("aguardando_separacao", "em_separacao", "separado", "cancelado"),
        allowNull: false,
        defaultValue: "aguardando_separacao",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Order;