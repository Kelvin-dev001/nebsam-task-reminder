const express = require('express');
const { addDepartment, listDepartments } = require('../controllers/departmentController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/add', isAuthenticated, isAdmin, addDepartment);
router.get('/list', isAuthenticated, listDepartments);

module.exports = router;