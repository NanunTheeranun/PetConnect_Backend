const Tag = require('../models/tag');
const shortId = require('shortid');
const User = require('../models/user');
const sgMail = require('@sendgrid/mail'); //SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.requireTag = (req, res) => {
  let id = shortId.generate();
  let pin = shortId.generate();
  const {
    name,
    email,
    houseNumber,
    village,
    road,
    alley,
    district,
    zone,
    province,
    postalCode,
  } = req.body;

  let tag = new Tag({
    name,
    email,
    houseNumber,
    village,
    road,
    alley,
    district,
    zone,
    province,
    postalCode,
    id,
    pin,
  });

  tag.save((err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      message: `Require tag success! 
                We send ID and PIN to ${email} and waiting for shipping please.`,
    });
  });

  const emailData = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Contact form - ${process.env.APP_NAME}`,
    html: `
            <h4>ID and PIN for you register pet to Petconnect</h4>
            <p>ID Tag: ${id}</p>
            <p>Pin Tag: ${pin}</p>
            <hr />
            <p>This email may contain sensitive information</p>
            <h3>These ID and pin for your register pet to pet-connect and tag will be shipping as soon as.</h3>
            <p>https://petconnect.com</p>
        `,
  };

  sgMail.send(emailData).then((sent) => {
    return res.json({
      success: true,
    });
  });
};
exports.registerTag = (req, res) => {
  const {email, id_tag, pin} = req.body;
  Tag.findOne({id_tag}).exec((err, tag) => {
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
    var _tag = {id_tag: req.body.id_tag, pin: req.body.pin};
    User.findOneAndUpdate({email}, {$push: {tags: _tag}}, function (
      err,
      success,
    ) {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: 'Register tag success!',
      });
    });
  });
};

exports.photo = (req, res) => {
  const id = req.params.id;
  Tag.findOne({id})
    .select('photo')
    .exec((err, tag) => {
      if (err || !tag) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.set('Content-Type', tag.photo.contentType);
      return res.send(tag.photo.data);
    });
};

exports.list = (req, res) => {
  Tag.find()
    .select('id name email address')
    .exec((err, tags) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(tags);
    });
};
