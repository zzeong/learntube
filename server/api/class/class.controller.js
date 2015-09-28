'use strict';

var Rating = require('../rating/rating.model.js');

exports.getTops = function (req, res) {
  if (!req.query.num) { return res.status(500).send('No required params'); }

  Rating.find({})
  .sort({ points: 'desc' })
  .limit(req.query.num)
  .exec(function (err, ratings) {
    if (err) { return res.status(500).send(err); }
    return res.status(200).json(ratings);
  });
};
