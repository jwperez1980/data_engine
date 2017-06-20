using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEngine.Model.Common
{
    public class Column
    {
        public Column() { }

        [Key]
        [Column(Order = 1)]
        public int ColumnId { get; set; }
        public int ColumnNumber { get; set; }
        /// <summary>
        /// The position in the array of columns sent in the response.  This does NOT give the actual
        /// position on the page because some columns could be hidden.  To find the position of the visible
        /// columns on the page use the ColumnActualPosition property.
        /// </summary>
        public int ColumnPosition { get; set; }
        /// <summary>
        /// This value is -1 for hidden columns.  For visible columns this is the position of the column in the table.
        /// </summary>
        public int ColumnActualPosition {get;set;}
        public string DisplayName { get; set; }
        public string ClassName { get; set; }
        public string SelectorClass { get; set; }
        public string DisplayType { get; set; }
        public bool IsVisible { get; set; }
        public bool HasPopover { get; set; }
        public bool HasDialog { get; set; }
        public bool HasTooltip { get; set; }
        public bool HasDetailRow { get; set; }
        public bool HasEditableTextarea { get; set; }
        public bool HasEditableTextbox { get; set; }
        public string CssProperties { get; set; }
        public string DetailColumns { get; set; }
        public string Role { get; set; }
    }
}