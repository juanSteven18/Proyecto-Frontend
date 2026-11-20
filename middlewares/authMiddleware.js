function requiereLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.redirect('/auth/login');
    }
    res.locals.usuarioActual = req.session.usuario;
    next();
}

function requiereRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.session || !req.session.usuario) {
            return res.redirect('/auth/login');
        }
        if (!rolesPermitidos.includes(req.session.usuario.rol)) {
            return res.status(403).send('Acceso denegado: no tienes permisos para esta sección.');
        }
        next();
    };
}

module.exports = {
    requiereLogin,
    requiereRol
};