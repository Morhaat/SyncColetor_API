const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Webhook = sequelize.define("Webhook", {
    id:{    
        type: DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
    },
    event:{
        type:DataTypes.STRING,
        allowNull:false,   
    },
    url:{
        type:DataTypes.STRING,
        allowNull:false,
    },
});

module.exports = Webhook;