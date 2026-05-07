const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');


router.post('/super-admin/login',authController.superAdminLogin);


router.post('/admin/login',authController.adminLogin);


router.post('/admin/register',authController.adminRegister);



module.exports = router;