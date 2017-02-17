var redis = require("redis");
var jwt = require('jwt-simple');
var config = require('../../serverConfig.json');

var client;

function connectRedisClient() {
    client = redis.createClient(config.redis.port, config.redis.endpoint, { no_ready_check: true });
}

exports.createSessionToken = function (userData, callback) {
    //console.log("connect redis started");
    connectRedisClient();
    console.log(userData.Item.email);
    console.log(userData.sessionToken);

    client.set(config.sessionToken.sessionStartName+userData.sessionToken, userData.Item.email, redis.print);
    //Expire in  11 days
    client.expire(config.sessionToken.sessionStartName+userData.sessionToken, 950400);//86400
    //client.set("some key", "some val");
    //client.set('string key', 'Hello World', redis.print);
    //client.expire('string key', 3);
    //console.log("set worked");
    client.quit();
    callback(null, 'ok');
    return;
}

exports.validateSessionToken = function (userData, callback) {

    if ((userData.sessionToken == config.sessionToken.defaultToken) && (userData.Env == config.Env)) {
        console.log("default session validation success");
        callback(null, 'ok');
        return;
    }
    connectRedisClient();
    if (!userData.hasOwnProperty("sessionToken")) {
        client.quit();
        callback(true, null);
        return;
    } else {
        client.get(config.sessionToken.sessionStartName+userData.sessionToken, function (err, reply) {
            if (reply == null) {
                console.log("empty redis value with session key provided");
                client.quit();
                callback(err, null);
                return;
            }
            else {
                var decodedToken = jwt.decode(userData.sessionToken, config.jwt.secret, config.jwt.algorithm);
                if (decodedToken.email == reply) {
                    console.log("session token validation success");
                    console.log("decodedToken.email=" + decodedToken.email);
                    console.log("redis email=" + reply);
                    client.quit();
                    callback(null, 'ok');
                    return;
                } else {
                    console.log("validation error");
                    client.quit();
                    callback(err, null);
                    return;
                }
            }
        });
    }

}

exports.clearSessionToken = function (userData, callback) {
    connectRedisClient();
    client.del(config.sessionToken.sessionStartName+userData.sessionToken);
    client.quit();
    callback(null, 'ok');
    return;
}




