const express = require('express');
const router = express.Router();
const {
  addEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// All employee routes are protected by JWT
router.use(protect);

router.post('/', addEmployee);
router.get('/', getEmployees);
router.get('/search', searchEmployees);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
