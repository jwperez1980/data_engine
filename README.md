# data_engine
JavasScript extension of DataTables that creates a sortable, searchable grid based on a single JSON feed file.

This extension was created to demostrate how to create a single page app in JavaScript that renders a searchable/sortable data grid based solely on a generic JSON file. 

Lists of data sourcs can be created and passed to the extension dynamically.  For example:

![restServiceList.jpg]({{site.baseurl}}/restServiceList.jpg)

<select>
	<option value="https://swapi.co/api/people/?format=json">REST Service</option>
	<option value="<some path to JSON on server/theFile.json">File from Server</option>
	<option value="<JS array you create on the fly/dynamicFile">JA Object</option>
</select>

- The list could be created dynamically from a DB table so that adding a row to the table creates a new option in the list.
- The list could be manipulated in the JS by the user, to add new URLs as needed.#
- There could be a text box where a user enters a URL.
- Base on user input and other variables a URL can be created dynamically and passed staight to the extension constructor.

For working example deployed on Heroku:

https://data-engine.herokuapp.com

The code can be cloned or forked from:

https://github.com/jwperez1980/data_engine

The following is an example:

HTML (only this one line is requred):


  <div class="data-panel">
      <div id="FilterDiv">
      </div>
  </div>


INCLUDES:
```html
<link href="https://cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css" rel="stylesheet" />
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/css/bootstrap-select.min.css">
<link href="./Content/font-awesome.min.css" rel="stylesheet" />
<link href="./Content/dashboard.css" rel="stylesheet" />

<script src="https://code.jquery.com/jquery-3.1.0.min.js"
    integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s="
    crossorigin="anonymous"></script>
<script type="text/javascript" src="https://cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/js/bootstrap-select.min.js"></script>
<script src="./scripts/dashboard-models.js"></script>
```
JavaScript (One line of JS to pass the URL to the AJAX:
```javascript
ProjectList.callHttpMethod("https://swapi.co/api/people/?format=json", "GET", null, loadPage, null, null, "results");
```

All that is required is that the JSON be formated correctly such as follows:
[
	{
		"id":1,
		"last_name":"Rogers",
		"first_name":"Bill",
		"age":63,
		"city":"Allentown",
		"state":"PN",
		"club":"Marathon Running Club",
		"url":"https://quiet-refuge-72491.herokuapp.com/runners/1.json"
	},
	{
		"id":2,
		"last_name":"Goucher",
		"first_name":"Adam",
		"age":36,
		"city":"Boulder",
		"state":"CO",
		"club":"Boulder Running Club",
		"url":"https://quiet-refuge-72491.herokuapp.com/runners/2.json"
	},
	...
]

If the data to display is not in the root of the file, the path to it can be used.  In the following the "results" path would be used.  The rest of the file is ignored.
```json
{
	"count":87,
	"next":"http://swapi.co/api/people/?page=2&format=json",
	"previous":null,
	"results":[
		{
			"name":"Luke Skywalker",
			"height":"172",
			"mass":"77",
			"hair_color":"blond",
			"skin_color":"fair",
			"eye_color":"blue",
			"birth_year":"19BBY",
			"gender":"male"
		},
		{
			"name":"C-3PO",
			"height":"167",
			"mass":"75",
			"hair_color":"n/a",
			"skin_color":"gold",
			"eye_color":"yellow",
			"birth_year":"112BBY",
			"gender":"n/a"
		},
		...
	]
}

```