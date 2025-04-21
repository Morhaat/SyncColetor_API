const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Order = require("./Order");

const OrderItem = sequelize.define("OrderItem", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Order,
            key: "id", // Referência ao UUID do pedido
        },
        onDelete: "CASCADE", // Se o pedido for apagado, os itens também serão apagados
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    ean:{
        type:DataTypes.STRING(50),
        allowNull:true,
    },
    nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: false, // Localização do item no estoque
    },
});

// Relacionamento entre Order e OrderItem (1 Pedido tem muitos Itens)
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

module.exports = OrderItem;
