const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({

    name: { type: String, required: true },
    description: { type: String },
    
}, { timestamps: true }); 

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
