const { sequelize, Pedido, DetallePedido, Producto } = require('../models');
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

            // Si pasa a cancelado restaura el stock de cada producto
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
    }
};

module.exports = panelController;