



const asyncHandler = require('express-async-handler');
const organizationModel = require('../models/organization.models');
const ApiError = require('../config/error.config');

const organisationService = {
    findAllOrganizations: asyncHandler(async () => {
        const organizations = await organizationModel.find();
        if( organizations.length === 0) {
            return [];
        }
        return await organizations?.map(org => ({ id: org._id, name: org.name}));
    }),
    createOrganization: asyncHandler(async (name) => {
        if (!name) {
            throw new ApiError("Organization name is required", 400);
        }
        const existingOrg = await organizationModel.findOne({ name });
        if (existingOrg) {
            throw new ApiError("Organization name already exists", 400);
        }   
        const newOrg = new organizationModel({ name });
        await newOrg.save();
        return { id: newOrg._id, name: newOrg.name };
    }),
    findOrganizationById: asyncHandler(async (id) => {
        const org = await organizationModel.findById(id);
        if (!org) {
            throw new ApiError("Organization not found", 404);
        }   
        return { id: org._id, name: org.name };
    })  
}

module.exports = organisationService;