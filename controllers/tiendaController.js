const { sequelize, Producto, Categoria, Pedido, DetallePedido } = require('../models');

const IVA_RATE = 0.16;

function generarCodigoComprobante() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#ORD-${randomNum}`;
}

const tiendaController = {
    index: async (req, res) => {
        try {
            const categorias = await Categoria.findAll();
            const productos = await Producto.findAll({
                include: [{
                    model: Categoria,
                    as: 'categoria'
                }]
            });

            res.render('cliente/index', { categorias, productos });
        } catch (error) {
            console.error('Error al cargar el catálogo de la tienda:', error);
            res.status(500).send('Error interno del servidor al cargar el menú.');
        }
    },

    crearPedido: async (req, res) => {
        const { numero_mesa, mesero_nombre, notas, items } = req.body;

        if (!numero_mesa || !mesero_nombre || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debes indicar número de mesa, nombre del mesero y al menos un producto.'
            });
        }

        const t = await sequelize.transaction();

        try {
            let subtotalCalculado = 0;
            const detallesPreparados = [];

            // Validar disponibilidad al descontar items
            for (const item of items) {
                const cantidadSolicitada = parseInt(item.cantidad, 10);
                const productoId = parseInt(item.id, 10);

                if (!productoId || !cantidadSolicitada || cantidadSolicitada <= 0) {
                    throw new Error('Cantidad o producto inválido en el pedido.');
                }

                const productoDB = await Producto.findByPk(productoId, { transaction: t });

                if (!productoDB) {
                    throw new Error(`El producto con ID ${productoId} no existe.`);
                }

                if (productoDB.stock < cantidadSolicitada) {
                    throw new Error(
                        `Stock insuficiente para "${productoDB.nombre}". Disponible: ${productoDB.stock}, solicitado: ${cantidadSolicitada}.`
                    );
                }

                // Descontar inventario
                productoDB.stock -= cantidadSolicitada;
                await productoDB.save({ transaction: t });

                const precioUnitario = Number(productoDB.precio);
                const subtotalItem = Number((precioUnitario * cantidadSolicitada).toFixed(2));
                subtotalCalculado += subtotalItem;

                detallesPreparados.push({
                    producto_id: productoDB.id,
                    nombre: productoDB.nombre,
                    cantidad: cantidadSolicitada,
                    precio_unitario: precioUnitario,
                    subtotal: subtotalItem
                });
            }

            subtotalCalculado = Number(subtotalCalculado.toFixed(2));
            const ivaCalculado = Number((subtotalCalculado * IVA_RATE).toFixed(2));
            const totalCalculado = Number((subtotalCalculado + ivaCalculado).toFixed(2));

            // Crear estado del pedido en la cabecera
            const nuevoPedido = await Pedido.create({
                codigo_comprobante: generarCodigoComprobante(),
                numero_mesa: String(numero_mesa).trim(),
                mesero_nombre: String(mesero_nombre).trim(),
                notas: notas ? String(notas).trim() : '',
                subtotal: subtotalCalculado,
                iva: ivaCalculado,
                total: totalCalculado,
                estado: 'espera'
            }, { transaction: t });

            // Guardar cada linas de detalles
            for (const det of detallesPreparados) {
                await DetallePedido.create({
                    pedido_id: nuevoPedido.id,
                    producto_id: det.producto_id,
                    cantidad: det.cantidad,
                    precio_unitario: det.precio_unitario,
                    subtotal: det.subtotal
                }, { transaction: t });
            }

            await t.commit();

            return res.status(201).json({
                ok: true,
                pedido: {
                    id: nuevoPedido.id,
                    codigo_comprobante: nuevoPedido.codigo_comprobante,
                    numero_mesa: nuevoPedido.numero_mesa,
                    mesero_nombre: nuevoPedido.mesero_nombre,
                    notas: nuevoPedido.notas,
                    subtotal: nuevoPedido.subtotal,
                    iva: nuevoPedido.iva,
                    total: nuevoPedido.total,
                    estado: nuevoPedido.estado,
                    createdAt: nuevoPedido.createdAt,
                    items: detallesPreparados
                }
            });
        } catch (error) {
            await t.rollback();
            console.error('Error al procesar pedido:', error.message);
            return res.status(400).json({
                ok: false,
                mensaje: error.message || 'No se pudo procesar el pedido.'
            });
        }
    }
};

module.exports = tiendaController;