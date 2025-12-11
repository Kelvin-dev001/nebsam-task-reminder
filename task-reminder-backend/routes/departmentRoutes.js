const express = require('express');
const { addDepartment, listDepartments } = require('../controllers/departmentController');
const { isAuthenticated, isAdminOrSuperuser } = require('../middleware/auth');
const router = express.Router();

router.post('/add', isAuthenticated, isAdminOrSuperuser, addDepartment);
router.get('/list', isAuthenticated, listDepartments);

module.exports = router;