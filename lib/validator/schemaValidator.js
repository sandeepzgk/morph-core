exports.validateSchema = function(event, callback)
{

    if (event.operation == 'addClinicalStaff')
    {
        var clinicalStaffRegistrationSchema = {
            email: "",
            user_type: 1,
            name: "",
            password: "",
            hospital_id: "",
            hospital_record_number: "",
            doctor:
            {
                patient_list: []
            },
            meta:
            {
                age: 0,
                sex: 0,
                mobile: ""
            }
        };

        var name = event.name;
        var email = event.email;
        var password = event.password;
        var age = event.meta.age;
        var sex = event.meta.sex;
        var mobile = event.meta.mobile;
        var hospital_id = event.hospital_id;
        var hospital_record_number = event.hospital_record_number;

        var isValidate = true;

        if ((name == null) || (name == ""))
        {
            isValidate = false
        }
        if ((email == null) || (email == ""))
        {
            isValidate = false
        }
        if ((password == null) || (password == ""))
        {
            isValidate = false
        }
        if ((age == null) || (age == ""))
        {
            isValidate = false
        }
        if ((sex == null) || (sex == ""))
        {
            isValidate = false
        }
        if ((mobile == null) || (mobile == ""))
        {
            isValidate = false
        }
        if ((hospital_id == null) || (hospital_id == ""))
        {
            isValidate = false
        }
        if ((hospital_record_number == null) || (hospital_record_number == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            clinicalStaffRegistrationSchema.email = email;
            clinicalStaffRegistrationSchema.name = name;
            clinicalStaffRegistrationSchema.password = password;
            clinicalStaffRegistrationSchema.hospital_id = hospital_id;
            clinicalStaffRegistrationSchema.hospital_record_number = hospital_record_number;
            clinicalStaffRegistrationSchema.meta.age = age;
            clinicalStaffRegistrationSchema.meta.sex = sex;
            clinicalStaffRegistrationSchema.meta.mobile = mobile;
            callback(null, clinicalStaffRegistrationSchema);
            return;
        }
    }
    else if (event.operation == 'addPatient')
    {

        var patientRegistrationSchema = {
            email: "",
            hospital_id: "",
            hospital_record_number: "",
            meta:
            {
                age: 0,
                mobile: "",
                sex: 0
            },
            name: "",
            password: "",
            patient:
            {
                device_id: "",
                doctor_email: "",
                online: "offline",
                active: true
            },
            user_type: 0
        };

        var name = event.name;
        var email = event.email;
        var password = event.password;
        var age = event.meta.age;
        var sex = event.meta.sex;
        var mobile = event.meta.mobile;
        var hospital_id = event.hospital_id;
        var hospital_record_number = event.hospital_record_number;
        var active = event.patient.active;
        var device_id = event.patient.device_id;
        var doctor_email = event.patient.doctor_email;

        var isValidate = true;
        if ((name == null) || (name == ""))
        {
            isValidate = false
        }
        if ((email == null) || (email == ""))
        {
            isValidate = false
        }
        if ((password == null) || (password == ""))
        {
            isValidate = false
        }
        if ((age == null) || (age == ""))
        {
            isValidate = false
        }
        if ((sex == null) || (sex == ""))
        {
            isValidate = false
        }
        if ((mobile == null) || (mobile == ""))
        {
            isValidate = false
        }
        if ((hospital_id == null) || (hospital_id == ""))
        {
            isValidate = false
        }
        if ((hospital_record_number == null) || (hospital_record_number == ""))
        {
            isValidate = false
        }

        if ((active == null) || (active == ""))
        {
            isValidate = false
        }
        if ((device_id == null) || (device_id == ""))
        {
            isValidate = false
        }
        if ((doctor_email == null) || (doctor_email == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            patientRegistrationSchema.email = email;
            patientRegistrationSchema.name = name;
            patientRegistrationSchema.password = password;
            patientRegistrationSchema.hospital_id = hospital_id;
            patientRegistrationSchema.hospital_record_number = hospital_record_number;
            patientRegistrationSchema.meta.age = age;
            patientRegistrationSchema.meta.sex = sex;
            patientRegistrationSchema.meta.mobile = mobile;
            patientRegistrationSchema.patient.active = active
            patientRegistrationSchema.patient.device_id = device_id
            patientRegistrationSchema.patient.doctor_email = doctor_email

            callback(null, patientRegistrationSchema);
            return;
        }

    }
    else if (event.operation == 'validateUser')
    {
        var loginSchema = {
            email: "",
            password: "",

        };
        var email = event.email;
        var password = event.password;

        var isValidate = true;
        if ((email == null) || (email == ""))
        {
            isValidate = false
        }
        if ((password == null) || (password == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            loginSchema.email = email;
            loginSchema.password = password;
            callback(null, loginSchema);
            return;
        }
    }
    else if (event.operation == 'listPatients')
    {
        var listPatientsSchema = {
            hospital_id: ""
        };
        var hospital_id = event.hospital_id;


        var isValidate = true;
        if ((hospital_id == null) || (hospital_id == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            listPatientsSchema.hospital_id = hospital_id;
            callback(null, listPatientsSchema);
            return;
        }
    }
    else if (event.operation == 'listClinicalStaffs')
    {
        var listClinicalStaffSchema = {
            hospital_id: ""
        };
        var hospital_id = event.hospital_id;


        var isValidate = true;
        if ((hospital_id == null) || (hospital_id == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            listClinicalStaffSchema.hospital_id = hospital_id;
            callback(null, listClinicalStaffSchema);
            return;
        }
    }
    else if (event.operation == 'listPatientsByClinicalStaff')
    {
        var listPatientsByClinicalStaffSchema = {
            email: ""
        };
        var email = event.email;


        var isValidate = true;
        if ((email == null) || (email == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            listPatientsByClinicalStaffSchema.email = email;
            callback(null, listPatientsByClinicalStaffSchema);
            return;
        }
    }
    else if (event.operation == 'generateEdf')
    {
        var generateEdfSchema = {
            patientId: "",
            startDate: 0,
            endDate: 0,
            year: "",
            month: "",
            date: "",
            hour: "",
            minute: "",
            second: "",
            patientName: "",
            patientCode: "",
            gender: 0,
            doctor_email: ""
        };

        var patientId = event.patientId;
        var startDate = event.startDate
        var endDate = event.endDate;
        var year = event.year;
        var month = event.month;
        var date = event.date;
        var hour = event.hour;
        var minute = event.minute;
        var second = event.second;
        var patientName = event.patientName;
        var patientCode = event.patientCode;
        var gender = event.gender;
        var doctor_email = event.doctor_email;

        var isValidate = true;

        if ((patientId == null) || (patientId == ""))
        {
            isValidate = false
        }
        if ((startDate == null) || (startDate == "") || (startDate == 0))
        {
            isValidate = false
        }
        if ((endDate == null) || (endDate == "") || (endDate == 0))
        {
            isValidate = false
        }
        if ((year == null) || (year == "") || (year == 0))
        {
            isValidate = false
        }
        if ((month == null) || (month == "") || (month == 0))
        {
            isValidate = false
        }
        if ((date == null) || (date == "") || (date == 0))
        {
            isValidate = false
        }
        if ((hour == null) || (hour == ""))
        {
            isValidate = false
        }
        if ((minute == null) || (minute == ""))
        {
            isValidate = false
        }
        if ((second == null) || (second == ""))
        {
            isValidate = false
        }
        if ((patientName == null) || (patientName == ""))
        {
            isValidate = false
        }
        if ((patientCode == null) || (patientCode == ""))
        {
            isValidate = false
        }
        if ((gender == null) || (gender == "") || (gender < 0) || (gender > 1))
        {
            isValidate = false
        }
        if ((doctor_email == null) || (doctor_email == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            if (startDate > endDate)
            {
                callback("start date must be less than end date", null);
                return;
            }
            generateEdfSchema.patientId = patientId;
            generateEdfSchema.startDate = startDate;
            generateEdfSchema.endDate = endDate;
            generateEdfSchema.year = year;
            generateEdfSchema.month = month;
            generateEdfSchema.date = date;
            generateEdfSchema.hour = hour;
            generateEdfSchema.minute = minute;
            generateEdfSchema.second = second;
            generateEdfSchema.patientName = patientName;
            generateEdfSchema.gender = gender;
            generateEdfSchema.doctor_email = doctor_email;
            generateEdfSchema.patientCode = patientCode;
            generateEdfSchema.email = patientId;
            callback(null, generateEdfSchema);
            return;
        }
    }
    else if (event.operation == 'getHistoryRange')
    {
        var getHistoryRangeSchema = {
            patientId: ""
        };
        var patientId = event.patientId;


        var isValidate = true;
        if ((patientId == null) || (patientId == ""))
        {
            isValidate = false
        }

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            getHistoryRangeSchema.patientId = patientId;
            getHistoryRangeSchema.email = patientId;
            callback(null, getHistoryRangeSchema);
            return;
        }
    }
    else if (event.operation == 'fetchHistory')
    {
		console.log("test");
		console.log(event);
        var fetchHistorySchema = {
            patientId: "",
            startDate: 0,
            sampleCount: 0
        };

        var patientId = event.patientId;
        var startDate = event.startDate
        var sampleCount = event.sampleCount; 

        var isValidate = true;
		 
        if ((patientId == null) || (patientId == ""))
        {
			console.log("patientId  failed");
            isValidate = false
        }
        if ((startDate == null) || (startDate == "") || (startDate == 0))
        {
			console.log("startDate  failed");
            isValidate = false
        }
        if ((sampleCount == null))
        {
			console.log("sampleCount failed");
            isValidate = false
        }
		
	 

        if (isValidate == false)
        {
            callback(true, null);
            return;
        }
        else
        {
            fetchHistorySchema.patientId = patientId;
            fetchHistorySchema.startDate = startDate;
            fetchHistorySchema.sampleCount = sampleCount;
            fetchHistorySchema.email = patientId; 
            callback(null, fetchHistorySchema);
            return;
        }
    }
    else
    {
        callback(true, null);
        return;
    }
}