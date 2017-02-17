var AWS = require("aws-sdk");
var bcrypt = require('bcrypt');
var config = require('../../serverConfig.json');
var tableName = config.dynamo.userTable;


function hashPassword(data, callback)
{

	bcrypt.hash(data.password, 10, function(err, hash)
	{
		if (err)
		{
			callback(err, null);
			return;
		}
		// override the cleartext password with the hashed one
		data.password = hash;
		callback(null, 'ok');
		return;
	});
    
}


exports.addUser = function(data, callback)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {TableName:tableName,Item:data};
	hashPassword(data, function(err, data)
    {
        if (!err)
        {
            docClient.put(params, function(err, data)
            {
                if (err)
                {
                    callback(err, null);
                    return;
                }
                else
                {
                    callback(null, 'ok');
                    return;
                }
            });
        }
        else
        {
            callback(err, null);
            return;
        }
    });
}



exports.updateDeviceListofUser = function(deviceEmail, userEmail , callback)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
	
    var params={TableName:tableName,Key:{email:userEmail},UpdateExpression:"set myuser.device_list = list_append (myuser.device_list, :deviceEmail)",ExpressionAttributeValues:{":deviceEmail":[deviceEmail]},ReturnValues:"UPDATED_NEW"};
	
	
    docClient.update(params, function(err, data)
    {
        if (err)
        {
			console.log("update error")
			console.log(err)
            callback(err, null);
            return;
        }
        else
        {
			console.log("update worked")
            callback(null, 'ok');
            return;
        }
    });
}


exports.login = function(userdata, callback)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params={TableName:tableName,Key:{email:userdata.email}};
    docClient.get(params, function(err, data)
    {
        if (err)
        {
            callback(err, null);
            return;
        }
        else
        {
            if (!data.hasOwnProperty("Item"))
            {
                callback(true, null);
                return;
            }
            else
            {
                bcrypt.compare(userdata.password, data.Item.password, function(err, res)
                {
                    if ((!err) && (res == true))
                    {
                        delete data.Item.password;
                        callback(null, data);
                        return;
                    }
                    else
                    {
                        callback(true, null);
                        return;
                    }
                });
            }
        }
    });
}


exports.listUsers = function(data, callback)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params={TableName:tableName,FilterExpression:"hospital_id = :val1 and user_type = :val2",ExpressionAttributeValues:{":val1":data.hospital_id,":val2":1},ReturnConsumedCapacity:"TOTAL"};
    docClient.scan(params, function(err, data)
    {
        if (!err)
        {
            if (data.hasOwnProperty("Count"))
            {
                if (data.Count == 0)
                {
                    callback(true, null);
                    return;
                }
            }
            if (data.hasOwnProperty("ConsumedCapacity"))
            {
                delete data.ConsumedCapacity;
            }
            for (var i = 0; i < data['Items'].length; i++)
            {
                delete data['Items'][i].password;
            }
            callback(null, data);
            return;
        }
        else
        {
            callback(err, null);
            return;
        }
    });
}


exports.listDevicesByUser = function(data, callback)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params={TableName:tableName,FilterExpression:"hospital_id = :val1 and user_type = :val2",ExpressionAttributeValues:{":val1":data.hospital_id,":val2":1},ReturnConsumedCapacity:"TOTAL"};
    docClient.scan(params, function(err, data)
    {
        if (!err)
        {
            if (data.hasOwnProperty("Count"))
            {
                if (data.Count == 0)
                {
                    callback(true, null);
                    return;
                }
            }
            if (data.hasOwnProperty("ConsumedCapacity"))
            {
                delete data.ConsumedCapacity;
            }
            for (var i = 0; i < data['Items'].length; i++)
            {
                delete data['Items'][i].password;
            }
            callback(null, data);
            return;
        }
        else
        {
            callback(err, null);
            return;
        }
    });
}


exports.validateUserId = function(email, callback)
{
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {TableName: tableName, Key: {"email": email}};
    docClient.get(params, function(err, data)
    {
        if (err)
        {
            callback(err, null);
            return;
        }
        else
        {
            if (!data.hasOwnProperty("Item"))
            {
                callback(true, null);
                return;
            }
            else
            {
                callback(null, "ok");
                return;
            }
        }
    });
}