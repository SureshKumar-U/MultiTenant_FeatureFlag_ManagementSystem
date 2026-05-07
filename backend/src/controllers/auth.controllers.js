const authService = require("../services/auth.service");
const asyncHandler = require('express-async-handler');
const authController = {
    superAdminLogin: asyncHandler(async (req, res) => {
        
        const result = await authService.superAdminLogin(req.body);
        res.status(200).json(result);

    
    }),
    adminLogin: asyncHandler(async (req, res) => {
        // Implement admin login logic
        const result = await authService.adminLogin(req.body);
        


        res.status(200).json(result);
    }),
    adminRegister: asyncHandler(async (req, res) => {
        // Implement admin registration logic
        const result = await authService.adminRegister(req.body);
        res.status(200).json(result);
        })

}

module.exports = authController;