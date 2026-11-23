const express = require('express');
const router = express.Router();
const panelController = require('../controllers/panelController');
const { requiereLogin, requiereRol } = require('../middlewares/authMiddleware');

router.get('/cola', requiereLogin, requiereRol('empleado', 'supervisor'), panelController.colaFIFO);
router.post('/pedidos/:id/estado', requiereLogin, requiereRol('empleado', 'supervisor'), panelController.cambiarEstadoPedido);
router.get('/historial', requiereLogin, requiereRol('supervisor'), panelController.historialSupervisor);

// --- NUEVAS RUTAS SOLO PARA SUPERVISOR ---
router.get('/productos', requiereLogin, requiereRol('supervisor'), panelController.vistaProductos);
router.post('/productos', requiereLogin, requiereRol('supervisor'), panelController.crearProducto);
router.post('/productos/:id/destacar', requiereLogin, requiereRol('supervisor'), panelController.alternarDestacado);

module.exports = router;