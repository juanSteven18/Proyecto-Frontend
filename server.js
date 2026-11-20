const express = require('express');
const path = require('path');
const session = require('express-session');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'bitego-secreto-academico-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 } 
}));

app.use((req, res, next) => {
    res.locals.usuarioActual = req.session ? req.session.usuario || null : null;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const tiendaRoutes = require('./routes/tiendaRoutes');
const authRoutes = require('./routes/authRoutes');
const panelRoutes = require('./routes/panelRoutes');

app.use('/auth', authRoutes);
app.use('/panel', panelRoutes);
app.use('/', tiendaRoutes);

sequelize.sync().then(() => {
    console.log('Base de datos SQLite sincronizada correctamente.');
    app.listen(PORT, () => {
        console.log(`Servidor de Bite&Go activo en: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
});