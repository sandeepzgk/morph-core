var AWS = require("aws-sdk");
var bcrypt = require('bcrypt');
var config = require('../../serverConfig.json');

var tableName = config.dynamo.userTable;

var SALT_WORK_FACTOR = 2;

function hashPassword(userData, callback) {
    bcrypt.genSalt(config.bcrypt.saltWorkFactor, function (err, salt) {
        if (err) {
            callback(err, null);
            return;
        }
        // hash the password along with our new salt
        bcrypt.hash(userData.password, salt, function (err, hash) {
            if (err) {
                callback(err, null);
                return;
            }
            // override the cleartext password with the hashed one
            userData.password = hash;
            callback(null, 'ok');
            return;
        });
    });
}

exports.addClinicalStaff = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
	
    var params = {
        TableName: tableName,
        Item: userData
    };
    hashPassword(userData, function (err, data) {
        if (!err) {
            docClient.put(params, function (err, data) {
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    callback(null, 'ok');
                    return;
                }
            });
        }
        else {
            callback(err, null);
            return;
        }

    });
}

exports.addPatient = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName,
        Item: userData
    };
    hashPassword(userData, function (err, data) {
        if (!err) {
            docClient.put(params, function (err, data) {
                if (err) {
                    callback(err, null);
                    return;
                } else {
                    callback(null, 'ok');
                    return;
                }
            });
        }
        else {
            callback(err, null);
            return;
        }

    });
}

exports.updatePatientListOfClinicalStaff = function (patientEmail, clinicalEmail, callback) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName,
        Key: {
            "email": clinicalEmail
        },
        UpdateExpression: "set doctor.patient_list = list_append (doctor.patient_list, :patientEmail)",

        ExpressionAttributeValues: {
            ":patientEmail": [patientEmail]
        },
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(params, function (err, data) {
        if (err) {
            callback(err, null);
            return;
        } else {
            callback(null, 'ok');
            return;
        }
    });
}

exports.login = function (userData, callback) {

	console.log("tablename::"+tableName)
	//console.log("Item::"+userData)
	//console.log("item explored:"+JSON.stringify(userData))
	console.log("item email:"+userData.email)
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName,
        Key: {
            "email": userData.email
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
			console.log("doc client error")
            callback(err, null);
            return;
        }
        else {
            if (!data.hasOwnProperty("Item")) {
                callback(true, null);
                return;
            } else {
                bcrypt.compare(userData.password, data.Item.password, function (err, res) {
                    if ((!err) && (res == true)) {
                        delete data.Item.password;
                        callback(null, data);
                        return;
                    } else {
						console.log("some other error happened")
                        callback(true, null);
                        return;
                    }
                });
            }
        }
    });
}

exports.listPatients = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        "TableName": tableName,
        "FilterExpression": "hospital_id = :val1 and user_type = :val2",
        "ExpressionAttributeValues": {
            ":val1": userData.hospital_id,
            ":val2": 0
        },
        "ReturnConsumedCapacity": "TOTAL"
    };

    docClient.scan(params, function (err, data) {
        if (!err) {
            if (data.hasOwnProperty("Count")) {
                if (data.Count == 0) {
                    callback(true, null);
                    return;
                }
            }
            if (data.hasOwnProperty("ConsumedCapacity")) {
                delete data.ConsumedCapacity;
            }
            for (var i = 0; i < data['Items'].length; i++) {
                delete data['Items'][i].password;
            }
            callback(null, data);
            return;
        }
        else {
            callback(err, null);
            return;
        }
    });
}

exports.listClinicalStaffs = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        "TableName": tableName,
        "FilterExpression": "hospital_id = :val1 and user_type = :val2",
        "ExpressionAttributeValues": {
            ":val1": userData.hospital_id,
            ":val2": 1
        },
        "ReturnConsumedCapacity": "TOTAL"
    };

    docClient.scan(params, function (err, data) {
        if (!err) {
            if (data.hasOwnProperty("Count")) {
                if (data.Count == 0) {
                    callback(true, null);
                    return;
                }
            }
            if (data.hasOwnProperty("ConsumedCapacity")) {
                delete data.ConsumedCapacity;
            }
            for (var i = 0; i < data['Items'].length; i++) {
                delete data['Items'][i].password;
            }
            callback(null, data);
            return;
        }
        else {
            callback(err, null);
            return;
        }
    });
}

