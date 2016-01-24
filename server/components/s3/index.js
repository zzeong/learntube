'use strict';

const knox = require('knox');

function S3() {
  this.client = knox.createClient({
    key: process.env.AWS_ACCESSKEY_ID,
    secret: process.env.AWS_SECRETKEY,
    bucket: process.env.AWS_S3_BUCKET
  });
}

S3.prototype.getFile = function (path) {
  return new Promise((resolve, reject) => {
    this.client.getFile(path, solvePending(resolve, reject));
  });
};

S3.prototype.putFile = function (filePath, uploadPath, headers) {
  return new Promise((resolve, reject) => {
    this.client.putFile(filePath, uploadPath, headers, solvePending(resolve, reject));
  });
};

S3.prototype.deleteFile = function (path) {
  return new Promise((resolve, reject) => {
    this.client.deleteFile(path, solvePending(resolve, reject));
  });
};

S3.prototype.deleteMultiple = function (paths) {
  return new Promise((resolve, reject) => {
    this.client.deleteMultiple(paths, solvePending(resolve, reject));
  });
};

module.exports = new S3();

function solvePending(resolve, reject) {
  return (err, res) => {
    if (err) { reject(err); }
    resolve(res);
  };
}


