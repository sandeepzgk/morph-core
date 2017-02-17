var aws = require('aws-sdk');
var config = require('../../serverConfig.json');

var lambda = new aws.Lambda({
    region: config.lambda.region
});


exports.generateEdf = function (userData, callback) {
    lambda.invoke({
        FunctionName: config.lambda.edf,
        InvocationType: 'Event',
        Payload: JSON.stringify(userData, null, 2) // pass params
    }, function (err, data) { });
    callback(null, "ok");
    return;
}