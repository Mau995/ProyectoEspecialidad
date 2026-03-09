const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const requirePrivilegedRole = require('../middleware/requirePrivilegedRole');

router.use(requirePrivilegedRole);
router.get('/', rolController.list);

module.exports = router;
