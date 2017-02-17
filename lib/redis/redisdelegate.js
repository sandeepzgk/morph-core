var redis = require("redis");
var fs = require('fs');
var config = require('../../serverConfig.json');


var client;

function connectRedisClient() {
    client = redis.createClient(config.redis.port, config.redis.endpoint, { no_ready_check: true });
}



exports.checkOnlineStatus = function(data, callback) {
    //console.log("started")
    connectRedisClient();
    var statusString = "";
    var iterated = 0;
    for (var i in data.Items) {
        client.sadd("active:" + data.Items[i].patient.doctor_email, data.Items[i].email);
        client.exists(["online:" + data.Items[i].email], function(err, res) {
            if (!err) {
                if (res) {
                    statusString = statusString + "1";
                    data.Items[iterated].patient.online = "online";
                } else {
                    statusString += "0";
                    data.Items[iterated].patient.online = "offline";
                }

            }

            if (++iterated == (data.Items.length)) {
                client.set("status:" + data.Items[i].patient.doctor_email, statusString);
                client.expire("status:" + data.Items[i].patient.doctor_email, 30 * 60)
                client.expire("active:" + data.Items[i].patient.doctor_email, 30 * 60);
                client.quit();
                callback(null, data);
            }
        })

    }

}
