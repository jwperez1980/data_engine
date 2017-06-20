var optionsElements = document.getElementById('options');
//var options2Elements = document.getElementById('options2');
//var options3Elements = document.getElementById('options3');
//var options4Elements = document.getElementById('options4');
////var options5Elements = document.getElementById('options4');
//var options6Elements = document.getElementById('options6');

var currentViewId = -1;

var Mode = {
    mode: "Search",
    get: function () {
        return this.mode;
    },
    set: function(mode) {
        if (mode == "Search")
            this.mode = mode;
        else if (mode == "Edit")
            this.mode = mode;
        else if (mode = "Create")
            this.mode = mode;
        else
            this.mode = "Search";

        $("#mode").text(this.mode);

    }
}

var sortable = Sortable.create(optionsElements, {
    group: {
        name: 'options',
        pull: 'clone',
    },
    animation: 100,
});

function createSortable() {
    sortable = Sortable.create(options, {
        group: {
            name: 'options',
            pull: 'clone',
        },
        animation: 100,
    });
}

var sortable = Sortable.create(options2, {
    group: {
        name: 'options2',
        pull: 'clone',
    },
    animation: 100,
});

var sortable1 = Sortable.create(options3, {
    group: {
        name: 'options3',
        pull: 'true',
    },
    animation: 100,
});

var sortable5 = Sortable.create(options5, {
    group: {
        name: 'options5',
        pull: 'true',
    },
    animation: 100,
});

var sortable6 = Sortable.create(options6, {
    group: {
        name: 'options6',
        pull: 'true',
    },
    animation: 100,
});

var sortable = Sortable.create(options7, {
    group: {
        name: 'options7',
        pull: 'clone',
    },
    animation: 100,
});

var sortable2 = Sortable.create(options4, {
    group: {
        name: 'options4',
        put: ['options', 'options2', 'options3', 'options5', 'options6', 'options7']
    },
    animation: 100,
    filter: '.ignore-this',
    onAdd: function (event) {
        $(event.item).addClass('md');
        var i = document.createElement('i');
        i.className = 'fa fa-times pull-right ignore-this';
        event.item.innerHTML += ' ';
        event.item.appendChild(i);
        ModelView.addClickEvent(i);
        var i = document.createElement('i');
        i.className = 'fa fa-wrench pull-right ignore-this';
        event.item.appendChild(i);
        //Sortable.options
        ModelView.editClickEvent(i);
    }
});
/*************
 ** THe ModelView Object
 *************/
