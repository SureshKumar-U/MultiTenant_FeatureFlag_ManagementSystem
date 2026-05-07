const authRoutes = require('./auth.routes');
const organizationRoutes = require('./organization.routes');
const featureFlagRoutes = require('./featureflags.routes');
const publicRoutes = require('./public.routes');

module.exports = {
    authRoutes,
    organizationRoutes,
    featureFlagRoutes,
    publicRoutes
};