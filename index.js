var datamanager = require("./lib/dao/datamanager.js");
var jwtToken = require("./lib/token/tokenmanager.js");
exports.handler = (apievent, context, cb) =>
{
	var ev = JSON.parse(apievent.body);
    const operation = ev.operation;
    switch (operation)
    {
        case "version":
            version();
            break;
        case "addUser":
            addUser(ev);
            break;
        case "addDevice":
            addDevice(ev);
            break;
        case "login":
            login(ev);
            break;
        case "listUsers":
            listUsers(ev);
            break;
        case "listDevicesByUser":
            listDevicesByUser(ev);
            break;
        case "logout":
            logout(ev);
            break;
		case "agAZsrU3createAdmineZBEyHHGrSdUdv4M":
			createAdmin(ev);
			break;
		case "addUpdateQuestionJSON":
			addUpdateQuestionJSON(ev);
			break;
		case "addFeedback":
			addFeedback(ev);
			break;
		case "fetchFeedback":
			fetchFeedback(ev);
			break;
        default:
            callback("Unrecognized operation:" + operation,null);
            break;
    }
	
	function callback(error,data)
	{
		var response; 
		if(error === null)
			response = {body:JSON.stringify(data)};
		else
			response = {body:JSON.stringify(error)};
		
		cb(null,response);
	}
	
	//version info
    function version()
    {
        var verstring = "1.0.3";
        callback(null, {"message":verstring});
        return;
    }
	
	//login method
    function login(data)
    {
        datamanager.login(data, function(err, data)
        {
            if (!err)
            {
                jwtToken.genToken(data.Item.email, data.Item.user_type, function(token, expire)
                {
                    data.sessionToken = token;
                    data.expire = expire;
                    callback(null, data);                   
                });
            }
            else
            {
                callback({"message":"Invalid Username or Password"}, null);
                return;
            }
        });
    }
	
	function createAdmin(data)
	{
		var admin = 
		{
			user_type: 2, // user_type0:DEVICE , user_type1:USER , user_type2:ADMIN
			email: "admin@makemorph.com",
			password: "S3XMCqxU",
			meta: 
			{
				name: "Admin 101",
				age: 123,
				mobile: 123,
				company: "Morph"
			}
		};
		
		
		datamanager.addUser(admin, function(err, data)
		{
			if (!err && data == "ok")
			{
				callback(null, {"message":"Admin Addition Success"});
				return;
			}
			else
			{
				callback({"message":"Admin Addition Failed"}, JSON.stringify(err, null, 2));
				return;
			}
		});
		
		
	}
	
	
	
	//add user
    function addUser(data)
    {
        jwtToken.validateToken(data.token, function(err, validate)
        {

            if (!err && validate.type===2) //only admins can add users
            {
                datamanager.validateUserId(data.email, function(err, reply)
                {
                    if (!err && reply == "ok")
                    {
                        callback({"message":"User Exists"}, null);
                        return;
                    }
                    else
                    {
						//everything other than operation and token are saved to the database
						delete data.operation;
						delete data.token;
						data.user_type = 1; // forcing user type as 1 because its a simple USER
						data.devices= {"device_list":[]}; //initializing with an empty list
                        datamanager.addUser(data, function(err, reply)
                        {
                            if (!err && reply == "ok")
                            {
                                callback(null, {"message":"User Addition Success"});
                                return;
                            }
                            else
                            {
                                callback({"message":"User Addition Failed"}, JSON.stringify(err, null, 2));
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
    }
	
	//add device
	function addDevice(data)
    {
        jwtToken.validateToken(data.token, function(err, validate)
        {

            if (!err && validate.type===2) //only admins can add users
            {
                datamanager.validateUserId(data.email, function(err, reply)
                {
                    if (!err && reply == "ok")
                    {
                        callback({"message":"Device Exists"}, null);
                        return;
                    }
                    else
                    {
						//everything other than operation and token are saved to the database
						delete data.operation;
						delete data.token;
						data.user_type = 0; // forcing user type as 0 because its a simple DEVICE
                        datamanager.addUser(data, function(err, reply)
                        {
                            if (!err && reply == "ok")
                            {
                                datamanager.updateDeviceListofUser(data.email, data.device_details.owner_email
                                    , function(err, data)
                                    {
                                        if (err)
                                        {
                                            callback(err, {"message":null});
                                            return;
                                        }
                                        else
                                        {
                                            callback(null, {"message":"Device Registration Success"});
                                            return;
                                        }
                                    });
                            }
                            else
                            {
                                callback({"message":"Device Registration Failed"}, JSON.stringify(err, null, 2));
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
    }
	
	
 
	
	//list users
    function listUsers(data)
    {
        jwtToken.validateToken(data.token, function(err, validate)
        {
            if (!err &&  validate.type>0) //everyone other than users can be authorized to view the user list
            {
                datamanager.listUsers(data, function(err, data)
                {
                    if (!err)
                    {
                        callback(null, data);
                        return;
                    }
                    else
                    {
                        callback({"message":"Empty User List"});
                        return;
                    }
                });
            }
            else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
    }
	
	//list devices by user
    function listDevicesByUser(data)
    {
        jwtToken.validateToken(data.token, function(err, validate)
        {
            if (!err && validate.type>0) //everyone other than users can be authorized to view the user list
            {
                datamanager.listDevicesByUser(data, function(err, data)
                {
                    if (!err)
                    {
                        callback(null, data);
                        return;
                    }
                    else
                    {
                        callback({"message":"Empty Device List"});
                        return;
                    }
                });
            }
            else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
    }
	
	//add or update question list
	function addUpdateQuestionJSON(data)
	{
		jwtToken.validateToken(data.token, function(err, validate)
        {
            if (!err && validate.type>0) //everyone other than users can be authorized to view the user list
            {
				datamanager.addUpdateQuestionJSON(data.deviceid,data.questionJSON, function(err, data)
                {
                    if (!err)
                    {
                        callback(null, {"message":"Question Add/Update Success"});
                        return;
                    }
                    else
                    {
                        callback({"message":"Question Add/Update Failed"});
                        return;
                    }
                });
			}
			 else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
	}
	
	//add feedback, each will be recorded on the server with a timestamp
	function addFeedback(data)
	{
		jwtToken.validateToken(data.token, function(err, validate)
        {
			console.log("validate:"+JSON.stringify(validate))
            if (!err && validate.type===0) //no one other than Devices are supposed to return feedback
            {
				datamanager.addFeedback(validate.email,data.feedback, function(err, data)
                {
                    if (!err)
                    {
                        callback(null, {"message":"Feedback Record Success"});
                        return;
                    }
                    else
                    {
                        callback({"message":"Feedback Record Failed"});
                        return;
                    }
                });
			}
			 else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
		
	}
	
	
	
	//fetch all feedback for a given device
	function fetchFeedback(data)
	{
		jwtToken.validateToken(data.token, function(err, validate)
        {
			console.log("validate:"+JSON.stringify(validate))
            if (!err && validate.type>0) //devices themselves cannot pull in the feedback
            {
				datamanager.fetchFeedback(data.deviceid,data.start,data.end, function(err, data)
                {
                    if (!err)
                    {
                        callback(null, data);
                        return;
                    }
                    else
                    {
                        callback({"message":"Feedback Fetch Failed"});
                        return;
                    }
                });
			}
			 else
            {
                callback({"message":"Invalid Session Token"});
                return;
            }
        });
		
	}
	
 
};