var ModelView = {
    url: "<must be set on page load in loadViews method>",
    deleteElement: function (event) {
        $(event.currentTarget.parentNode).remove();
    },
    removeContentsOfSortable2: function () {
        $("#options4").each(function (index) {
            $($('.fa-times', $(this))).trigger("click");
        })
    },
    editElement: function (event) {
        alert('hello');
    },
    addClickEvent: function (element) {
        $(element).on('click', ModelView.deleteElement);
    },
    editClickEvent: function (element) {
        $(element).on('click', ModelView.editElement);
    },
    Reset: function() {
        ModelView.removeContentsOfSortable2();
        currentViewId = -1;
        $("#view-name").val("");
        Mode.set("Create");
        $("#mode-description").html("");
        //document.getElementById("myText").placeholder;
    },

    /*************
     * The three methods are called on page load to initially get the views and put
     * them into the dropdown.
     * 
     * Get all of the views that have been defined so they can be displayed in the drop down.
     */
    getViews: function (url, query) {

        var admin = "";
        if (query.indexOf("admin") >= 0) {
            admin = "?admin=true";
        }

        this.url = url;
        try {
            $.ajax({
                url: url + "SiterraProject/getViews/" + admin,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                async: true,
                success: function (response) {
                    ModelView.getViewsResponseAction(response);
                },
                error: function (error) {
                    alert("Error getting views.");
                },
            });
        } catch (error) {
            alert("Error in getViews");
        }
    },
    /***
     * The views have been retrieved from the server.  Now put
     * them in the dropdown list.
     */
    getViewsResponseAction: function (response) {
        try {
            //First empty the dropdown list
            $("#displayProjectsDropdown").empty();
            //append each of the views to the dropdow  list
            $a = $("<a>", { class: "display-projects", href: "#" });
            $.each(response, function (index, view) {
                var $clone_a = $a.clone();
                $clone_a.text(view.Name);
                $clone_a.attr("data-viewid", view.ViewId);
                $clone_a.attr("data-template", view.Template);
                $clone_a.attr("data-table-header", view.Name);
                var $li = $("<li>").append($clone_a);

                /* click on a view in the drop down */
                $clone_a.on("click", function (event) {
                    currentViewId = view.ViewId;
                    ModelView.simluateDrag(view.ViewId, view.Columns, view.DataType, view.Template, view.Name);
                })
                $("li.dropdown ul.dropdown-menu").append($li);
            })
        } catch (error) {
            alert("Error in responseAction.");
        }
    },
    /*************
     * End of the initiallizing methods.
     ***/


    /*************
     * The next methods are for saving a view to the DB.
     *
     * Prompt the user to if this is an ` that it will overwrite
     * the view with the new configuration.
     ***/
    promptUserBeforeUpdate: function() {
        var viewname = $("#view-name").val();
        var template = $("#TemplateChoice").val();

        $('.modal-content > .modal-footer > .btn-primary').click(function (event) {
                ModelView.saveView();
        });

        /* Prompt user */
        if (Mode.get() == "Edit") {
            $("div.modal-footer > .btn-primary").prop('disabled', false);
            $("div.modal-header").html("<label class='red-text'>WARNING!!</label>");
            $("p.modal-details").html("You are in edit mode and are editing the <strong>'" + viewname + "'</strong> view.  <ul><li>If you DO NOT wish to overwrite, click cancel and change the View Name.</li><li>To continue and overwrite <strong>'" + viewname + "'</strong>, click continue.");
            $("#myModal").modal("show", function () { });
            var x = "Eidt"
        }
        else {
            ModelView.saveView();
        }
    },
    /***
     * Save the view that has been created.
     */
    saveView: function () {
        var viewname = $("#view-name").val();
        var templateArray = $("#TemplateChoice").val().split("/");
        var template = templateArray[0];
        var dataType = templateArray[1];

        if (viewname == null || viewname == "" || template == null || template == "") {
            $("div.modal-footer > .btn-primary").prop('disabled', true);
            $("div.modal-header").html("<label class='red-text'>Problem with submit!!</label>");
            $("p.modal-details").html("Viewname and Template are required.  Please click cancel and try again.");
            $("#myModal").modal("show", function () {
            });
            return;
        }

        var domObjList = $("ul.view-list li");
        var id = domObjList[0].getAttribute("data-id");
        var view = domObjList[0].innerText;
        var columnIdArray = [];

        var viewIndex = 0;
        $.each(domObjList, function (index, domObj) {
            if (domObj.getAttribute("data-id"))
                columnIdArray[viewIndex++] = domObj.getAttribute("data-id");
        });

        if (columnIdArray.length == 0) {
            alert("You must drag at least one column to the right.");
            return;
        }

        var path = "SiterraProject/createView/";

        if (Mode.get() == "Edit") {
            path = "SiterraProject/createView/?Edit=true";
        }
        var view = new pmDashboardModels.View(columnIdArray.join([","]), template, dataType, viewname, true, "perjo5y", true);

        $("#view-name").val("");
        ModelView.removeContentsOfSortable2();
        currentViewId = -1;

        ModelView.callHttpMethod(path, JSON.stringify(view), "Post");
    },
    /***
     * Delete the view
     */
    deleteView: function () {
        if (Mode.get() != "Edit" ) {
            //$("div.modal-footer > .btn-primary").hide();
            $("div.modal-header").html("<label class='red-text'>Problem with delete!!</label>");
            $("p.modal-details").html("To delete a view you must first choose a View from the View dropdown and be in Edit mode.  Please click cancel and try again.");
            $("div.modal-footer > .btn-primary").prop('disabled', true);
            $("#myModal").modal("show", function () { });
            return;
        }

        path = "SiterraProject/deleteView";
        var view = new pmDashboardModels.View("", "", "", "", false, "perjo5y", true, currentViewId);
        $("#view-name").val("");
        ModelView.removeContentsOfSortable2();
        ModelView.callHttpMethod(path, JSON.stringify(view), "Delete");
    },
    /***
     * Call http method and send the JSON to the controller at path.
     */
    callHttpMethod: function (path, jsonData, httpMethod) {
        try {
                
            $.ajax({
                url: this.url + path,
                type: httpMethod,
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                data: jsonData,
                async: true,
                success: function (response) {

                   // $("div.modal-footer > .btn-primary").show();
                    Mode.set("Create");
                    ModelView.Reset();
                    ModelView.responseAction(response);
                },
                error: function (error) {
                    Mode.set("Create");
                    ModelView.Reset();
                    alert("Error calling service.");
                },
            });
        } catch (error) {
            alert("Error in callHttpMethod");
        }
    },

    /***
     * Something in the dropdown was clicked.  Load it into the modeling area
     * so it can be edited.
     */
    simluateDrag: function (viewId, columnIds, dataType, template, tableHeader) {
        Mode.set("Edit");
        ModelView.removeContentsOfSortable2();
        $("#mode-description").html("<i class='glyphicon glyphicon-hand-right red-text'></i>" + " " + tableHeader);
        ModelView.getColumns(viewId, columnIds, dataType, template, tableHeader);
    },
    /***
     * 
     */
    getColumns: function (viewId, columnIds, dataType, template, tableHeader) {
        try {
            var currentUrl = "getColumns/" + viewId;

            $.ajax({
                url: this.url + "SiterraProject/" + currentUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                async: false,
                success: function (response) { 
                    ModelView.addColumnsToView(response, viewId, columnIds, dataType, template, tableHeader);
                },
                error: function (error) {
                    ModelView.getProjectsError(error);
                },
            });
        } catch (ex) {
            alert('Something went wrong in getColumns!\n' + ex);
        }
    }, addColumnsToView: function (response, viewId, columnIds, dataType, template, tableHeader) {
        try {
            $.each(response, function (index, columnProperties) {
                var $li = $("<li>", { class: "box blue project md", draggable: false, text: columnProperties.ClassName }).attr("data-id", columnProperties.ColumnNumber);
                var $i = $("<i>", { class: "fa fa-times pull-right ignore-this" });
                ModelView.addClickEvent($i);
                var $i2 = $("<i>", { class: "fa fa-wrench pull-right ignore-this" });
                ModelView.addClickEvent($i2);
                $li.append($i, $i2);
                $("#drop-zone").before($li);
                $("#view-name").val(tableHeader);
                $("#TemplateChoice").val(template + "/" + dataType);
            });
        } catch (error) {
            alert('Something went wrong in getColumns!\n' + ex);
        }
    }, responseAction: function (response) {
        try {
            //append the new view to the list
            //var x = $("li.dropdown ul.dropdown-menu").append('<li><a class="display-projects" data-viewid="' + response.ViewId + '" data-template="All" data-table-header="Testing View" href="#">' + response.Name + '</a></li>');

            $("div.modal-footer > .btn-primary").prop('disabled', true);
            $("div.modal-footer > .btn-default").html("OK");
  //          var x = $("div.modal-footer > .btn-default");
            $("div.modal-header").html("<label class='green-text'>Success!</label>");
            $("p.modal-details").html(response);
            $("#myModal").modal("show", function () {});

            //$("div.modal-footer > .btn-primary").show();
            ModelView.getViews(this.url, window.location.search);
        } catch (error) {
            alert("Error in responseAction.");
        }
    }, getProjectsError: function (error) {
        var message = "In prod, need to get rid of this popup\r\n";
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

_.each($('.fa-times'), ModelView.addClickEvent);
_.each($('.fa-wrench'), ModelView.editClickEvent);