#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const s3diff = require('s3-diff');
const s3 = new AWS.S3({ region: 'us-east-1' });
const cloudfront = new AWS.CloudFront();

const {
  DEPLOY_BUCKET: bucket,
  CLOUDFRONT_DISTRIBUTION_ID: distro
} = process.env;

const localFolder = path.resolve(__dirname, '..', 'build');

s3diff({
  aws: {
    signatureVersion: 'v4'
  },
  local: localFolder,
  remote: {
    bucket
  },
  recursive: true
}, (err, data) => {

  if (err) {
    if (err.code === 'CredentialsError' || err.code === 'ExpiredToken') {
      console.error('Credentials not set, ensure proper credentials for the specified region');
      process.exit(1);
    } else {
      console.error('Error getting diff', err);
    }
  } else {
    remove(data)
      .then(() => update(data))
      .then(() => add(data))
      .then(() => doInvalidation())
      .then(() => {
        console.log('Finished uploading');
      });
  }
});

function remove(data) {
  return Promise.all(data.missing.map(file => new Promise(resolve => {
    console.log('removing: ', file);
    s3.deleteObject({
      Bucket: bucket,
      Key: file
    }, () => resolve());
  })));
}

function update(data) {
  return Promise.all(data.changed.map(file => new Promise(resolve => {
    console.log('updating: ', file);
    upload(file, resolve);
  })));
}

function add(data) {
  return Promise.all(data.extra.map(file => new Promise(resolve => {
    console.log('adding: ', file);
    upload(file, resolve);
  })));
}

function upload(file, cb) {
  const cache = 'public, max-age=31536000';

  s3.putObject({
    Bucket: bucket,
    Key: file,
    Body: fs.createReadStream(path.resolve(localFolder, file)),
    ContentType: mime.getType(file),
    CacheControl: cache,
    ACL: 'public-read'
  }, () => cb());
}

function doInvalidation() {
  const params = {
    DistributionId: distro,
    InvalidationBatch: {
      CallerReference: `INVALIDATION-${new Date().getTime()}`,
      Paths: {
        Quantity: 1,
        Items: [
          '/*'
        ]
      }
    }
  };

  cloudfront.createInvalidation(params, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      process.exit(1);
    } else {
      console.log(data);
    }
  });
}
