const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { requiereLogin } = require('../middlewares/authMiddleware');

// Ruta GET para la pagina inicio
router.get('/', requiereLogin, tiendaController.index);
router.post('/pedidos', requiereLogin, tiendaController.crearPedido);

module.exports = router;