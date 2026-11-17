const { Producto, Categoria } = require('../models');

const tiendaController = {
    
    index: async (req, res) => {
        try {
            // Consultar todas las categorias de la base de datos
            const categorias = await Categoria.findAll();
            const productos = await Producto.findAll({
                include: [{ 
                    model: Categoria, 
                    as: 'categoria' 
                }]
            });

            // Renderizar la vista pasando los datos obtenidos
            res.render('cliente/index', { categorias, productos });
        } catch (error) {
            console.error('Error al cargar el catálogo de la tienda:', error);
            res.status(500).send('Error interno del servidor al cargar el menú.');
        }
    }
};

module.exports = tiendaController;