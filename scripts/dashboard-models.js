
var pmDashboardModels = {
    Metadata: function (pId, ProjectNumber, JSDataObject, RowNum) {
        this.projectId = pId; /* Note that this is populated from the client */
        this.ProjectNumber = ProjectNumber;
        this.Data = JSDataObject; /* Must be an instance of the Data object below */
        this.RowNum = RowNum;/*This is the row in the html table*/
    },

    Data: function (DataId, AttachTo, RowNum, Name, Value, /* Optional */ Order, IsMilestone, Type, MetadataId ) {
        this.DataId = DataId;       /* The unique indentier for this metadata. This property is not in the Data JSON used to import data */
        this.AttachTo = AttachTo;   /* The class that this metadata will be appended to. */
        this.RowNum = RowNum;       /* The row this data dispays in.  When data is updated, this lets the UI know what row to put it in */
        this.Name = Name;           /* The header displayed for this metadata */
        this.Value = Value;         /* The value to be dispalyed */

        /* Optional */
        this.Type = Type;           /* Textarea, Dropdown, Textbox ect... */
        this.Order = Order;         /* If there is more than one metatdata value attached to this class, the order to display them. */
        this.MetadataId = MetadataId;    /* Foriegn Key */
    },
    View: function (Columns, Template, DataType, Name, Active, OwnerUserid, IsEditable, /*optional*/ ViewId, /*optional*/ Controller) {
        this.Columns = Columns;     /* Array of columns for a view */
        this.Template = Template;   /* Template:  Candidate Analysis, New Build, Modification */
        this.DataType = DataType;   /* Type of data being sought:  Siterra, NbPipeline or ModPipeline */
        this.Name = Name;           /* Name for the view */
        this.Active = Active;       /* is this view active */
        this.OwnerUserid = OwnerUserid; /* The person who uses this view */
        this.IsEditable = IsEditable;   /* Can this view be edited */
        this.ViewId = ViewId;       /* unique id of this view */
        this.Controller = Controller;
    },
    SearchCriteria: function(ViewId, Template, CriteriaOne, CriteriaTwo, CriteriaFour) {
        this.ViewId = ViewId;
        this.Template = Template;
        this.CriteriaOne = CriteriaOne;
        this.CriteriaTwo = CriteriaTwo;
        this.CriteriaThree = "";
        this.CriteriaFour = CriteriaFour;
        this.CustomProjectTypeList = "";
        this.CriteriaFive = "";
        this.ProjectNumber = -1;
        this.ProjectTemplate = "";
        this.PredecessorString = "";
    }
}