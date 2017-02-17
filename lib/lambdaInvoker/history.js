var aws = require('aws-sdk');
var config = require('../../serverConfig.json');

var lambda = new aws.Lambda({
    region: config.lambda.region
});


exports.fetchHistory = function (userData, callback) {
    lambda.invoke({
        FunctionName: config.lambda.history,
        Payload: JSON.stringify(userData, null, 2) // pass params
    }, function (err, data) {
        if (err) {
            callback(err, null);
            return;
        } else {
            if (data.Payload) {
                var t1 = data;
                callback(null, JSON.parse(t1.Payload));
                return;
            }
            else {
                callback("Empty data", null);
                return;
            }
        }
    });
}