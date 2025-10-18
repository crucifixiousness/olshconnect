const express = require('express');
const initialAdminRoutes = require('./initial-admin-creation');

const router = express.Router();

// Mount initial admin creation routes
router.use('/initial-admin', initialAdminRoutes);

module.exports = router;
