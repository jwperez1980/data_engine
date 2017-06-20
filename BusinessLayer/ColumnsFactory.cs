using DataEngine.Model.Common;
using System.Collections.Generic;

namespace DataEngine.BusinessLayer
{
    public class ColumnsFactory
    {
        public List<Column> CreateColumns(List<string> columnNameList)
        {
            List<Column> columnList = new List<Column>();
            foreach (string name in columnNameList)
            {
                Column column = new Column();
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

                columnList.Add(column);

                columnList.Add(column);
            }
            return columnList;
        }
    }
}