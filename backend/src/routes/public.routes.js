const express = require('express');
const router = express.Router();
const featureFlagController = require('../controllers/feature_flag.controllers');
const organisationController = require('../controllers/organisation.controller');

// Public feature flag check does not require authentication.
router.get('/feature-flags/check', featureFlagController.checkFeatureFlag);
router.get("/organisations", organisationController.findAllOrganisations);

module.exports = router;
