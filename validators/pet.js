const {check} = require('express-validator');

exports.createTagValidator = [
  check('id').not().isEmpty().withMessage('id is required'),
  check('pin').isEmail().withMessage('Pin is required'),
  check('name').not().isEmpty().withMessage('Name is required'),
  check('breed ').not().isEmpty().withMessage('Breed is required'),
];
