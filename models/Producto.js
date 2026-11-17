const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    precio: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imagen_url: { type: DataTypes.STRING, defaultValue: '/img/default-food.png' },
    destacado: { type: DataTypes.BOOLEAN, defaultValue: false } 
});

module.exports = Producto;