const express = require('express');
const router = express.Router();
const {
  create,
  list,
  remove,
  update,
  read,
  photo,
  lost,
  find,
  listLostPets,
  profile,
  getMap,
} = require('../controllers/pet');

const {requireSignin, authMiddleware} = require('../controllers/auth');

router.post('/pets', requireSignin, authMiddleware, create);
router.get('/pets/:user', list);
router.get('/pets/lost/list', listLostPets);

router.get('/pets/qrcode/:id', read);
router.get('/pets/profile/:id', profile);
router.get('/pets/lost/:id', requireSignin, authMiddleware, lost);
router.get('/pets/find/:id', requireSignin, authMiddleware, find);

router.delete('/pets/remove/:id', requireSignin, authMiddleware, remove);
router.put('/pets/update/:id', requireSignin, authMiddleware, update);
router.get('/pets/photo/:id', photo);

router.post('/pet/map', getMap);

module.exports = router;
