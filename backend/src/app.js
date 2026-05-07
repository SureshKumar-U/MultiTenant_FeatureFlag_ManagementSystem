const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const {featureFlagRoutes, authRoutes,organizationRoutes,publicRoutes} = require("./routes/index.route")
const globalErrorMiddleware = require('./middlewares/globalErrorMiddleware');
const { authenticate, requireRole } = require('./middlewares/auth.middleware');
const ApiError = require('./config/error.config');
app.use(express.json());
app.use(morgan('dev'));
app.use(cors())
app.get('/health', (req, res) => res.status(200).json({ ok: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organisations', organizationRoutes);
app.use('/api/v1/feature-flags',  authenticate, requireRole('admin'), featureFlagRoutes);
app.use('/api/v1/public',   publicRoutes);
app.all("/", (req, res) => {
    res.status(404).json({ error: 'Not Found' });
}); 
// not found middleware
app.use((req, res, next) => {
    const path = req.originalUrl;
    next(new ApiError( `Invalid endpoint ${path}`,404));
});
app.use(globalErrorMiddleware);
module.exports = app;