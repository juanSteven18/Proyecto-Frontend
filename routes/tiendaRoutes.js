const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');

// Ruta GET para la pagina inicio
router.get('/', tiendaController.index);


module.exports = router;