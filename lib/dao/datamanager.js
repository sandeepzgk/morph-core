var AWS = require("aws-sdk");
var bcrypt = require('bcrypt');
var config = require('../../serverConfig.json');
var tableName = config.dynamo.userTable;
var dataTableName = config.dynamo.dataTable;


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
	
    var params={TableName:tableName,Key:{email:userEmail},UpdateExpression:"set devices.device_list = list_append (devices.device_list, :deviceEmail)",ExpressionAttributeValues:{":deviceEmail":[deviceEmail]},ReturnValues:"UPDATED_NEW"};
	
	
    docClient.update(params, function(err, data)
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

exports.addUpdateQuestionJSON = function (deviceEmail, questionJSON, callback)
{
	var docClient = new AWS.DynamoDB.DocumentClient();
	
    var params = {TableName:tableName,Key:{"email":deviceEmail}};
	
	docClient.get(params,function(err,data)
	{
		if(err)
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
			else if(data.Item.user_type != 0) //to discard users of other types, admin or user, because they cant have questions
			{
				callback(true, null);
                return
			}
			else
			{
				//############################
				var params2 = {TableName : tableName,Item: data.Item};
				params2.Item.questionJSON=questionJSON;
				docClient.put(params2, function (err, data) 
				{
					if (err) 
					{
						callback(err, null);
						return;
					}
					else
					{
						//successfully updated data
						 callback(null, "ok");
						 return;
					}
				 });
			}
			
		}
	});
}


exports.addFeedback = function (email, feedback, callback)
{
	var timestamp = new Date().getTime();
	var docClient = new AWS.DynamoDB.DocumentClient();
	var item = 
	{
		deviceid:email,
		timestamp: timestamp,
		feedback: feedback
	}

	var params = 
	{
		TableName: dataTableName,
		Item: item
	};
	docClient.put(params, function (err, data) 
	{
		if (err) 
		{
			callback(err, null);
			return;
		}
		else
		{
			//successfully updated data
			 callback(null, "ok");
			 return;
		}
	 });
	
}



exports.fetchFeedback = function (deviceid,start,end, callback)
{
	var docClient = new AWS.DynamoDB.DocumentClient();
	var params = {
	  TableName: dataTableName,
	  KeyConditionExpression: '#deviceid = :dId AND #timestamp between :ts1 AND :ts2',
	  "ExpressionAttributeNames": {
		"#deviceid": "deviceid",
		"#timestamp": "timestamp"
	},
	  ExpressionAttributeValues: {
		':dId': deviceid,
		':ts1': start,
		':ts2': end
	  }
	};
	docClient.query(params, function (err, data) 
	{
		if (err) 
		{
			callback(err, null);
			return;
		}
		else
		{
			//successfully fetched data
			 callback(null, data);
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
    var params={TableName:tableName,FilterExpression:"user_type = :val",ExpressionAttributeValues:{":val":1},ReturnConsumedCapacity:"TOTAL"};
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
    var params={TableName:tableName,FilterExpression:"user_type = :val1 and device_details.owner_email =:val2",ExpressionAttributeValues:{":val1":0,":val2":data.email},ReturnConsumedCapacity:"TOTAL"};
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



