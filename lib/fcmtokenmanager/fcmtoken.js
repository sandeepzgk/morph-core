var redis = require("redis");
var jwt = require('jwt-simple');
var config = require('../../serverConfig.json');

var client;

function connectRedisClient() {
    client = redis.createClient(config.redis.port, config.redis.endpoint, { no_ready_check: true });
}


exports.setFcmToken = function(userdata,callback){
	connectRedisClient();
	client.set(config.FCMToken.user+userdata.email, userdata.FCMToken, redis.print);
	client.expire(config.FCMToken.user+userdata.email,950400);
	client.quit();
    callback(null, 'ok');
    return;

}

exports.getFcmToken = function(userdata,callback){
	
connectRedisClient();

 client.get(config.FCMToken.user+userdata.email, function (err, reply){
                if (reply != null & !err) {
                	client.quit();
                	console.log(reply);
                	callback(null,"ok");
                	return;
                } else {
                	client.quit();
                	console.log("Error");
                	callback(err,null);
                	return;
                }
 });
}

exports.getFcmTokenList = function(userdata, callback)
{
   
    connectRedisClient();

    var array = [];
    var i,c = 0;
    if(userdata.length == 0 )
    {
        client.quit();
        callback("Error", null);
        return;
    }
    for (i = 0; i < userdata.length; i++)
    {

        client.get(config.FCMToken.user + userdata[i], function(err, reply)
        {
            array[c] = null;
            if (reply != null & !err)
            {
              
                console.log(reply);
                array[c] = reply;
            }
           
            c++;
            if(c == userdata.length){
                client.quit();
                console.log("Array replied");
                callback(null,array);
                return;
            }
            return;
        });
        
    }
	//client.quit();
}