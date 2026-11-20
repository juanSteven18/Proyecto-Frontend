const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
    codigo_comprobante: { type: DataTypes.STRING, unique: true },
    numero_mesa: { type: DataTypes.STRING, allowNull: false },
    mesero_nombre: { type: DataTypes.STRING, allowNull: false },
    notas: { type: DataTypes.TEXT },
    subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    iva: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, allowNull: false },
    estado: {
        type: DataTypes.ENUM('espera', 'preparacion', 'entregado', 'cancelado'),
        defaultValue: 'espera'
    },
    fecha_entrega: { type: DataTypes.DATE, allowNull: true }
});

module.exports = Pedido;