// En routes/history.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware'); // 👈 Importamos al guardia


router.post('/', authMiddleware, historyController.createTestResult);

router.get('/:classType', authMiddleware, historyController.getTestHistory);

// GET /api/history/:id - Obtener detalles de un test específico
router.get('/details/:id', authMiddleware, historyController.getTestHistoryDetail);

router.get('/stats/:classType', authMiddleware, historyController.getHistoryStats);

module.exports = router;