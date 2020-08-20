const Pet = require('../models/pet');
const Tag = require('../models/tag');
var ObjectId = require('mongoose').Types.ObjectId;
const formidable = require('formidable');
const _ = require('lodash');
const {errorHandler} = require('../helpers/dbErrorHandler');
const fs = require('fs');
const sgMail = require('@sendgrid/mail'); //SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not upload',
      });
    }

    const {id, pin, categories, name, breed, gender} = fields;

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: 'At least one category is required',
      });
    }

    let pet = new Pet();
    pet.id = id;
    pet.pin = pin;
    pet.name = name;
    pet.breed = breed;
    pet.gender = gender;
    pet.postedBy = req.user._id;

    // categories and tags
    let arrayOfCategories = categories && categories.split(',');

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: 'Image should be less then 1mb in size',
        });
      }
      pet.photo.data = fs.readFileSync(files.photo.path);
      pet.photo.contentType = files.photo.type;
    }
    Tag.findOne({id}).exec((err, tag) => {
      if (err || !tag) {
        return res.status(400).json({
          error: 'Tag with that email does not exist.',
        });
      }
      //authenticate
      if (!tag.authenticateIdTag(pin)) {
        return res.status(400).json({
          error: 'ID tag and pin do not match.',
        });
      }
      // if(Pet.findOne({ 'id': id })){
      //     return res.status(400).json({
      //         error: 'ID tag id taken.'
      //     });
      // }
      else {
        pet.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err),
            });
          }
          Pet.findByIdAndUpdate(
            result._id,
            {$push: {categories: arrayOfCategories}},
            {new: true},
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            } else {
              res.json(result);
            }
          });
        });
      }
    });
  });
};

exports.list = (req, res) => {
  const user = req.params.user;
  let pets;
  Pet.find({postedBy: new ObjectId(user)})
    .populate('categories', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id id name categories postedBy createdAt updatedAt lost')
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      pets = data; //pets
      res.json({pets});
    });
};

//add send email
exports.read = (req, res) => {
  const id = req.params.id;
  let user;
  Pet.findOne({id})
    .populate('categories', '_id name slug')
    .populate('postedBy', '_id name email phone')
    .select(
      '_id id name gender categories postedBy createdAt updatedAt role profile breed age blood weight',
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      user = data;
      res.json(data);
      // const emailData = {
      //   to: user.postedBy.email,
      //   from: process.env.EMAIL_FROM,
      //   subject: `Contact form - ${process.env.APP_NAME}`,
      //   html: `
      //               <h4>Your animal was found.</h4>
      //               <p>https://petconnect.com</p>
      //           `,
      // };
      // sgMail.send(emailData).then((sent) => {
      //   return res.json({
      //     success: true,
      //   });
      // });
    });
};

exports.profile = (req, res) => {
  const id = req.params.id;
  let user;
  Pet.findOne({id})
    // .select("-photo")
    .populate('categories', '_id name slug')
    .populate('postedBy', '_id name email phone')
    .select(
      '_id id name categories postedBy createdAt updatedAt role profile breed age blood weight gender',
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      user = data;
      res.json(data);
    });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  Pet.findOneAndRemove({id}).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: 'Pet deleted successfully',
    });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;

  Pet.findOne({id}).exec((err, oldPet) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: 'Image could not upload',
        });
      }

      let slugBeforeMerge = oldPet.id;
      oldPet = _.merge(oldPet, fields);
      oldPet.slug = slugBeforeMerge;

      const {name, categories} = fields;

      if (categories) {
        oldPet.categories = categories.split(',');
      }

      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: 'Image should be less then 1mb in size',
          });
        }
        oldPet.photo.data = fs.readFileSync(files.photo.path);
        oldPet.photo.contentType = files.photo.type;
      }

      oldPet.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        // result.photo = undefined;
        res.json(result);
      });
    });
  });
};

exports.photo = (req, res) => {
  const id = req.params.id;
  Pet.findOne({id})
    .select('photo')
    .exec((err, pet) => {
      if (err || !pet) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.set('Content-Type', pet.photo.contentType);
      return res.send(pet.photo.data);
    });
};

exports.lost = (req, res) => {
  const id = req.params.id;
  Pet.findOne({id}).exec((err, pet) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    pet.lost = 'Lost';
    pet.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(pet);
    });
  });
};
exports.find = (req, res) => {
  const id = req.params.id;
  Pet.findOne({id}).exec((err, pet) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    pet.lost = 'Found';
    pet.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(pet);
    });
  });
};
exports.listLostPets = (req, res) => {
  Pet.find({lost: 'Lost'})
    .populate('categories', '_id name slug')
    .populate('postedBy', '_id name email phone')
    .select(
      '_id id name categories postedBy createdAt updatedAt role profile breed age blood weight lost gender',
    )
    .exec((err, pet) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(pet);
    });
};

exports.getMap = (req, res) => {
  let {email, map} = req.body;
  const emailData = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Contact form - ${process.env.APP_NAME}`,
    html: `
                    <h4>Your animal was found.</h4>
                    <p>Location is found your pet (click link url)${map}</p>
                `,
  };
  sgMail.send(emailData).then((sent) => {
    return res.json({
      success: true,
    });
  });
};
