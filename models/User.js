const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    sobrenome: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "",
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "",
    },
    telefone1: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "",
    },
    telefone2: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "",
    },
    documento: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    tipo_documento: {
        type: DataTypes.ENUM("RG", "CPF", "HABILITACAO", "TITULO_ELEITOR"),
        allowNull: false
    },
    usuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    senha: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    setor: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    nivel_acesso:{
        type: DataTypes.ENUM("1", "2", "3", "4", "5"),
        allowNull: false,
        defaultValue: "1",
    },
    ativo: {
        type: DataTypes.ENUM("Ativo", "Inativo"),
        allowNull: false,
        defaultValue: "Ativo",
    }
}, { 
    timestamps: true
});

module.exports = User;