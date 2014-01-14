var request = require('request');
var _ = require('lodash');

var database = require('../../../lib/database');
var Build = require('../../../lib/builds/').build;
var jobCruder = database('jobs', require('../../../lib/jobs/job-cruder'));
var Jobs = require('../../../lib/jobs/jobs')(jobCruder);

describe('builds app', function () {

  var uri, build, build2;
  before(function (done) {
    Jobs.create({ name: "job without build", config: "/fake.js"}, function (err, job) {
      build = new Build({ status: "success" });
      build2 = new Build({ status: "failure" });
      uri = 'http://localhost:3000/jobs/' + job.get('_id') + '/builds';

      Jobs.addBuild(job.get('_id'), build, function () {
        Jobs.addBuild(job.get('_id'), build2, function () {
          done();
        });
      });
    });
  });

  it('should return status code 200', function (done) {
    request.get(uri, function (error, res) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('should return builds for the given job', function (done) {
    request.get(uri, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        var builds = JSON.parse(body);
        _.first(builds).status.should.equal('success');
        _.last(builds).status.should.equal('failure');

        done();
      }
    });
  });

});