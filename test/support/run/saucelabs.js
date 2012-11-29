#!/usr/bin/env node

/*
Goes from a fresh clone of this repo to running the Montage tests on
Saucelabs. Depends on the following environment variables:

These are provided by Jenkins and the Saucelabs plugin:
$SELENIUM_HOST
$SELENIUM_POST
$SAUCE_USER_NAME
$SAUCE_USER_KEY
$BUILD_TAG

These should be set in Jenkins, usually in a Configuration Matrix
$browser
$platform

Writes the reports to report/
*/

var spawn = require('child_process').spawn;
var path = require('path');

// Install test npm dependencies
var npmInstall = spawn("npm", ["install"], {
    cwd: __dirname,
    stdio: "inherit"
});

npmInstall.on('exit', function (code) {
    if (code !== 0) {
        process.exit(code);
    }
    // On successful exit of NPM start running the tests

    // Dependencies are only available after we've run npm install
    var connect = require("connect");
    var tests = require("./run-tests-remote");

    // Big enough range that collisions with existing test servers are
    // unlikely
    var httpServerPort = Math.floor(Math.random() * 65000 - 2000) + 2000;
    // Caching is ok because Saucelabs start a new VM with an empty cache for
    // each test run, and no Montage files change during the test run.
    var oneDay = 24*60*60*1000;
    // FIXME: this is a bit fragile
    var montageRoot = path.resolve(__dirname, "..", "..", "..");
    var server = connect()
      .use(connect.static(montageRoot, { maxAge: oneDay }))
      .listen(httpServerPort);

    var log = function() {
        console.log.apply(console, arguments);
    };

    var testUrl = "http://localhost:" + httpServerPort + "/test/run-xml.html";

    console.log("Hosting tests on " + testUrl);
    tests.run(testUrl, {
        browser: process.env["browser"],
        platform: process.env["platform"],
        host: process.env["SELENIUM_HOST"],
        port: process.env["SELENIUM_PORT"],
        sauceUser: process.env["SAUCE_USER_NAME"],
        sauceKey: process.env["SAUCE_API_KEY"],
        name: process.env["BUILD_TAG"]
    }, log).then(function(reports) {
        tests.writeReports(reports, "report", log);
    }).fin(function() {
        server.close();
    }).fail(function(err) {
        console.error(err);
        process.exit(1);
    });
});
