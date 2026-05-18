const express = require('express');
const router = express.Router();
const { getAiRecommendation } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getAiRecommendation);

module.exports = router;
