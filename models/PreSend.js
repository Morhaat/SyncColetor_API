const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const PreSend = sequelize.define("PreSend", {
    id:{    
        type: DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
    },
    cabinet_code:{
        type:DataTypes.STRING,
        allowNull:false,   
    },
    bay_code:{
        type:DataTypes.STRING,
        allowNull:false,   
    },
    external_id:{
        type:DataTypes.STRING,
        allowNull:true,   
    },
    status:{
        type:DataTypes.ENUM("Ocupado", "Livre"),
        allowNull:false,
    },
}, {
    indexes: [
      {
        fields: ['cabinet_code']
      },
      {
        fields: ['bay_code']
      },
      {
        fields: ['external_id']
      }
    ]
});

module.exports = PreSend;