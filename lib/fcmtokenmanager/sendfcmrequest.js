
var querystring = require('querystring');
var http = require('https');
var fs = require('fs');

function PostCode(codestring,message) {
  // Build the post string from an object
  var post_data = JSON.stringify({
   	"data":{
        "message": message,
        "time":(new Date).getTime()
        },
        "to" : codestring
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'fcm.googleapis.com',
      path: '/fcm/send',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
	        'Authorization': 'key=AIzaSyAaisHuUoctZZz3CZTAuFrnj0BXPgC1Zdk'
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res,error) {
	if(error){
	console.log(error);
	}
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}


exports.sendFCMToPatitents = function(data,message,callback){
 

 console.log(data);
  // Make sure there's data before we post it
  if(data) {
    PostCode(data,message);
    callback(null,"Success");
  }
  //if data is empty do nothing. fail gracefully not exit unexpectedly.
  //else {
  //  callback(null,"Error");
  //  console.log("No data to post");
  //  process.exit(-1);
  //}


}


