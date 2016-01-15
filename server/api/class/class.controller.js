'use strict';

var Class = require('../../models/class.model');

exports.getTops = (req, res, next) => {
  if (!req.query.num) { return res.status(500).send('No required params'); }
  let num = +req.query.num;

  Class.find({})
  .sort({ views: 'desc' })
  .limit(num)
  .exec()
  .then((classes) => res.status(200).json(classes))
  .catch(next);
};
