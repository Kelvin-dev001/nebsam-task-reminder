const express = require('express');
const {
  addDepartment,
  listDepartments,
  listDepartmentsPublic,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');
const router = express.Router();

// Public list for complaint form
router.get('/public-list', listDepartmentsPublic);

// Only superuser can manage departments
router.post('/add', isAuthenticated, isSuperuser, addDepartment);
router.put('/:id', isAuthenticated, isSuperuser, updateDepartment);
router.delete('/:id', isAuthenticated, isSuperuser, deleteDepartment);

// Authenticated list (internal)
router.get('/list', isAuthenticated, listDepartments);

module.exports = router;