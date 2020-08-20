const express = require('express');
const router = express.Router();

//controllers
const {requireTag, registerTag, list, photo} = require('../controllers/tag');
const {adminMiddleware} = require('../controllers/auth');
// validators
const {runValidation} = require('../validators');
const {
  requireTagValidator,
  registerTagValidator,
} = require('../validators/tag');

router.post('/requiretag', requireTagValidator, runValidation, requireTag);
router.post('/registertag', registerTagValidator, registerTag);

router.get('/tag/list', list);
router.get('/tag/photo/:id', photo);

module.exports = router;
