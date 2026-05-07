const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const featureFlagController = require('../controllers/feature_flag.controllers');


router.get('/', featureFlagController.findAllFeatureFlags   
);

router.post('/', featureFlagController.createFeatureFlag);

router.put('/:id', featureFlagController.updateFeatureFlag);

router.delete('/:id', featureFlagController.deleteFeatureFlag);


module.exports = router;