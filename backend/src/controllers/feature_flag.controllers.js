const AsyncHandler = require('express-async-handler');
const featureFlagService = require('../services/feature_flag.service');
const ApiError = require('../config/error.config');

const featureFlagController = {

    checkFeatureFlag: AsyncHandler(async (req, res) => {
        const { orgId, key:featureKey } = req.query;
        const resp = await featureFlagService.checkFeatureFlag(orgId, featureKey);
        return res.status(200).json(resp);  

    }),
    findAllFeatureFlags: AsyncHandler(async (req, res) => {
        const orgId = req.user.organization;
        const flags = await featureFlagService.findAllFeatureFlags(orgId);
        return res.status(200).json({message: "Feature flags retrieved successfully", data: flags});
    }),
    createFeatureFlag: AsyncHandler(async (req, res) => {   
        const orgId = req.user.organization;
        const { key, description, enabled } = req.body;
        const newFlag = await featureFlagService.createFeatureFlag(orgId, key, description, enabled);
        return res.status(201).json({message: "Feature flag created successfully", data: newFlag});
    }  ),
        updateFeatureFlag: AsyncHandler(async (req, res) => {   
        const orgId = req.user.organization;
        const { id:feature_flag_id } = req.params;
        const { enabled } = req.body;
        const updatedFlag = await featureFlagService.updateFeatureFlag(orgId, feature_flag_id, enabled);
        return res.status(200).json({message: "Feature flag updated successfully", data: updatedFlag});
    } ),
    deleteFeatureFlag: AsyncHandler(async (req, res) => {   
        const orgId = req.user.organization;
        const { id:feature_flag_id } = req.params;
        await featureFlagService.deleteFeatureFlag(orgId, feature_flag_id);
        return res.status(200).json({message: "Feature flag deleted successfully"});
    } ) 

}

module.exports = featureFlagController;