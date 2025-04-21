const { DataTypes } = require("sequelize");
const sequelize = require("../database");


const Log = sequelize.define('Log', {
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
    },
    acao: {
        type: DataTypes.ENUM("create", "update", "delete"),
        allowNull: false,
    },
    campos_utilizados: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    reference_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    usuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'logs',
});

module.exports = Log;
