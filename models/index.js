const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');

Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });

Producto.hasMany(DetallePedido, { foreignKey: 'producto_id' });
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

module.exports = {
    sequelize,
    Usuario,
    Categoria,
    Producto,
    Pedido,
    DetallePedido
};