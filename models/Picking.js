const { DataTypes } = require("sequelize");
const sequelize = require("../database");


const Picking = sequelize.define('Picking', {
    id_picking:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type_picking: {
        type: DataTypes.ENUM("wave", "zone", "batch"),
        allowNull: false,
    },
    reference_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status:{
        type: DataTypes.STRING(20),
        allowNull:false
    },
    picker_user:{
        type:DataTypes.STRING(50),
        allowNull:true
    },
    start_task:{
        type:DataTypes.DATE,
        allowNull:true
    },
    end_task:{
        type:DataTypes.DATE,
        allowNull:true
    }
}, {
    timestamps: true,
    tableName: 'picking',
});

module.exports = Picking;
