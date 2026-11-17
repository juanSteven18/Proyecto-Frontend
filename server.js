const express = require('express');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para procesar formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estaticos 
app.use(express.static(path.join(__dirname, 'public')));

// Configuracion del motor
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ruta temporal
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #f97316;">Sistema Automatizado de Pedidos e Inventario 🚀</h1>
            <p>El servidor Express y Sequelize con SQLite están operando correctamente.</p>
            <p><b>Estado:</b> En línea y listos para desarrollar las vistas EJS.</p>
        </div>
    `);
});

// Sincronizacion de la Base de Datos 
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos SQLite sincronizada correctamente.');
    app.listen(PORT, () => {
        console.log(`Servidor activo en el puerto ${PORT}`);
        console.log(`Abre en tu navegador: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
});