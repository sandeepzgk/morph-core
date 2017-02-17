var jwt = require('jwt-simple');
var config = require('../../serverConfig.json');

exports.genToken = function genToken(email,type, callback) {
	var expire = expiresInDays(config.jwt.days);
	var token = jwt.encode({
		exp: expire,
		type: type,
		signature:config.jwt.signature,
		email: email
	}, config.jwt.secret, config.jwt.algorithm);
	callback(token, expire);
	return;
}

function expiresInDays(numDays) {
	return new Date().getTime() + numDays*24*60*60*1000;
	
}


exports.validateToken = function validate(token,callback) {
	var decoded = jwt.decode(token, config.jwt.secret);
	if(decoded.signature === config.jwt.signature)
	{
		callback(null,decoded);
	}
	else
	{
		callback("error", null);
	}
}