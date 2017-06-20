

var ProjectOptions = {
    GetCriteria: function (url, action, selector, load) {
		try {
		    //			var path = url + "Options/GetCustomProjectTypes"
//		    var path = url + "ModPipeline/getStatus";

			$.ajax({
				url: url + action,
				type: "GET",
				contentType: "application/json; charset=utf-8",
				datatype: "json",
				async: false,
				success: function (response) { ProjectOptions.Success(selector, response, load); },
				error: function (error) { ProjectOptions.getProjectsError(error); },
			});
		} catch (ex) {
			alert('Something went wrong in GetCustomProjectTypes!\n' + ex);
		}
	}, Success: function (selector, response, load) {
		if (load == true) {
		    ProjectOptions.LoadFilter(selector, "select", response);
		}

		return response;
	}, LoadFilter: function (selector, type, values) {
	    try {   

	        if (type == "select") {
	            var optn = $('<option />', { value: "a@#xis78", text: "*Blank*" });
	            $(selector).append(optn);

	            $.each(values, function (index, val) {
					//var li = $("<li>");
					var option = $('<option>', {value: val.Name, text: val.Name});
					//li.append(option);
					$(selector).append(option);
				})
			}
		} catch (errr) {
			alert('Something went wrong in LoadFilter!\n' + ex);
		}

	}, getProjectsError: function (error) {
		var message = "In prod, need to get rid of this popup.\r\nError in OptionsController.js:\r\n";
		var err = "";
		if (error.status) {
			message += "Return code " + error.status + ": " + error.statusText + "\r\nStack Trace: " + error.responseText;
			//err = $.parseJSON(error.responseText);
		}
		else {
			err = $.parseJSON(error.responseText);
			message += err.ExceptionMessage + "\r\n" + err.StackTrace;
		}

		alert(message);
	}

}