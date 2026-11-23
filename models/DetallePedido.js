const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: DataTypes.FLOAT, allowNull: false },
    subtotal: { type: DataTypes.FLOAT, allowNull: false }
});

module.exports = DetallePedido;