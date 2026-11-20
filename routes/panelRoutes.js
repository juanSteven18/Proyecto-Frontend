const express = require('express');
const router = express.Router();
const panelController = require('../controllers/panelController');
const { requiereLogin, requiereRol } = require('../middlewares/authMiddleware');

router.get('/cola', requiereLogin, requiereRol('empleado', 'supervisor'), panelController.colaFIFO);
router.post('/pedidos/:id/estado', requiereLogin, requiereRol('empleado', 'supervisor'), panelController.cambiarEstadoPedido);
router.get('/historial', requiereLogin, requiereRol('supervisor'), panelController.historialSupervisor);

module.exports = router;