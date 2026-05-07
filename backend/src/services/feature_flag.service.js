const AsyncHandler = require("express-async-handler");
const FeatureFlag = require("../models/features.models");
const Organization = require("../models/organization.models");
const ApiError = require("../config/error.config");
const { default: mongoose } = require("mongoose");


const featureFlagService = {

    checkFeatureFlag: AsyncHandler(async (orgId, featureKey) => {

        if (!orgId || !featureKey) {
            throw new ApiError( 'orgId and featureKey are required', 400);
        }

        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            throw new ApiError( 'Invalid orgId', 400);
        }
        const org = await Organization.findById(orgId).lean();
        if (!org) {
            throw new ApiError( 'Organization not found', 404);
        }

        const flag = await FeatureFlag.findOne({ organization: orgId, key: featureKey }).lean();
        if (!flag) {
            throw new ApiError( 'Feature flag not found', 404);
        }


        return { key: featureKey, orgId, orgName: org.name, enabled: flag.isEnabled, found: true };



    }),
    findAllFeatureFlags: AsyncHandler(async (orgId) => {
        if (!orgId) {
            throw new ApiError( 'orgId is required', 400);
        }

        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            throw new ApiError( 'Invalid orgId', 400);
        }
        const flags = await FeatureFlag.find({ organization: orgId }).lean();
        return flags;
    }),
    createFeatureFlag: AsyncHandler(async (orgId, key, description, enabled) => {
        if (!orgId || !key) {
            throw new ApiError( 'orgId and key are required', 400);
        }

        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            throw new ApiError( 'Invalid orgId', 400);
        }

        // Validate key format
        if (!/^[a-z0-9_]+$/.test(key)) {
            throw new ApiError( 'key must be lowercase letters, numbers, and underscores only', 400);
        }

        const existing = await FeatureFlag.findOne({ organization: orgId, name:key, key:key })
        if (existing) {
            throw new ApiError( 'Flag "${key}" already exists for your organization', 409);
        }

  
        const flag = await FeatureFlag.create({
            organization: orgId,
            name: key,
            key: key,
            description: description || '',
            isEnabled: Boolean(enabled)
        });

        return flag;
    }),
    updateFeatureFlag: AsyncHandler(async (orgId, feature_flag_id, enabled) => {
        const flag = await FeatureFlag.findById(feature_flag_id);
        if (!flag) {
            throw new ApiError( 'Flag not found', 404);
        }
        if (flag.organization.toString() !== orgId) {
            throw new ApiError( 'Cannot modify flags from another organization', 403);
        }

        const updated = await FeatureFlag.findByIdAndUpdate(feature_flag_id, { isEnabled: enabled }, { new: true });
        return updated;
    }
    ),
    deleteFeatureFlag: AsyncHandler(async (orgId, feature_flag_id) => {
        const flag = await FeatureFlag.findById(feature_flag_id);
        if (!flag) {
            throw new ApiError( 'Flag not found', 404);
        }
        if (flag.organization.toString() !== orgId) {
            throw new ApiError( 'Cannot delete flags from another organization', 403    );
        }
        await FeatureFlag.findByIdAndDelete(feature_flag_id);
        return { message: 'Flag deleted successfully' };
    })

}


module.exports = featureFlagService;