var JobsModule = require('../../../lib/jobs');
var cruder = require('../../../lib/jobs/job-cruder');
cruder = require('../../../lib/database')('jobs', cruder);
var Jobs = JobsModule.Jobs(cruder);
var Build = require('../../../lib/builds/').build;
var Builds = require('../../../lib/builds/builds');
describe("Job build", function () {
  var createdJob;
  var createdJobId;
  beforeEach(function (done) {
    Jobs.create({name: "job without build", config: "/fake.js"}, function (err, job) {
      createdJob = job;
      createdJobId = job.get('_id');
      done();
    });
  });

  it("should get tasks of one build", function () {
    createdJob.get('builds').should.eql([]);
  });

  it("should add task to build", function (done) {
    var build = new Build({test: "fake"});
    Builds.create(createdJobId, build)
          .then(function() {
            Jobs.id(createdJobId, function (err, data) {
              var builds = data.get('builds');
              builds.length.should.be.eql(1);
              builds[0].test.should.eql('fake');
              done();
            });
          });
  });

  it("should add two tasks to build", function (done) {
    var build = new Build({test: "fake"});
    var build2 = new Build({test: "fake2"});
    Builds.create(createdJobId, build)
          .then(function() {
            return Builds.create(createdJobId, build2);
          })
          .then(function() {
            Jobs.id(createdJobId, function (err, data) {
              var builds = data.get('builds');
              builds.length.should.be.eql(2);
              builds[0].test.should.eql('fake');
              builds[1].test.should.eql('fake2');
              done();
            });
          });
  });

  it("should get builds", function (done) {
    var build = new Build({test: "fake"});
    Builds.create(createdJobId, build)
          .then(function() {
            return Builds.all(createdJobId);
          })
          .then(function (builds) {
            var build = builds[0];
            build.should.be.instanceOf(Build);
            build.get('test').should.eql('fake');
            done();
          })
          .catch(function(e) {
            throw e;
          });
  });

  
});