exports.listPatientsByClinicalStaff = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        "TableName": tableName,
		"FilterExpression": "(contains(patient.doctor_email, :val1)) and user_type = :val2",
        "ExpressionAttributeValues": {
            ":val1": userData.email,
            ":val2": 0
        },
        "ReturnConsumedCapacity": "TOTAL"
    };

    docClient.scan(params, function (err, data) {
        if (!err) {
            if (data.hasOwnProperty("Count")) {
                if (data.Count == 0) {
                    callback(true, null);
                    return;
                }
            }
            if (data.hasOwnProperty("ConsumedCapacity")) {
                delete data.ConsumedCapacity;
            }
            for (var i = 0; i < data['Items'].length; i++) {
                ////console.log(data['Items'][i].password);
                delete data['Items'][i].password;
            }
            callback(null, data);
            return;
        }
        else {
            callback(err, null);
            return;
        }

    });
}


exports.getHistoryRangeByUser = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        "TableName": config.dynamo.dataTable,
        "KeyConditionExpression": "#userid = :userid ",
        "ExpressionAttributeNames": {
            "#userid": "userid"
        },
        "ExpressionAttributeValues": {
            ":userid": userData.patientId
        }

    };

    docClient.query(params, function (err, data) {
        var responce = {};
        if (err) {
            callback(err, null);
            return;
        } else {

            if (data.hasOwnProperty("Items")) {
                if (data['Items'].length == 0) {
                    callback(true, null);
                    return;
                }
                responce.patientId = data.Items[0].userid;
                responce.startDate = data.Items[0].dataTimestamp;
                params.ScanIndexForward = false;
                docClient.query(params, function (err, data) {
                    if (err) {
                        callback(err, null);
                        return;
                    } else {
                        if (data.hasOwnProperty("Items")) {
                            if (data['Items'].length == 0) {
                                callback(true, null);
                                return;
                            }
                            responce.endDate = data.Items[0].dataTimestamp;
                            callback(null, responce);
                            return;
                        } else {
                            callback(true, null);
                            return;
                        }

                    }
                });
            } else {
                callback(true, null);
                return;
            }

        }
    });
}


exports.validateUserId = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName,
        Key: {
            "email": userData.email
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        else {
            if (!data.hasOwnProperty("Item")) {
                callback(true, null);
                return;
            } else {
                callback(null, "ok");
                return;
            }
        }
    });
}






exports.updateDataSession = function (userData, callback) {

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: tableName,
        Key: {
            "email": userData.email
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        else {
            if (!data.hasOwnProperty("Item")) {
				//error condition
                callback(true, null);
                return;
            } else {
				console.log(data);
				var params2 = {
				  TableName : tableName,
				  Item: data.Item
				};
				if(params2.Item.hasOwnProperty("session_data"))
				{
					for(var i = 0; i<params2.Item.session_data.length; i ++)
					{
						var current_data = params2.Item.session_data [i];
						if(current_data.session_id === userData.sessionId)
						{
							//updating prior session_data information
							current_data.start = userData.start;
							current_data.end   = userData.end;	
							break;							
						}
						
					}
					if(i >= params2.Item.session_data.length)
					{
						//new session_data found
						var new_session = {start:userData.start,end:userData.end,session_id:userData.sessionId};
						params2.Item.session_data.push(new_session);
					}
				}
				else
				{
					//no prior session_data
					params2.Item.session_data = [{start:userData.start,end:userData.end,session_id:userData.sessionId}];
				}
				 docClient.put(params2, function (err, data) {
					if (err) {
						callback(err, null);
						return;
					}
					else
					{
						//successfully updated data
						 callback(null, "ok");
						 return;
					}
				 }   );            
                
            }
        }
    });
}