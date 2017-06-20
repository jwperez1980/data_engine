/*****
* dashboardColumns is an array of Project objects that describe the columns parametersObject
* to display on a web page. Project is defined in the dashboard-models.js file.search
****/

window.onload = function () {
    var loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart; 
    console.log('Page load time is ' + loadTime);
}

/* dashboardColumns: This is te list of columns to display and properties describing how to display */
var dashboardColumns = {}
var dTable;

var cached = {};
var cachedResponseIndex = 0;
var cachedMilestonesQuickReference = []; /* map the Header to the index in the array for quick access */

var GlobalCounter = 0;
var glyphDown = "<i class=\"glyphicon glyphicon-chevron-down\"></i>";
var glyphUp = "<i class=\"glyphicon glyphicon-chevron-up\"></i>";
var glyphEdit = "glyphicon glyphicon-pencil";
var glyphAdd = "glyphicon glyphicon-plus";
var glyphSave = "glyphicon glyphicon-floppy-save";
var spanFilters = "<span class=\"left-space\">Filters</span>";
var glyphTrash = "glyphicon glyphicon-trash";

/* This is here for use later when loading of filter criteria from external source is implemented */
var DEFAULT_VIEW = 1;           /* Which comlumns to display */
var DEFAULT_TEMPLATE = "Main View";
var DEFAULT_CRITERIA_ONE = ["Something"];     /* Which status (Active, Complete ...) to display. */
var DEFAULT_CRITERIA_TWO = ["Something2"];
var DEFAULT_CRITERIA_FOUR = ["Something3"];
var CUSTOM_PROJECT_TYPE = [""];
/* if none are specified on page load, default values are used to determine how the UI is rendered. */
var searchCriteria = new pmDashboardModels.SearchCriteria(DEFAULT_VIEW, DEFAULT_TEMPLATE, DEFAULT_CRITERIA_ONE, DEFAULT_CRITERIA_TWO, DEFAULT_CRITERIA_FOUR, CUSTOM_PROJECT_TYPE);
/* ****** */

var viewName = "";

