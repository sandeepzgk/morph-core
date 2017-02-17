var userdao = require('./lib/dao/userDao.js');
var jwtToken = require('./lib/token/generator');
var session = require('./lib/token/session');
var edfLambda = require('./lib/lambdaInvoker/edf');
var historyLambda = require('./lib/lambdaInvoker/history');
var redis = require('./lib/redis/redisdelegate');
var validator = require('./lib/validator/schemaValidator');
var fcm = require('./lib/fcmtokenmanager/fcmtoken.js');
var sendFcm = require('./lib/fcmtokenmanager/sendfcmrequest.js');


exports.handler = (event, context, callback) =>
{

    const operation = event.operation;
    //console.log("operation " + event.operation);
    event.Env = "dev";
    //Switch Case to find the operation and pass the values to the respective functions, with the default error method.
    switch (operation)
    {
        case 'version':
            version();
            break;
        case 'addClinicalStaff':
            addClinicalStaff(event);
            break;
        case 'addPatient':
            addPatient(event);
            break;
        case 'validateUser':
            login(event);
            break;
        case 'listPatients':
            listPatients(event);
            break;
        case 'listClinicalStaffs':
            listClinicalStaffs(event);
            break;
        case 'listPatientsByClinicalStaff':
            listPatientsByClinicalStaff(event);
            break;
        case 'logout':
            logout(event);
            break;
        case 'generateEdf':
            generateEdf(event);
            break;
        case 'fetchHistory':
            fetchHistory(event);
            break;
        case 'getHistoryRange':
            getHistoryRange(event);
            break;
        case 'userFCM':
            saveFCMToken(event);
            break;
		case 'updateDataSession':
			updateDataSession(event);
			break;
        default:
            callback(new Error("Unrecognized operation=" + operation + "event=" + event + "body=" + event.body));
            break;

    }

    //This function returns the version information of the code that was deployed on lambda (environment, commit_id and release_id sourced from variables in deploybot)
    function version()
    {
        //console.log("version")
        var verstring = "Env:dev  Commit:c9b7cb210299814b66b80a7cf9b604cc0f0739fb  Release:1031";
        //console.log(verstring);
        callback(null, verstring);
        return;
    }

    //login
    function login(userData)
    {
        validator.validateSchema(userData, function(err, valresult)
        {
            if (err)
            {
                callback("invalid request", null);
            }
            else
            {
                console.log("login method started");
                userdao.login(valresult, function(err, data)
                {
                    if (!err)
                    {
                        console.log("token genaration started");
                        // Generate secure auth token
                        jwtToken.genToken(data.Item.email, function(token, expire)
                        {
                            data.sessionToken = token;
                            data.expire = expire;
                            console.log("session creation started");
                            session.createSessionToken(data, function(err, reply)
                            {
                                if (!err && reply == 'ok')
                                {
                                    if (data.Item.user_type == 1)
                                    {
                                        console.log("Type 1");
                                        console.log(data.Item.doctor.patient_list);
                                        console.log(data.Item.doctor.patient_list.length)
                                        if(data.Item.doctor.patient_list.length != 0 )
                                        {
                                        	sendLiveRequest(data.Item.doctor.patient_list);
                                        }
                                        
                                    }
                                    callback(null, data);
                                    return;
                                }
                                else
                                {
                                    callback("Invalid username or password", null);
                                    return;
                                }
                            });
                        });
                    }
                    else
                    {
                        callback("Invalid username or password", null);
                        return;
                    }
                });
            }
        });
    }

    //Send Fcm request to all paitents under the logged in user
    function sendLiveRequest(paitent_list)
    {
        var message = "IsOnline";
        var message1 = "Start Live";
     
        fcm.getFcmTokenList(paitent_list, function(err, data)
        {
         
            console.log(data);
            for (var i = 0; i < data.length; i++)
            {
                if (data[i] != null)
                {
                    sendFcm.sendFCMToPatitents(data[i], message, function(err, data)
                    {
                        if (!err && data == "Success")
                        {
                            console.log("Message send");
                        }
                    });
                     sendFcm.sendFCMToPatitents(data[i], message1, function(err, data)
                    {
                        if (!err && data == "Success")
                        {
                            console.log("Message send");
                        }
                    });

                }
            }
           
            return;
        });
    }



    //save user FCM token
    function saveFCMToken(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {

                fcm.setFcmToken(userData, function(err, data)
                {
                    if (!err)
                    {
                        callback(null, "Success");
                    }
                    else
                    {
                        console.log("Inside error");
                        callback(err, null);
                    }
                });

            }
        });

    }
    //Print FCM Token
    function getFCMToken(userData)
    {
        fcm.getFcmToken(userData, function(err, data)
        {
            if (!err)
            {
                console.log("Value returned");
            }
            else if (err)
            {
                console.log("returned error");

            }
        });
    }

    //add clinical staff
    function addClinicalStaff(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                    }
                    else
                    {
                        userdao.validateUserId(valresult, function(err, data)
                        {
                            if (!err && data == 'ok')
                            {
                                callback("allready exist", null);
                                return;
                            }
                            else
                            {
                                userdao.addClinicalStaff(valresult, function(err, data)
                                {
                                    if (!err && data == 'ok')
                                    {
                                        callback(null, 'Clinical staff registration succeeded');
                                        return;
                                    }
                                    else
                                    {
                                        callback("Unable to add clinical staff. Error JSON:", JSON.stringify(err, null, 2));
                                        return;
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }

    //add patient
    function addPatient(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                    }
                    else
                    {
                        userdao.validateUserId(valresult, function(err, data)
                        {
                            if (!err && data == 'ok')
                            {
                                callback("allready exist", null);
                                return;
                            }
                            else
                            {
                                userdao.addPatient(valresult, function(err, data)
                                {
                                    if (!err && data == 'ok')
                                    {
                                        userdao.updatePatientListOfClinicalStaff(valresult.email, valresult.patient.doctor_email,
                                            function(err, data)
                                            {
                                                if (err)
                                                {
                                                    callback(err, null);
                                                    return;
                                                }
                                                else
                                                {
                                                    callback(null, 'Patient registration succeeded');
                                                    return;
                                                }

                                            });
                                    }
                                    else
                                    {
                                        callback("Unable to add patient. Error JSON:", JSON.stringify(err, null, 2));
                                        return;
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }


    //listPatients
    function listPatients(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                    }
                    else
                    {
                        userdao.listPatients(valresult, function(err, data)
                        {
                            if (!err)
                            {
                                callback(null, data);
                                return;
                            }
                            else
                            {
                                callback("Empty patient list");
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }


    //listClinicalStaffs
    function listClinicalStaffs(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                    }
                    else
                    {
                        userdao.listClinicalStaffs(valresult, function(err, data)
                        {
                            if (!err)
                            {
                                callback(null, data);
                                return;
                            }
                            else
                            {
                                callback("Empty clinical staffs list");
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }

    //listPatientsByClinicalStaff
    function listPatientsByClinicalStaff(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                    }
                    else
                    {
                        userdao.listPatientsByClinicalStaff(valresult, function(err, data)
                        {
                            if (!err)
                            {
                                redis.checkOnlineStatus(data, function(err, onlineData)
                                {
                                    callback(null, onlineData);
                                    return;
                                });
                            }
                            else
                            {
                                callback("Empty patient list");
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }

    //logout
    function logout(userData)
    {
        if (userData.sessionToken == "123456")
        {
            callback("logout not applicaple for default session", null);
            return;
        }
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                session.clearSessionToken(userData, function(err, reply)
                {
                    if (!err && reply == 'ok')
                    {
                        callback(null, "logout succeeded");
                        return;
                    }
                    else
                    {
                        callback("unable to logout user", null);
                        return;
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }

    //generateEdf
    function generateEdf(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        if (err == "start date must be less than end date")
                        {
                            callback("start date must be less than end date", null);
                            return;
                        }
                        callback("invalid request", null);
                        return;
                    }
                    else
                    {
                        userdao.validateUserId(valresult, function(err, data)
                        {
                            if (!err && data == 'ok')
                            {
                                edfLambda.generateEdf(valresult, function(err, reply)
                                {
                                    if (!err)
                                    {
                                        callback(null, "Edf creation invoked");
                                        return;
                                    }
                                    else
                                    {
                                        callback("unable to genarate Edf file", null);
                                        return;
                                    }
                                });
                            }
                            else
                            {
                                callback("invalid patient", null);
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }

    //fetchHistory
    function fetchHistory(userData)
    {
        console.log("fetch History")
        console.log(userData)
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                        return;
                    }
                    else
                    {
                        userdao.validateUserId(valresult, function(err, data)
                        {
                            if (!err && data == 'ok')
                            {
                                historyLambda.fetchHistory(valresult, function(err, reply)
                                {
                                    if (!err)
                                    {
                                        callback(null, reply);
                                        return;
                                    }
                                    else
                                    {
                                        callback("empty history data", null);
                                        return;
                                    }
                                });
                            }
                            else
                            {
                                callback("invalid patient", null);
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }

    //getHistoryRange
    function getHistoryRange(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                validator.validateSchema(userData, function(err, valresult)
                {
                    if (err)
                    {
                        callback("invalid request", null);
                    }
                    else
                    {
                        userdao.getHistoryRangeByUser(userData, function(err, data)
                        {
                            if (!err)
                            {
                                callback(null, data);
                                return;
                            }
                            else
                            {
                                callback("Empty history data");
                                return;
                            }
                        });
                    }
                });
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }
	
	
	//updateDataSession
    function updateDataSession(userData)
    {
        session.validateSessionToken(userData, function(err, data)
        {
            if (!err && data == 'ok')
            {
                //session validated
				userdao.updateDataSession(userData,function(err,data)
				{
					if (!err)
					{
						callback(null, data);
						return;
					}
					else
					{
						callback("Empty history data");
						return;
					}
				});
            }
            else
            {
                callback("Invalid session token");
                return;
            }
        });
    }
};