const mongoose = require('mongoose');   
const bcrypt = require('bcrypt');
const ApiError = require('../config/error.config');
const userSchema = new mongoose.Schema({


    username: { type: String, required: true, unique: true },   
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdAt: { type: Date, default: Date.now }
}); 

userSchema.methods.comparePassword = async function(candidatePassword) {
    const user = this;
    const match = await bcrypt.compare(candidatePassword, user.password);
    return match;
}
    
userSchema.pre('save', async function() {
    const user = this;
    if (!user.isModified('password')) return ;    
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
       
    } catch (err) { 
        throw new ApiError('Error hashing password', 500);
    }
}); 


const User = mongoose.model('User', userSchema);

module.exports = User;