var ProjectList = {

    /* 
    * Pass in an array of column names and get back an array of column objects. Then call renderPage.
    */
    displayExternalData: function (columnNames, data) {

        dashboardColumns = {};

        $.each (columnNames, function(index, name) {
            column = new Object();
            column.ClassName = name;
            column.ColumnActualPosition = -1;
            column.ColumnId = -1;
            column.ColumnNumber = -1;
            column.CssProperties = "";
            column.DisplayName = name;
            column.DisplayType = "Project";
            column.HasDetailRow = false;
            column.HasDialog = false;
            column.HasEditableTextarea = true;
            column.HasPopover = false;
            column.HasTooltip = false;
            column.IsVisible = true;
            column.Role = "me";
            column.SelectorClass = "." + name;

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
            $ph_h3_span = $("<span></span>", { id: "CurrentTemplate", class: "small", text: "(" + searchCriteria.Template + ")" });

            $ph_h3.append($ph_h3_span);
            $pageHeaderDiv.append($ph_h3);
            
            thead.append(headTr);
            tbody.append(bodyTr);
            tfoot.append(footTr);
            currentDataTable.append(thead, tbody, tfoot);

            $("#page-header").remove()

            $("#FilterDiv").after($pageHeaderDiv);
            $("#page-header").after(currentDataTable);

            /* create displayData which are all the values to be displayed in a cell of the DataTable object.
             * The format will be : [{name: value},{name: value}...] where name maps to a displayColumns */
            var displayData = [];
            /**** 
             * Loop and and put the milestones in an array for easy access later.
             * Cache this (scoped variable) to use later.  Done here so it does not have
             * to be done for each row of the data table.
             * Access:
             *    cachedMilestonesQuickReference[index][<milestone headername>] = a set of milestones 
             * This loop also adds data to the displayData object.
            ****/
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
                , columnDefs: [{ "width": "500px", "targets": "ProjectName" }]
                , createdRow: function (row, item, index) { //row, cellsInCurrentRow, rowIndex

                    var currC = 1;
                    row.setAttribute("data-row-num", currR);
                    row.setAttribute("data-project-number", item[0]); /* ALWAYS send the row unique id in column 0 */

                    /* 
                    * The column cells for each row are created dynamically using the dashboardColumns array
                    * These property names for these two objects must match.
                    */
                    $.each(dashboardColumns, function (columnName, columnProperites) {
                        ProjectList.setColumnValues(row, currC, dashboardColumns[columnProperites.ClassName], item[columnProperites.ClassName], item, false);
                        currC++;
                    });

                    currR += 1;
                } /* end createRow */
            }); /* end DataTable */
           
            /* Create select box for each column */
            api = $('#dataDataID').DataTable()
            api.columns().flatten().each(function (colIdx) {
                // Create the select list and search operation
                var selected = "";
                //class="selectpicker" data-style="btn-primary"
                //var select = $('<select class="columnSelect selectpicker" multiple data-max-options="3" data-live-search="true"/>')
                
                var a = dashboardColumns;
                var b = colIdx;
                var c = displayColumns[colIdx]["data"];
                
                var select = $('<select id=' + displayColumns[colIdx]["data"] + '_select' + colIdx + ' class="columnSelect" multiple size=1"/>')
                .appendTo(
                    //api.column(colIdx).header()
                    $("#SideFilterDiv")
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
                select.before('<br /><label id="' + displayColumns[colIdx]["data"] + '_lbl' + colIdx + '" class="side-panel-filter-header">' + displayColumns[colIdx]["data"] + ':</label>');
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
                var hideme = $("<button type='button' class='btn  btn-link display-btn'>Hide</button>").click(
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
                $(this).append("<br/>", $input, hideme);
            })

        } catch (ex) {
            alert('Something went wrong in renderPage!\n' + ex);
        }

    },
    /***
     * This is where all the fun stuff happens.  Based on column values, render a cell.
     */
    setColumnValues: function (row, columnNumber, columnToAdd, milestone, item, isMilestone) {
        try {
            var table = $('#dataDataID');

            $(columnToAdd.SelectorClass, row).attr("cell-" + row.getAttribute("data-row-num") + "-" + columnNumber);

            if (columnToAdd.IsVisible != true) {
                var t = table.dataTable();
                var r = columnToAdd.ColumnPosition;
                table.dataTable().fnSetColumnVis(columnToAdd.ColumnPosition, false);
            }

            /* This method needs to be refractord for a general case popover.  Currently is it hardcoded to 
             * display predecessors.
             */
            if (columnToAdd.HasPopover) {
                //ProjectList.createPopover(columnToAdd, row, milestone);
            }
            /* if this column had a detail row, then add a link and create the hidden detail row. */
            if (columnToAdd.HasDetailRow) {
                //ProjectList.createDetailRow(row, columnToAdd, milestone, item);
            }
            /* This method needs to be refractored.  Currently it creates a textarea named Notes that id editable by the user. */
            if (columnToAdd.HasEditableTextarea) {
                //ProjectList.createTextarea(columnToAdd, row, item[columnToAdd.ClassName]);
            } 
            if (columnToAdd.HasEditableTextbox) {
                //ProjectList.createTextarea(columnToAdd.ClassName, row, item.Metadata.Data);
            }

        } catch (ex) {
            alert('Something went wrong in setColumnValues!\n' + ex);
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

$(document).ready(function () {

    $("input[type='search']").attr("placeholder","type sreach string");

    $(".side-panel-config-clear").on("click", function (event) {
        ProjectList.clearAllColumnSelects("div.side-panel-div select", "");
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
        $("#myModal").modal("show", function () {});
    }) 

    /* click submit button on side panel config modal */
    $("div.modal-footer > .btn-primary").click(function(event) {

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

    $("select").on('focus.bs.select', function () {
        //alert('focus')
    })

    //$("#HideSidePanelConfig").on('click', function (event) {
    //    if( $("#HideSidePanelConfig").text() )
    //})

    $("#FilterDiv").on("hide.bs.collapse", function () {
        $("#revealElement").html(glyphDown + spanFilters);
        $("#page-header").attr("class","page-header");

    });

    $("#FilterDiv").on("show.bs.collapse", function () {
        $("#revealElement").html(glyphUp + spanFilters);
        $("#page-header").attr("class", "page-header-pad");
    });
    
    $("select.demo2").change( function () {
        searchCriteria.CustomProjectTypeList = $(this).val();
        ProjectList.getProjectsUsingFilter();
    })

    jQuery(function ($) {
        $(document).ajaxStop(function () {
            $("#ajax_loader").hide();
        });
        $(document).ajaxStart(function () {
            $("#ajax_loader").show();
        });
    });

});