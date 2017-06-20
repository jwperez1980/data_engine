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
var TASK_DUE_GRACE_PERIOD = 4;

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
var editNotes = "Edit Notes";
var save = "Save";
var addNote = "Add Note";

var popoverTemplate = ['<div class="popover">',
'<div class="arrow"></div>',
'<table width="100%"><tr><th class="popover-title"></th></tr></table>',
'<table class="popover-content"></table>',
'</div>'].join('');

var controller = "SiterraProject";

var DEFAULT_VIEW = 1;           /* Which comlumns to display */
var DEFAULT_TEMPLATE = "Main View";
var DEFAULT_CRITERIA_ONE = ["Something"];     /* Which status (Active, Complete ...) to display. */
var DEFAULT_CRITERIA_TWO = ["Something2"];
var DEFAULT_CRITERIA_FOUR = ["Something3"];
var CUSTOM_PROJECT_TYPE = [""];
/* if none are specified on page load, default values are used to determine how the UI is rendered. */
var searchCriteria = new pmDashboardModels.SearchCriteria(DEFAULT_VIEW, DEFAULT_TEMPLATE, DEFAULT_CRITERIA_ONE, DEFAULT_CRITERIA_TWO, DEFAULT_CRITERIA_FOUR, CUSTOM_PROJECT_TYPE);

var viewName = "";

var saved_siterra_table = "";

