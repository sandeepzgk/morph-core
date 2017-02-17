var jwt = require('jwt-simple');
var config = require('../../serverConfig.json');

exports.genToken = function genToken(email, callBack) {
	var expire = expiresInDays(45);
	var token = jwt.encode({
		exp: expire,
		email: email
	}, config.jwt.secret, config.jwt.algorithm);
	callBack(token, expire);
	return;
}

function expiresInDays(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}