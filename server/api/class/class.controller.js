'use strict';

var Class = require('../../models/class.model');

exports.getTops = (req, res, next) => {
  if (!req.query.num) { return res.status(500).send('No required params'); }

  Class.find({})
  .sort({ views: 'desc' })
  .limit(req.query.num)
  .exec()
  .then((classes) => res.status(200).json(classes))
  .catch(next);
};
