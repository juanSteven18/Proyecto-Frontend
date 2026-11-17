const { sequelize, Usuario, Categoria, Producto } = require('./models');
const bcrypt = require('bcryptjs');

async function ejecutarSeed() {
    try {
        
        await sequelize.sync({ force: true });
        console.log('Base de datos recreada para datos de prueba.');

        // 1. Crear usuarios de prueba (Admin y Empleado)
        const passAdmin = await bcrypt.hash('admin123', 10);
        const passEmp = await bcrypt.hash('emp123', 10);

        await Usuario.bulkCreate([
            { nombre: 'Administrador General', username: 'admin', password: passAdmin, rol: 'admin' },
            { nombre: 'Empleado de Cocina', username: 'empleado', password: passEmp, rol: 'empleado' }
        ]);

        // 2. Crear categorías del menú
        const catBurgers = await Categoria.create({ 
            nombre: 'Hamburguesas', 
            descripcion: 'Hamburguesas artesanales con carne 100% de res' 
        });
        
        const catBebidas = await Categoria.create({ 
            nombre: 'Bebidas y Acompañantes', 
            descripcion: 'Refrescos, papas fritas y extras' 
        });

        // 3. Crear productos iniciales con stock controlado
        await Producto.bulkCreate([
            { 
                nombre: 'Hamburguesa Clásica', 
                descripcion: 'Carne 150g, queso cheddar fundido, lechuga, tomate y salsa de la casa.', 
                precio: 8.50, 
                stock: 20, 
                destacado: true, 
                categoria_id: catBurgers.id 
            },
            { 
                nombre: 'Hamburguesa Doble Tocineta', 
                descripcion: 'Doble carne, doble cheddar, tiras de tocineta crujiente y cebolla caramelizada.', 
                precio: 12.00, 
                stock: 12, 
                destacado: true, 
                categoria_id: catBurgers.id 
            },
            { 
                nombre: 'Papas Fritas Medianas', 
                descripcion: 'Porción de papas crujientes sazonadas con sal y especias.', 
                precio: 3.50, 
                stock: 30, 
                destacado: false, 
                categoria_id: catBebidas.id 
            },
            { 
                nombre: 'Refresco de Cola 500ml', 
                descripcion: 'Bebida fría en presentación personal.', 
                precio: 2.00, 
                stock: 50, 
                destacado: false, 
                categoria_id: catBebidas.id 
            }
        ]);

        console.log('Datos de prueba inyectados exitosamente.');
        process.exit();
    } catch (error) {
        console.error('Error al ejecutar el seeder:', error);
        process.exit(1);
    }
}

ejecutarSeed();