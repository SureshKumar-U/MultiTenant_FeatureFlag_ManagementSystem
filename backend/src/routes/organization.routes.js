const express = require('express');
const router = express.Router();
const OrgController = require('../controllers/organisation.controller');

//super admin only

// router.get('/', OrgController.findAllOrganisations);

router.post('/',OrgController.createOrganisation);

router.get('/:id',OrgController.findOrganisationById);

module.exports = router;   