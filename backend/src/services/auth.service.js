const asyncHandler = require("express-async-handler");
const ApiError = require("../config/error.config");
const userModel = require("../models/user.models");
const { generateToken } = require("../middlewares/auth.middleware");
const OrganizationModel = require("../models/organization.models");
const { SUPER_ADMIN_EMAIL,SUPER_ADMIN_PASSWORD } = require("../config/env.config");



const authService = {

    superAdminLogin: asyncHandler(async (data) => {
        const { email, password } = data;
        if (email !== SUPER_ADMIN_EMAIL || password !== SUPER_ADMIN_PASSWORD) {
            throw new ApiError("Invalid super admin credentials", 401);
        }
        const token = generateToken({ role: "superadmin", email, organization: null });
        return { message: "Super admin login successful", token };

    }),
    adminLogin: asyncHandler(async (data) => {
        const { email, password } = data;
        const user = await userModel.findOne({ email });
        if (!user || user.role !== "admin") {
            throw new ApiError("Invalid admin credentials", 401);
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new ApiError("Invalid admin credentials", 401);
        }
        const token = generateToken({ id: user._id, role: user.role, organization: user.organization });
        return { message: "Admin login successful", token };
    }),
    adminRegister: asyncHandler(async (data) => {

        const { email, password, organizationId, name } = data;
        if (!email || !password || !organizationId || !name) {
            throw new ApiError("Missing required fields", 400);
        }
        const organization = await OrganizationModel.findById(organizationId);
        if (!organization) {
            throw new ApiError("Organization not found", 404);
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new ApiError("Email already in use", 400);
        }
        const newUser = new userModel({ username: name, email, password: password , role: "admin", organization: organizationId });
        await newUser.save();
        return { message: "Admin registration successful" };
    }),






}

module.exports = authService