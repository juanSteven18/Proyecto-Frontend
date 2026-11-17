const express = require('express');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Importar rutas de la tienda
const tiendaRoutes = require('./routes/tiendaRoutes');
app.use('/', tiendaRoutes);

// Sincronizacion de BD y Arranque
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos SQLite sincronizada correctamente.');
    app.listen(PORT, () => {
        console.log(`Servidor de Bite&Go activo en: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
});