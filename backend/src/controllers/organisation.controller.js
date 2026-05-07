const organisationService = require('../services/organisation.service');
const AsyncHandler = require('express-async-handler');
const ApiError = require('../config/error.config'); 

const organisationController = {

    findAllOrganisations: AsyncHandler(async (req, res) => {
        const organisations = await organisationService.findAllOrganizations();
        return res.status(200).json({message: "Organizations retrieved successfully", data:organisations});
    }),
    createOrganisation: AsyncHandler(async (req, res) => {
        const { name } = req.body;
        const newOrg = await organisationService.createOrganization(name);
        return res.status(201).json({message: "Organization created successfully", data: newOrg});
    }),
    findOrganisationById: AsyncHandler(async (req, res) => {
        const { id } = req.params;
        const org = await organisationService.findOrganizationById(id); 
        return res.status(200).json({message: "Organization found successfully", data: org});
    })

}

module.exports = organisationController;