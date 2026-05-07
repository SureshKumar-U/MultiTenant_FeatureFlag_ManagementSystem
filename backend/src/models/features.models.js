const mongoose = require('mongoose');


const featureFlagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true },
    description: { type: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    isEnabled: { type: Boolean, default: false },
    
},{ timestamps: true });

featureFlagSchema.index({ organization: 1, name: 1 }, { unique: true });

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);

module.exports = FeatureFlag;