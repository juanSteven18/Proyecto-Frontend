const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

const authController = {
    vistaLogin: (req, res) => {
        
        if (req.session && req.session.usuario) {
            return res.redirect('/');
        }
        res.render('admin/login', { error: null });
    },

    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const usuario = await Usuario.findOne({ where: { username, activo: true } });

            if (!usuario) {
                return res.status(401).render('admin/login', {
                    error: 'Usuario o contraseña incorrectos.'
                });
            }

            const passwordValida = await bcrypt.compare(password, usuario.password);
            if (!passwordValida) {
                return res.status(401).render('admin/login', {
                    error: 'Usuario o contraseña incorrectos.'
                });
            }

            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                username: usuario.username,
                rol: usuario.rol
            };

            // Redirigir siempre a la ruta raiz
            return res.redirect('/');
        } catch (error) {
            console.error('Error en login:', error);
            return res.status(500).render('admin/login', {
                error: 'Error interno al iniciar sesión.'
            });
        }
    },

    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/auth/login');
        });
    }
};

module.exports = authController;