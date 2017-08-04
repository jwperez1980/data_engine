window.onload = function () {
    var loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart; 
    console.log('Page load time is ' + loadTime);
}

var $loadingSpinner = $("<div></div>", { id: "loadingSpinner", class: "upperLayer" })
var $loadingImage = $("<img></img>", { id: "loadingImage", src: "../Content/images/InternetSlowdown_Day.gif" })
//src="smiley.gif" alt="Smiley face" height="42" width="42"
$loadingSpinner.append($loadingImage);
$("body").append($loadingSpinner);
$('#loadingImage').hide();

jQuery.ajaxSetup({

    beforeSend: function () {
        $('#loadingImage').show();
    },
    complete: function () {
        $('#loadingImage').hide();
    },
    success: function () { }
});

/* dashboardColumns: This is te list of columns to display and properties describing how to display */
var dashboardColumns = {}
var dTable;
var viewName = "General Report";

var ProjectList = {

    /* column order is optional */
    displayExternalData: function (columnOrder, data, url) {

        dashboardColumns = {};

        if (columnOrder == null) {
            var counter = 0;
            columnOrder = [];
            $.each(data[0], function (columnName, columnValue) {
                if (counter < 8)
                    columnOrder[counter++] = columnName;
            })
        }


        $.each (columnOrder, function(index, name) {
            column = new Object();
            column.ClassName = name;
            column.DisplayName = name;
            dashboardColumns[column.ClassName] = column;
            
        })
        ProjectList.renderPage(data);
    },
    renderPage: function (response) {
        /***
         * This method takes JSON as a parameter and uses it to render the DataTables object.
        */
        var x = response;
        try {

            $("#main-panel").remove();
            $("#myModel").remove();

            var main_panel = 
            "<div id=\"main-panel\">" +
            "    <div id=\"SidePanel\" class=\"side-panel\">" +
            "        <div id=\"ToggleLeftPane\" class=\"float-right nav\" style=\"cursor:pointer;width:10px\" ata-toggle=\"tooltip\" title=\"Click to hide/show panel\">" +
            "            <i class=\"fa fa-caret-square-o-left\" aria-hidden=\"true\" data-toggle=\"tooltip\" title=\"Hide Filter Pallette\"></i>" +
            "        </div>" +
            "        <label class=\"side-panel-header\" style=\"cursor:pointer\">Filter Pallette</label>" +
            "        <nav id=\"NavSidePanelConfigBox\" class=\"navbar navbar-defaultk side-panel-\" role=\"navigation\">" +
            "            <div id=\"SidePanelConfigBox\">" +
            "                <ul class=\"nav navbar-nav side-panel-\">" +
            "                    <li id=\"SelectFiltersToDisplay\" class=\"side-panel-config-display\"><i class=\"fa fa-cogs\" aria-hidden=\"true\" data-toggle=\"tooltip\" title=\"Configure which filters are visible\"></i></li>" +
            "                </ul>" +
            "                <ul class=\"nav navbar-nav side-panel-\">" +
            "                    <li id=\"ClearAllSidePanelFilters\" class=\"side-panel-config-clear\">" +
            "                        <i class=\"fa fa-ban\" aria-hidden=\"true\" data-toggle=\"tooltip\" title=\"Clear all filter selections\"></i>" +
            "                    </li>" +
            "                    <li id=\"CloseAllSidePanelFilters\" class=\"side-panel-config-close\"><i class=\"fa fa-minus\" aria-hidden=\"true\" data-toggle=\"tooltip\" title=\"Close all filters\"></i></li>" +
            "                    <li id=\"OpenAllSidePanelFilters\" class=\"side-panel-config-open\"><i class=\"fa fa-plus\" aria-hidden=\"true\" data-toggle=\"tooltip\" title=\"Open all filters\"></i></li>" +
            "                </ul>" +
            "            </div>" +
            "        </nav>" +
            "        <!--<ul class=\"nav navbar-nav side-panel-\">" +
            "            <li id=\"HideSidePanelConfig\" class=\"side-panel-config-hide\">Hide Config Panel</li>" +
            "        </ul>-->" +
            "        <div id=\"SideFilterDiv\" class=\"side-panel-div\"></div>" +
            "    </div>" +

            "    <div class=\"data-panel\">" +
            "        <div id=\"FilterDiv\">" +
            "        </div>" +
            "    </div>" +
            "</div>" +
            "</div>";

            var my_model = 
            "<div id=\"myModal\" class=\"modal fade\" role=\"dialog\">" +
            "    <div class=\"modal-dialog\">" +
            "        <div class=\"modal-content\">" +
            "            <div class=\"modal-header\">" +
            "            </div>" +
            "            <div class=\"modal-body\">" +
            "            </div>" +
            "            <div class=\"modal-footer\">" +
            "                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>" +
            "                <button type=\"button\" class=\"btn btn-primary\">Some button</button>" +
            "            </div>" +
            "        </div>" +
            "    </div>" +
            "</div>";



            /* create the table to load DataTable data into */
            var currentDataTable = $("<table></table>", { id: "dataDataID", class: "display table table-striped table-bordered table-condensed" })
            var thead = $("<thead></thead>", { id: "mainHeaderRow" });
            var tbody = $("<tbody></tbody>", { id: "bodyRow" });
            var trNoRecord = $("<tr></tr>", { id: "noRecordsRow" });
            var tdNoRecord = $("<td></td>", { class: "label-warning" }).html("No records found!");
            var tfoot = $("<tfoot></tfoot>", { id: "mainFooterRow" });

            trNoRecord.append(tdNoRecord);
            tbody.append(trNoRecord);

            var displayColumns = [];
            var counter = 0;
            var headTr = $("<tr></tr>");
            var bodyTr = $("<tr></tr>");
            var footTr = $("<tr></tr>");

            /* 
             * create displayColumns based on values in dashboardColumns. 
             * This is the list of column headers to be displayed and will be passed to the DataTables as a parameter.
             * The format is :   displayColumns[index]["data"]
             * This is the format required by datatables.
            */
            $.each(dashboardColumns, function (index, item) {

                var $th = $("<th></th>", { class: "firstHeader" });
                $th.append(item.DisplayName);
                headTr.append($th);
    
                var $td = $("<td></td>");;
                $td.attr("class", item.ClassName);
                bodyTr.append($td);

                var $tdF = $("<td></td>");
                footTr.append($tdF);

                displayColumns[counter] = {};
                displayColumns[counter++]["data"] = item.ClassName;
            });

            /* create the header that names the view being displayed */
            $pageHeaderDiv = $("<div></div>", { id: "page-header", class: "page-header-pad"});
            $ph_h3 = $("<label></label>", { id: "tableHeader", class: "lead", text: "View - " + viewName + " " });
            //$ph_h3_span = $("<span></span>", { id: "CurrentTemplate", class: "small", text: "(" + viewName + ")" });

            //$ph_h3.append($ph_h3_span);
            $pageHeaderDiv.append($ph_h3);
            
            thead.append(headTr);
            tbody.append(bodyTr);
            tfoot.append(footTr);
            currentDataTable.append(thead, tbody, tfoot);

            $("#page-header").remove()

            $("#FilterDiv").before(main_panel)
            $("#FilterDiv").after($pageHeaderDiv);
            $("#page-header").after(currentDataTable);

            $("#page-header").after(my_model);

            /* create displayData which are all the values to be displayed in a cell of the DataTable object.
             * The format will be : [{name: value},{name: value}...] where name maps to a displayColumns */
            var displayData = [];
            $.each(response, function (index, project) {

                /***
                 * Loop through columns for this row and add data to displayData
                ***/
                displayData[index] = {};
                $.each(dashboardColumns, function (columnIndex, column) {
                    displayData[index][column.ClassName] = project[column.ClassName];
                })
            });

            var currR = 1;
            $.fn.dataTable.ext.errMode = 'none';

            dTable = $('#dataDataID').DataTable({
                pageLength: 100,
                deferRender: true,
                /* This sets the label for glabal search box */
                "language": {
                    "search": "Global Text Search:",
                    "info": "Showing _START_ to _END_ of _TOTAL_ entries.",
                    "infoFiltered": " (filtered from _MAX_ records)",
                    "lengthMenu": "Show _MENU_ entries per page."
                },
                //pagingType: "full",
                //scrollX: true,
                //scrollY: true,
                /* this is a hack to stop a datatables error from occuring */
                bAutoWidth: false,
                /* This setups up the tables config buttons/links (like filters, pagination etc ... */
                dom: '<"float-left input-sm"i><"float-left input-sm"l><"float-right input-sm global-search"f>rtp',
                //dom: "<'row'<'col-sm-6 bottom-space'B>>" +
                //    '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-tl ui-corner-tr"lfr>' +
                //        't' +  '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-bl ui-corner-br"ip>',
                //buttons: [
                //    'copy',
                //    'excel',
                //    'csv',
                //    'pdf',
                //    'print'
                //],

                fnInitComplete: function () {
                    /* this is the datatable object itself */
                    that = this;
                }, fnDrawCallback: function (oSettings) { }
                , footerCallback: function (tfoot, data, start, end, display) { }
                , headerCallback: function (thead, data, start, end, display) { }
                , rowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { }
                , data: displayData
                , columns: displayColumns
                //, columnDefs: [{ "width": "500px", "targets": "ProjectName" }]
                , createdRow: function (row, item, index) { //row, cellsInCurrentRow, rowIndex

                    var currC = 1;
                    row.setAttribute("data-row-num", currR);
                    row.setAttribute("data-project-number", item[0]); /* ALWAYS send the row unique id in column 0 */

                    /* 
                    * The column cells for each row are created dynamically using the dashboardColumns array
                    * These property names for these two objects must match.
                    */
                    //$.each(dashboardColumns, function (columnName, columnProperites) {
                    //    ProjectList.setColumnValues(row, currC, dashboardColumns[columnProperites.ClassName], item[columnProperites.ClassName], item, false);
                    //    currC++;
                    //});

                    currR += 1;
                } /* end createRow */
            }); /* end DataTable */
           
            /* Create select box for each column */
            api = $('#dataDataID').DataTable()
            api.columns().flatten().each(function (colIdx) {

                div = $("<div class='side-filter-div'></div>");

                // Create the select list and search operation
                var selected = "";
                //class="selectpicker" data-style="btn-primary"
                //var select = $('<select class="columnSelect selectpicker" multiple data-max-options="3" data-live-search="true"/>')
                
                var select = $('<select id=' + displayColumns[colIdx]["data"] + '_select' + colIdx + ' class="columnSelect" multiple size=1"/></div')
                .appendTo(
                    //api.column(colIdx).header()
                    //$("#SideFilterDiv")
                    div
                )
                .append($('<option value="Choose">Choose</option>'))
                .on('change', function () {
                    if (select.val() == 'Choose') {
                        
                        //var s = "";
                    }
                    else if (select.val() == 'Clear') {
                        api
                            .column(colIdx)
                            .search('')
                            .draw();
                        selected = "";
                    }
                    else {
                        selected = $(this).val().join("|");
                        api
                            .column(colIdx)
                            .search(selected, true, false)
                            .draw();
                    }
                })
                .on('click', function() {
                    // Get the search data for the column and add to the select list
                    //select.empty().append($('<option>Choose</option>'));

                    select.html("");
                    select.attr("size", 6);
                    select                    
                        .append($('<option value="Choose">Choose</option>'))
                        .append($('<option value="Clear">Clear</option>'))
                    api
                        .column(colIdx)
                        .cache('search')
                        .sort()
                        .unique()
                        .each(function (d) {
                            select.append($('<option value="' + d + '">' + d + '</option>'));
                        });
                    if (selected != "") {
                        var selectedArray = selected.split("|");
                        select.val(selectedArray);
                    }
 
                });
                select.before('<label id="' + displayColumns[colIdx]["data"] + '_lbl' + colIdx + '" class="side-panel-filter-header">' + displayColumns[colIdx]["data"] + ':</label>');
                $("#SideFilterDiv").append(div);
            });

            /* Add the text search box for each column. */
            var inputIndex = 0;
            $.each($(dTable.table().header()).find("th"), function (index, cell) {
                var currId = "text-info" + inputIndex++;
                var $input = $("<input></input>", {id: currId, class: "text-info searchcolumn", type: "text", placeholder: "type" })
                    .on('click', function (event) {
                        event.stopPropagation();
                    })
                    .on('keyup change', function () {
                        dTable.columns(index).search(this.value).draw();
                        //}
                    })
                var hideme = $("<button type='button' class='btn  btn-link display-btn'>Show</button>").click(
                    function (event) {
                        if ($(this).text() == "Hide") {
                            $("#" + currId).hide();
                            $(this).text("Show");
                        }
                        else {
                            $("#" + currId).show();
                            $(this).text("Hide");
                        }
                        event.stopPropagation();
                    });
                $input.hide();
//                $(this).append("<br/>", $input, hideme);
            })

            $(document).ready(function () {
                $(document).ready(function () {
                    $("#ToggleLeftPane").on("click", function (event) {
                        var x = $("#SidePanel").width();
                        if ($("#SidePanel").width() > 150) {
                            $("#SidePanel").width("15px");
                            $("[class*=side-panel-]").hide();
                            $("#ToggleLeftPane").attr("class", "floate-left").html('<i class="fa fa-caret-square-o-right" aria-hidden="true" data-toggle="tooltip" title="Show Filter Pallette"></i>');
                        }
                        else {
                            $("#SidePanel").width("200px");
                            $("[class*=side-panel-]").show();
                            $("#ToggleLeftPane").attr("class", "float-right").html('<i class="fa fa-caret-square-o-left" aria-hidden="true" data-toggle="tooltip" title="Hide Filter Pallette"></i>');
                        }
                    })
                })

                $("input[type='search']").attr("placeholder", "type sreach string");

                $(".side-panel-config-clear").on("click", function (event) {
                    ProjectList.clearAllColumnSelects("div.side-panel-div select", "");
                    dTable
                     .search('')
                     .columns().search('')
                     .draw();
                })

                $(".side-panel-config-close").on("click", function (event) {
                    ProjectList.setAllColumnSelectsSize("div.side-panel-div select", 1);
                })

                $("#OpenAllSidePanelFilters").on("click", function (event) {
                    ProjectList.setAllColumnSelectsSize("div.side-panel-div select", 6);
                })

                /* Hide/Show side panel based on clicking the gear icon */
                $(".side-panel-config-hide").on("click", function (event) {
                    if ($(".side-panel-config-hide").text() == "Hide Config Panel") {
                        $("li[class*='side-panel-'").hide();
                        $("#SidePanel").hide();
                        $(".side-panel-config-hide").text("Show Config Panel");
                        $(".side-panel-config-hide").show();
                    }
                    else {
                        $("#NavSidePanelConfigBox").show();
                        $("li[class*='side-panel-'").show();
                        $(".side-panel-config-hide").text("Hide Config Panel");
                    }

                })

                /* The modal to configure which filters display */
                $(".side-panel-config-display").on("click", function (event) {
                    var blueprint = '<div class="row"><div class="col-sm-12 checkbox"><label class="float-left choose-filter-checkbox"><input type="checkbox" id="xxxx" value="xxxx" checked>yyyy</label></div></div>'
                    var htmlform = '<div class="container">';
                    var i = 0;
                    $.each(dashboardColumns, function (index, columnObj) {
                        var newBlueprint = blueprint;
                        if ($("#" + columnObj.DisplayName + "_select" + i).is(':visible') == false) {
                            newBlueprint = blueprint.replace("checked", "");
                        }

                        htmlform += newBlueprint
                            .replace("xxxx", columnObj.DisplayName + "_chkbox" + i) //the id
                            .replace("xxxx", columnObj.DisplayName)                 //the value
                            .replace("yyyy", columnObj.DisplayName);                //displayed text
                        i++;
                    })

                    htmlform += '</div>';

                    $("div.modal-header").html("<label>Select filters to display</label>");
                    $("div.modal-body").html("");
                    $("div.modal-body").html(htmlform);
                    $("div.modal-footer > .btn-primary").prop('class', 'btn btn-primary btn-sm btn-success').text("Sumbit");
                    $("div.modal-footer > .btn-default").prop('class', 'btn btn-default btn-sm').text("Cancel");
                    $("div.modal-dialog").prop('class', 'modal-dialog modal-sm')
                    $("#myModal").modal("show", function () { });
                })

                /* click submit button on side panel config modal */
                $("div.modal-footer > .btn-primary").click(function (event) {

                    event.preventDefault();

                    var i = 0;
                    $.each(dashboardColumns, function (index, columnName) {

                        var chkbx_name = columnName["DisplayName"] + "_chkbox" + i;
                        var select = columnName["DisplayName"] + "_select" + i;

                        var lbl_name = columnName["DisplayName"] + "_lbl" + i;
                        if ($("#" + chkbx_name).is(":checked")) {
                            $("#" + select).show();
                            $("#" + lbl_name).show();
                        }
                        else {
                            $("#" + select).hide();
                            $("#" + lbl_name).hide();
                        }
                        i++;
                    });
                    $('#myModal').modal('hide');
                })

            });

        } catch (ex) {
            alert('Something went wrong in renderPage!\n' + ex);
        }

    },
    /***
     * Call http method and send the JSON to the controller at path.
     */
    callHttpMethod: function (path, httpMethod, jsonData, successMethod, successMethodParams, errorMethod) {
        try {
            if (httpMethod == "GET") {
                var restPath = path;
                var responseObjectDataLocation =  null;
                var params = path.replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
                if (params["jsonLocation"] != undefined) {
                    //Only one possible param for now
                    responseObjectDataLocation = params["jsonLocation"];
                    restPath = path.split("&")[0];
                }
                else {
                    restPath = path;
                }

                if (params["viewname"] != undefined) {
                    viewName = params["viewname"];
                }
                else {
                    viewName = "General Report"
                }

                $.get(restPath, function (response) {
                    if (successMethod != null && successMethod != 'Undefined') {
                        var responseData = [];
                        if (responseObjectDataLocation != null && responseObjectDataLocation != undefined) {
                            responseData = response[responseObjectDataLocation];
                        }
                        else {
                            responseData = response;
                        }
                        successMethod(successMethodParams, responseData);
                    }
                });
            }
            else
                alert("only supporting GET for now.")
        } catch (error) {
            alert("Error in callHttpMethod");
        }
    },

    clearAllColumnSelects: function (selector, defaultValue) {
        var selector = $(selector); //.multiselect("uncheckAll");
        selector.val("")
    },
    setAllColumnSelectsSize: function (selector, size) {
        $(selector).attr("size", size);
    }
    , getQueryParameters: function (str) {
        return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
    }, getProjectsError: function (error) {
        var message = "In prod, need to get rid of this popup.\r\nError in dashboard.js:\r\n";
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
};