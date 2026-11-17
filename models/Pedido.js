const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
    codigo_comprobante: { type: DataTypes.STRING, unique: true },
    cliente_nombre: { type: DataTypes.STRING, allowNull: false },
    cliente_telefono: { type: DataTypes.STRING },
    notas: { type: DataTypes.TEXT },
    total: { type: DataTypes.FLOAT, allowNull: false },
    estado: { 
        type: DataTypes.ENUM('pendiente', 'preparacion', 'entregado', 'cancelado'), 
        defaultValue: 'pendiente' 
    }
});

module.exports = Pedido;