const express = require('express');
const {
  addDepartment,
  listDepartments,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');
const router = express.Router();

// Only superuser can manage departments
router.post('/add', isAuthenticated, isSuperuser, addDepartment);
router.put('/:id', isAuthenticated, isSuperuser, updateDepartment);
router.delete('/:id', isAuthenticated, isSuperuser, deleteDepartment);

// Everyone authenticated can list (to select when creating tasks)
router.get('/list', isAuthenticated, listDepartments);

module.exports = router;