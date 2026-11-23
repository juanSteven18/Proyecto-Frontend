const { sequelize, Pedido, DetallePedido, Producto, Categoria } = require('../models');
const { Op } = require('sequelize');

const panelController = {
    colaFIFO: async (req, res) => {
        try {
            const pedidos = await Pedido.findAll({
                where: {
                    estado: { [Op.in]: ['espera', 'preparacion'] }
                },
                order: [['createdAt', 'ASC']],
                include: [{
                    model: DetallePedido,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto'
                    }]
                }]
            });

            res.render('admin/cola', {
                pedidos,
                usuario: req.session.usuario
            });
        } catch (error) {
            console.error('Error al cargar la cola:', error);
            res.status(500).send('Error al cargar la cola de pedidos.');
        }
    },

    cambiarEstadoPedido: async (req, res) => {
        const { id } = req.params;
        const { nuevoEstado } = req.body;

        if (!['entregado', 'cancelado', 'preparacion'].includes(nuevoEstado)) {
            return res.status(400).send('Estado no válido.');
        }

        const t = await sequelize.transaction();

        try {
            const pedido = await Pedido.findByPk(id, {
                include: [{ model: DetallePedido, as: 'detalles' }],
                transaction: t
            });

            if (!pedido) {
                await t.rollback();
                return res.status(404).send('Pedido no encontrado.');
            }

            if (nuevoEstado === 'cancelado' && pedido.estado !== 'cancelado') {
                for (const det of pedido.detalles) {
                    const prod = await Producto.findByPk(det.producto_id, { transaction: t });
                    if (prod) {
                        prod.stock += det.cantidad;
                        await prod.save({ transaction: t });
                    }
                }
            }

            pedido.estado = nuevoEstado;
            if (nuevoEstado === 'entregado') {
                pedido.fecha_entrega = new Date();
            }

            await pedido.save({ transaction: t });
            await t.commit();

            return res.redirect('/panel/cola');
        } catch (error) {
            await t.rollback();
            console.error('Error al actualizar estado del pedido:', error);
            return res.status(500).send('No se pudo actualizar el estado del pedido.');
        }
    },

    historialSupervisor: async (req, res) => {
        try {
            const inicioDia = new Date();
            inicioDia.setHours(0, 0, 0, 0);

            const finDia = new Date();
            finDia.setHours(23, 59, 59, 999);

            const pedidosHoy = await Pedido.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [inicioDia, finDia]
                    }
                },
                order: [['createdAt', 'DESC']],
                include: [{
                    model: DetallePedido,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto'
                    }]
                }]
            });

            const totalPedidosDia = pedidosHoy.length;
            const totalEntregados = pedidosHoy.filter(p => p.estado === 'entregado').length;
            const totalCancelados = pedidosHoy.filter(p => p.estado === 'cancelado').length;
            const ingresosDia = pedidosHoy
                .filter(p => p.estado !== 'cancelado')
                .reduce((acc, p) => acc + Number(p.total || 0), 0);

            res.render('admin/historial', {
                pedidos: pedidosHoy,
                resumen: {
                    totalPedidosDia,
                    totalEntregados,
                    totalCancelados,
                    ingresosDia
                },
                usuario: req.session.usuario
            });
        } catch (error) {
            console.error('Error al cargar historial del supervisor:', error);
            res.status(500).send('Error al cargar el historial.');
        }
    },

    vistaProductos: async (req, res) => {
        try {
            const productos = await Producto.findAll({
                include: [{ model: Categoria, as: 'categoria' }],
                order: [['createdAt', 'DESC']]
            });
            const categorias = await Categoria.findAll();

            res.render('admin/productos', {
                productos,
                categorias,
                usuario: req.session.usuario
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
            res.status(500).send('Error al cargar la gestión de productos.');
        }
    },

    crearProducto: async (req, res) => {
        try {
            const { nombre, descripcion, precio, stock, imagen_url, categoria_id, ubicacion } = req.body;
            const esDestacado = ubicacion === 'destacado';

            await Producto.create({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precio: parseFloat(precio),
                stock: parseInt(stock, 10) || 0,
                imagen_url: imagen_url && imagen_url.trim() !== '' ? imagen_url.trim() : '/img/ham.webp',
                categoria_id: parseInt(categoria_id, 10),
                destacado: esDestacado
            });

            res.redirect('/panel/productos');
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).send('No se pudo registrar el producto.');
        }
    },

    alternarDestacado: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);
            if (!producto) {
                return res.status(404).send('Producto no encontrado.');
            }
            producto.destacado = !producto.destacado;
            await producto.save();
            res.redirect('/panel/productos');
        } catch (error) {
            console.error('Error al cambiar estado destacado:', error);
            res.status(500).send('Error al actualizar el producto.');
        }
    }
};

module.exports = panelController;