var ProjectList = {

    serviceAPI: "",
    appHome: 'ProjectContent.aspx',


    /***
     * This method starts a sequence of ajax calls that get columns and data from the server
     * then loads it into the DataTables object.  
     *
     * The searchCritera object should be configured with the criteria you want searched before calling
     * this method.  If you do not configure it, then the defaults defined above are used.  This method 
     * will always get called when loading data. For example see the getDataUsingFilters method below and 
     * note that it turns around and calls this method.
     *   
     * Calling this method sets of a chain of actions including calling:
     *      getColumns()
     *      getReports()
     *      getDataFromServer()
     *      renderPage()
     *
     * getProjectsSuccess() loads the DataTable and uses custom js to render columns and data.
     */
    getData: function (serviceAPI, controller, action, methodType, isCustomView /* if true retrieve server side configured view.  notimplemented in this release*/) {

        /* serviceAPI is only passed on loading of the page */
        if (serviceAPI != null && serviceAPI != 'Undefined' && serviceAPI != "")
            this.serviceAPI = serviceAPI;
        try {
            ProjectList.getColumns(controller, action, methodType);
        } catch (ex) {
            alert('Something went wrong in getData!');
        }
    },

    /***
     * This is called when the search criteria changes and the data in the datatable
     * needs to be removed before loading the new data.
     */
    getProjectsUsingFilter: function (serviceAPI, controller, action, methodType) {
        try {
            var table = $('#siterraProjects').DataTable();
            table.destroy();
            $('#siterraProjects').remove();
            ProjectList.getData(serviceAPI, controller, action, methodType, false);
        } catch (ex) {
            alert('Something went wrong in getProjectsUsingFilter!\n' + ex);
        }
    },
    /* 
    * It is required that all DB contexts have a getColumns action method that is exposed in a Controller.  It must return
    * an array of column names to be displayed on the page.
    */
    getColumns: function (controller, action, methodType) {
        try {

            /* all contexts must have a getColumns action */
            var currentUrl = "/getColumns/";

            var url = this.serviceAPI + controller + currentUrl;

            $.ajax({
                url: this.serviceAPI + controller + "/" + currentUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                data: [],
                async: false,
                success: function (columns) { ProjectList.getDataFromServer(columns, controller, action, methodType); },
                error: function (error) { ProjectList.getProjectsError(error); },
            });
        } catch (ex) {
            alert('Something went wrong in getColumns!\n' + ex);
        }
    },
    /* 
    * Pass in an array of column names and get back an array of column objects. Then call renderPage.
    */
    displayExternalData: function (serviceAPI, columnNames, data) {

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
            column.HasEditableTextarea = false;
            column.HasPopover = false;
            column.HasTooltip = false;
            column.IsVisible = true;
            column.Role = "me";
            column.SelectorClass = "." + name;

            dashboardColumns[column.ClassName] = column;
            
        })
        ProjectList.renderPage(data);
        //$.ajax({
        //    url: this.serviceAPI + "./" + currentUrl,
        //    type: "POST",
        //    contentType: "application/json; charset=utf-8",
        //    datatype: "json",
        //    data: JSON.stringify(columnNames),
        //    async: true,                
        //    success: function (columns) {
        //        /* create a list of all of the columns for this view passed in from the server. Each row
        //            contains all the information needed for a cell to render itself. */
        //        dashboardColumns = {};
        //        $.each(columns, function (index, column) {
        //            dashboardColumns[column.ClassName] = column;
        //        });
        //        ProjectList.renderPage(data);
        //    },
        //    error: function (error) {
        //        ProjectList.getProjectsError(error);
        //    }
        //})
    },
    displayXmlFile: function(pathToXML) {

    },
    /*
    * This method makes the ajax call that gets data.
    */
    getDataFromServer: function (columns, controller, action, methodType) {
        try {

            if (columns.length == 0) {
                alert("There are no columns defined for this conrtroller.");
                return;
            }

            /* create a list of all of the columns for this view passed in from the server. Each row
               contains all the information needed for a cell to render itself. */
            dashboardColumns = {};
            $.each(columns, function (index, column) {
                dashboardColumns[column.ClassName] = column;
            });

            var currUrl = "/" + controller + "/" + action;

            var jsonData = JSON.stringify(searchCriteria);

            /* Now go and get the projects */
            $.ajax({
                /* load from local JSON file for testing */
                //url: "../Repository/SiterraProjectHetRepo.json",
                /* load from web service */
                url: this.serviceAPI + currUrl,
                type: methodType,
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                data: jsonData,
                async: true,
                success: function (response) {
                    cached[cachedResponseIndex] = response;
                    ProjectList.renderPage(response);
                },
                error: function (error) {
                    ProjectList.getProjectsError(error);
                },
            });
        } catch (ex) {
            alert('Something went wrong in getDataFromServer!\n' + ex);;
        }
    }, renderPage: function (response) {
        /***
         * This method takes JSON as a parameter and uses it to render the DataTables object.
        */
        var x = response;
        try {

            /* create the table to load DataTable data into */
            var siterraTable = $("<table></table>", { id: "siterraProjects", class: "display table table-striped table-bordered table-condensed" })
            var thead = $("<thead></thead>", { id: "mainHeaderRow" });
            var tbody = $("<tbody></tbody>", { id: "bodyRow" });
            var trNoRecord = $("<tr></tr>", { id: "noRecordsRow" });
            var tdNoRecord = $("<td></td>", { class: "label-warning" }).html("No records found!");
            var tfoot = $("<tfoot></tfoot>", { id: "mainFooterRow" });

            trNoRecord.append(tdNoRecord);
            tbody.append(trNoRecord);

            saved_siterra_table = siterraTable.clone();

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
            siterraTable.append(thead, tbody, tfoot);

            $("#page-header").remove()

            $("#FilterDiv").after($pageHeaderDiv);
            $("#page-header").after(siterraTable);

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

            dTable = $('#siterraProjects').DataTable({
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
                dom: '<"float-left input-sm"i><"float-left input-sm"l><"input-sm global-search"f>rtp',
                //dom: "<'row'<'col-sm-6 bottom-space'B>>" +
                //    '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-tl ui-corner-tr"lfr>' +
                //        't' +  '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-bl ui-corner-br"ip>',
                buttons: [
                    'copy',
                    'excel',
                    'csv',
                    'pdf',
                    'print'
                ],

                fnInitComplete: function () {
                    /* this is the datatable object itself */
                    that = this;

                    /* When the notes add/save icon is clicked ... */
                    $("a[class='metadataAdd']").on("click", function (event) {
                        var iTag = $(this).find("i");
                        var c = iTag.attr("class");
                        if (c == glyphAdd) {
                            iTag.attr("class", glyphSave);
                            $(this).parent().find(".metadataEdit").hide();
                            $(this).find("span").html(save);
                        }
                        else if (iTag.attr("class") == glyphSave) {
                            iTag.attr("class", glyphAdd);
                            $(this).parent().find(".metadataEdit").show();
                            var targetDiv = "Metadata-" + $(this).attr("data-class-name") + "-" + $(this).attr("data-row-num");

                            var dataTableNodes = that.fnGetNodes();
                            var metadataDiv = $("#" + targetDiv, dataTableNodes);
                            var dataId = metadataDiv.attr("data-data-id");

                            var className = $(this).attr("data-class-name");  //Attach_To
                            var rowNum = $(this).attr("data-row-num");
                            var name = $(this).attr("data-display-name");
                            var projectNum = $(this).attr("data-project-number");
                            var textAreaValue = $(this).parent().find(".form-control").val();
                            $(this).parent().find(".form-control").val("");
                            $(this).find("span").html(addNote);

                            ProjectList.postMetadata(dataId, className, rowNum, name, textAreaValue, projectNum, searchCriteria.Temlate), false;
                        }
                    });

                    $("a[class='metadataEdit']").on("click", function (event) {
                        var iTag = $(this).find("i");
                        var c = iTag.attr("class");
                        if (c == glyphEdit) {
                            iTag.attr("class", glyphSave);
                            var metadataDivNotes = ".Metatdata-" + $(this).attr("data-class-name") + "-" + $(this).attr("data-row-num");
                            $(this).parent().find(".form-control").val($(this).parent().find(".metadata-div")[0].innerText);
                            $(this).parent().find(".metadataAdd").hide();
                            $(this).find("span").html(save);
                        }
                        else if (iTag.attr("class") == glyphSave) {
                            iTag.attr("class", glyphEdit);
                            $(this).parent().find(".metadataAdd").show();
                            var targetDiv = "Metadata-" + $(this).attr("data-class-name") + "-" + $(this).attr("data-row-num");

                            var dataTableNodes = that.fnGetNodes();
                            var metadataDiv = $("#" + targetDiv, dataTableNodes);
                            var dataId = metadataDiv.attr("data-data-id");

                            var className = $(this).attr("data-class-name");  //Attach_To
                            var rowNum = $(this).attr("data-row-num");
                            var name = $(this).attr("data-display-name");
                            var projectNum = $(this).attr("data-project-number");
                            var textAreaValue = $(this).parent().find(".form-control").val().replace(new RegExp('\r?\n', 'g'), '<br />');
                            $(this).parent().find(".form-control").val("");
                            $(this).find("span").html(editNotes);

                            ProjectList.postMetadata(dataId, className, rowNum, name, textAreaValue, projectNum, true);
                        }
                    });
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
            api = $('#siterraProjects').DataTable()
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
                        
                        var s = "";
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

            $("#CriteriaOne").val(searchCriteria.CriteriaOne);
            $("#CriteriaTwo").val(searchCriteria.CriteriaTwo);
            $("#CriteriaThree").val(searchCriteria.CriteriaThree);
            $("#CriteriaFour").val(searchCriteria.CriteriaFour);
            $("#CriteriaFive").val(searchCriteria.CriteriaFive);
            $("#CustomProjectTypeFilter").val(searchCriteria.CustomProjectTypeList);

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
                            $(this).text("Show Search Box");
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
            var table = $('#siterraProjects');

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
                ProjectList.createPopover(columnToAdd, row, milestone);
            }
            /* if this column had a detail row, then add a link and create the hidden detail row. */
            if (columnToAdd.HasDetailRow) {
                ProjectList.createDetailRow(row, columnToAdd, milestone, item);
            }
            /* This method needs to be refractored.  Currently it creates a textarea named Notes that id editable by the user. */
            if (columnToAdd.HasEditableTextarea) {
                ProjectList.createTextarea(columnToAdd, row, item[columnToAdd.ClassName]);
            } 
            if (columnToAdd.HasEditableTextbox) {
                //ProjectList.createTextarea(columnToAdd.ClassName, row, item.Metadata.Data);
            }

        } catch (ex) {
            alert('Something went wrong in setColumnValues!\n' + ex);
        }

    }, createPopover: function (columnToAdd, row, milestone) {
        /* There are three objects created.
            1. A popover that displays predecessor task information.
            2. A tooltip for each predecessor that displays completed/due date 
            3. A modal that displays predecessor task details. (after clicking on a predecessor)
        */

        try {
            var titleValue = "";
            var returnValue = "";

            if (dashboardColumns[columnToAdd.ClassName].DisplayType == "Milestone") {
                titleValue = '<div class="small">Milestone Info</div>';
                returnValue = milestone.PredecessorString;
            }

            else {
                titleValue = 'A Popup';
                returnValue = "<h4>Have not defined what to display yet.</h4>"
            }

            var genericCloseBtnHtml = '<button onclick="$(this).closest(\'div.popover\').popover(\'hide\');" type="button" class="close pull-right pull-up" aria-hidden="true">&times;</button>';
            /* Popover that displays predecessor tasks */
            var id = columnToAdd.ClassName + columnToAdd.ColumnPosition + '-' + row.getAttribute("data-row-num");
            var td = $('td', row).eq(columnToAdd.ColumnActualPosition).attr("id", id);

            td.popover({
                toggle: 'popover',
                placement: 'auto right',
                container: 'body',
                trigger: 'focus',
                html: true,
                title: "<div class='popover-title'>" + titleValue + genericCloseBtnHtml + "</div>",
                template: popoverTemplate
                    , content: function () {
                        return ProjectList.getPredecessors(
                                row.getAttribute("data-project-number"),
                                milestone.ProjectTemplate,
                                milestone.PredecessorString,+
                                columnToAdd.ClassName,
                                columnToAdd.SelectorClass,
                                row.getAttribute("data-row-num"),
                                row);
                    }
            });


            td.on("click", function (event) {
                td.popover("show");
            });

        } catch (ex) {
            alert('Something went wrong in createPopover!\n' + ex);
        }
    }, createTaskDetailsTable: function (className, targetId, currRowNum, predecessorTasks) {
        /* This method does three things:
            1. Create a popover that will display high level info aabout predecessor tasks.
            2. Create a tooltip that will display on hover of predecessors.
            3. Create a modal with predecessor deatils that displays when a predecessor id is clicked.
        */
        try {
            var dataIndex = currRowNum - 1;
            var predecessors = "";
            var isComplete = true;

            var currentHtml = "";
            var comma = "";
            
            /* This is the popoever with high level details */
            var $tooltip_table = $("<table></table>", { class: "table table-striped table-bordered table-condensed" });
            /* This is the modal that conotains details */
            var $detail_table = $("<table></table>", { class: "table table-striped table-bordered table-condensed" });

            /* represents a cell in the tooltip_table.  Will contain a list of predecessor tasks */
            var $td = $("<td></td>");

            /* Header row for the detail_table */
            $th1 = $("<th></th>").append("Task Name");;
            $th3 = $("<th></th>").append("Due Date");
            $th4 = $("<th></th>").append("Completed Date");
            $th5 = $("<th></th>").append("Overdue?");
            $header_row = $("<tr></tr>").append($th1, $th3, $th4, $th5);
            $detail_table.append($header_row);

            $.each(predecessorTasks, function (i, predecessor) {
                ////////////////
                /* First half of loop creates deatails of a predecessor for the details table. */ 
                var $t1 = $("<td></td>").append(predecessor.TaskTemplate);
                var $t3 = $("<td></td>").append(predecessor.TaskDueDate);
                var $t4 = $("<td></td>").append(predecessor.TaskCompleteDate);
                var $t5 = $("<td></td>");

                var now = moment();
                var due = moment(predecessor.TaskDueDate);
                var overdue = due.add(TASK_DUE_GRACE_PERIOD, 'days');

                if (predecessor.TaskStatus == "Complete")
                    $t5.append("Complete");
                else if (overdue < now)
                    $t5.append("Overdue");
                else
                    $t5.append("Inactive");

                var detail_row = $("<tr></tr>").append($t1, $t3, $t4, $t5);
                /* End create pedecessor details, now add it to the table */
                $detail_table.append(detail_row);


                $("#myModal").on("show.bs.modal", function () {
                    var modal = $(this);
                    modal.find('.modal-title').html("Predecessors for Milestone." )
                    modal.find('.modal-body').html($detail_table);
                    //$("#predecessorDetals").html($detail_table);
                });
                /* End of creating details for details table */
                ////////////////

                ////////////////
                /* Second half of loop create a link and tooltip for one of the predecessors.
                   Note that each iteration creates an <a> representing a predessor and a tooltip
                   that appears when hovering over that predecessor */

                /* represents a predecessor task.  Will be a list of these in the tooltip table */
                var $a = $("a[class='milestoneListElement']").clone();

                /* on first time through, do not put a comma in the list */
                if (currentHtml != "") {
                    comma = ",";
                }

                currentHtml = "addComment";

                /* message that displays when hover over predecessor id */
                var tooltipMsg = "";

                if (predecessor.TaskCompleteDate != undefined && predecessor.TaskCompleteDate != null) {
                    tooltipMsg = "Completed on: " + predecessor.TaskCompleteDate.split("T")[0];
                    $a.attr("class", "green milestoneListElement");
                }
                else {
                    var now = moment();
                    var due = moment(predecessor.TaskDueDate);
                    var overdue = due.add(TASK_DUE_GRACE_PERIOD, 'days');

                    if (overdue < now) {
                        $a.attr("class", "red milestoneListElement");
                    }
                    tooltipMsg = "Due Date: " + predecessor.TaskDueDate.split("T")[0];
                }

                $a.html(predecessor.TaskNumber);

                /* toggle tool tip on hover */
                $('a[data-toggle="tooltip"]').tooltip({
                    toggle: 'tooltip',
                    trigger: 'hover',
                    placement: 'right',
                    title: function () {
                        return tooltipMsg;
                    }
                })

                /* add this predecessor to the list */
                $td.append(comma);
                $td.append($a);

                comma = "";
            })

            $('a[data-toggle="tooltip"]').click(function () {
                $("#myModal").modal("show", function () {})
            })

            var $tr = $("<tr></tr>");
            $tr.append("<td>Predecessor Task Ids</td>");
            $tr.append($td);
            $tooltip_table.append($tr);


            //     $("#" + targetId).html($tooltip_table);

            return $tooltip_table;

        } catch (ex) {
            alert('Something went wrong in createTaskDetailsTable!\n' + ex);
        }
    }, createDetailRow: function (row, columnToAdd, milestone, item) {
        try {

            var $newRowLink = $("<a>", { class: 'addRowLink', html: milestone }).on("click", function (event) {
                if (!$("#detail-row-" + columnToAdd.ClassName + "-" + row.setAttribute("data-project-number") + "-" + row.setAttribute("data-row-num")).attr("id")) {

                    var text = "";
                    var detailColumnsArray  = columnToAdd.DetailColumns.replace("[", "").replace("]", "").split(',');
                    if (detailColumnsArray) {
                        $.each(detailColumnsArray, function (index, columnName) {
                            text += "<td><strong>" + columnName + "</strong>: " + item[columnName] + "</td>";
                        })
                    }
                    else {
                        test = "<td>No details</td>";
                    }

                    var table = "<tr id=\"detail-row-" + columnToAdd.ClassName + "-" + row.setAttribute("data-project-number") + "-" + row.setAttribute("data-row-num") + "\" data-exists=\"true\"><td colspan=" + $("table").find("tr:first td").length + ">" +
                        "<table class='table table-striped table-bordered table-condensed details-row'><tr><td>" + columnToAdd.ClassName +
                        " Details<a class='hideMe');\">" +
                        " (hide)</a></td>" + text + "</tr></table></td></tr>";
                    ProjectList.addRow(this, event, table);

                    $("#detail-row-" + columnToAdd.ClassName + "-" + row.setAttribute("data-project-number") + "-" + row.setAttribute("data-row-num")).on("click", function () { $(this).remove(); });
                }
            });
            $('td', row).eq(columnToAdd.ColumnActualPosition).html($newRowLink);
        } catch (ex) {
            alert('Something went wrong in createDetailRow!\n' + ex);
        }
    }, addRow: function (currentObject, event, htmlToAdd) {
        try {
            //var numColumns = $(".table").find("tr:first td").length;
            //$(currentObject).parent().parent().after(htmlToAdd);
            $(currentObject).closest("tr").after(htmlToAdd);
        } catch (ex) {
            alert('Something went wrong in addRow!\n' + ex);
        }
    }, createTextarea: function (column, row, data) {
        /* Structure:
                                             TD
                                              |
                        ________________________________________________
                       /              /              \                   \
       div1(metadata-div)    a1(metadataAdd)       a2(metadataEdit)    div2(textarea-div)
               |            /     /       \           /        \            \
        <display value>    br     i      span         i       span      textarea
                                  |        |          |         |
                               glyphadd  "Add"    glyphedit  "Edit" 

        div1: id = Metadata-Notes-<row number>
        a1: Metadata-add-<row number>
        a2: Metadata-edit-<row number>
        */

        var metaId = "Metadata-" + column.ClassName + "-" +row.getAttribute("data-row-num");
        var metadataDiv = $("<div></div>", { id: metaId, html: data.Value, class: "metadata-div" });
        /* DataId is the primary key for this metadata in the data table */
        metadataDiv.attr("data-data-id", data.DataId);
    
        var span = $("<span></span>", {class: "left-space right-space", html: addNote});
        var i = $("<i></i>", { class: glyphAdd});
        var br = $("<br/>");
 
        var span2 = $("<span></span>", { class: "left-space", html: editNotes });
        var i2 = $("<i></i>", { class: glyphEdit});

        var aHref = "#Textarea-" +column.ClassName + "-" +row.getAttribute("data-row-num");
        var a1 = $("<a></a>", { href: aHref, class: "metadataAdd" }); 
        a1.attr("data-toggle", "collapse");
        a1.attr("data-class-name", column.ClassName);
        a1.attr("data-row-num", row.getAttribute("data-row-num"));
        a1.attr("data-display-name", column.DisplayName);
        a1.attr("data-project-number", row.getAttribute("data-project-number"));
        a1.append(br, i, span);

        var a2 = $("<a></a>", { href: aHref, class: "metadataEdit" });
        a2.attr("data-toggle", "collapse");
        a2.attr("data-class-name", column.ClassName);
        a2.attr("data-row-num", row.getAttribute("data-row-num"));
        a2.attr("data-display-name", column.DisplayName);
        a2.attr("data-project-number", row.getAttribute("data-project-number"));
        a2.append(i2, span2);

        var divId = "Textarea-" + column.ClassName + "-" +row.getAttribute("data-row-num");
        var textarea = $("<textarea></textarea>", { class: "form-control", rows: "5", width: "300px" });
        var div = $("<div></div>", { id: divId, class : "collapse textarea-div"});
        div.append(textarea);
        $('td', row).eq(column.ColumnActualPosition-1).html(metadataDiv).append(a1, a2, div);
        var v = $('td', row).eq(column.ColumnActualPosition - 1);
        return false;


    }, createTextbox: function (className, row, Metadata) {

        //var divSlider = $("#Textarea_NUM_").clone(true);
        //divSlider.attr("id", "Textarea" + row.attr("data-row-num"));

        //var metadataDiv = $("#Metadata_NUM_").clone(true);
        //metadataDiv.attr("id", className + row.attr("data-row-num"));
        //metadataDiv.html(Metadata.Data[0].Value);

        //var editSaveLink = $("#editSaveLink_NUM_").clone(true);
        //editSaveLink.attr("id", "editSaveLink" + row.attr("data-row-num"));
        //editSaveLink.attr("data-class-name", className);
        //editSaveLink.attr("href", "#Textarea" + row.attr("data-row-num"));
        ///* NOTE THAT PROJECT NUMBER MUST ALWAYS BE PASSED */
        //editSaveLink.attr("data-project-number", item.ProjectNumber);
        //editSaveLink.attr("data-data-id", Metadata.Data[0].DataId);
        //editSaveLink.attr("style", "visibility: visible")

        //$("." + className, row).append(metadataDiv, editSaveLink, divSlider);
        //$("." + className, row).css("width", "300");

    }, postMetadata: function (dataId, attachTo, rowNum, name, value, projectNumber, replace) {
        try {
            var currentUrl = "";
            if (dataId == undefined || dataId == null || dataId == "") {
                currentUrl = 'insertMetadata/?projectNumber=' + projectNumber + "&rowNumber=" + rowNum;// + "&template=" + template;
            }
            else if ( replace != null && replace != undefined)
                currentUrl = 'updateMetadata/?replace=' + replace
            else
                currentUrl = 'updateMetadata/?replace=false'
            /* params: DataId, AttachTo, RowNum, Name, Value */
            var tiut = new pmDashboardModels.Data(dataId, attachTo, rowNum, name, value);

            $.ajax({
                url: this.serviceAPI + "SiterraProject/" + currentUrl,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                data: JSON.stringify(tiut),
                async: true,
                success: function (response) { ProjectList.updateMetadata(response); },
                error: function (error) { ProjectList.getProjectsError(error); },
            });
        } catch (ex) {
            alert('Something went wrong in postMetadata!\n' + ex);
        }
    }, updateMetadata: function (data) {
        try {
            var rowNum = data.RowNum;
            var targetDiv = "#Metadata-" + data.Name + "-" + rowNum;
            $(targetDiv).html(data.Value);
            $(targetDiv).attr("data-data-id", data.DataId);
        } catch (ex) {
            alert('Something went wrong in updateMetadata!\n' + ex);
        }
    }, getPredecessors: function(projectNumber, projectTemplate, predecessorString, className, targetId, currRowNum, row) {
        
        searchCriteria.ProjectNumber = parseInt(projectNumber);
        searchCriteria.ProjectTemplate = projectTemplate;
        searchCriteria.PredecessorString = predecessorString;

        var jsonData = JSON.stringify(searchCriteria);

        $.ajax({
            url: this.serviceAPI + "SiterraProject/getPredecessors",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            data: jsonData,
            async: true,
            success: function (response) {
                /* when asynch call returns, put the predecessor deatails into the object returned below */
                $("#" + "predecessors").html(ProjectList.createTaskDetailsTable(className, targetId, currRowNum, response));
                return $("#" + "predecessors")[0].outerHTML;
            },
            error: function (error) { ProjectList.getProjectsError(error); },
        });
        /* Immediately return the object that will hold the popover detail */
        return $("#" + "predecessors")[0].outerHTML;

    },
    /***
     * Call http method and send the JSON to the controller at path.
     */
    callHttpMethod: function (path, httpMethod, jsonData, successMethod, errorMethod) {
        try {                
            $.ajax({  
                url: this.serviceAPI + path,
                type: httpMethod,
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                data: jsonData,
                async: true,
                success: function (response) {
                    if(successMethod !== null && successMethod != 'Undefined')
                        successMethod.onSuccess();
                },
                error: function (error) {
                    if(errorMethod != null && errorMethod != 'Undefined')
                        errorMethod.onError();
                    alert("Error calling service: " + path + " using method: " + httpMethod);
                },
            });
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