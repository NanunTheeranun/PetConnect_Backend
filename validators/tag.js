const {check} = require('express-validator');

exports.requireTagValidator = [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('houseNumber').not().isEmpty().withMessage('House number is required'),
  check('district').not().isEmpty().withMessage('district is required'),
  check('zone').not().isEmpty().withMessage('zone is required'),
  check('province').not().isEmpty().withMessage('province is required'),
  check('postalCode').not().isEmpty().withMessage('postal Code is required'),
];

exports.registerTagValidator = [
  check('email').not().isEmail().withMessage('Must be a valid email address'),
  check('id').not().isEmpty().withMessage('id is required'),
  check('pin').not().isEmpty().withMessage('pin is required'),
  check('name').not().isEmpty().withMessage('name is required'),
  check('breed').not().isEmpty().withMessage('breed is required'),
];
