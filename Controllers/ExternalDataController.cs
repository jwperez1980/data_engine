using DataEngine.BusinessLayer;
using DataEngine.Model.Common;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using System.Collections.Generic;
using System.Dynamic;

namespace DataEngine.Controllers
{
    public class ExternalDataController : ApiController
    {

        // POST: api/CreateColumns/
        [HttpPost]
        [ActionName("createColumns")]
        public HttpResponseMessage SetColumns([System.Web.Http.FromBody] List<string> columnNameList)
        {
            ColumnsFactory factory = new ColumnsFactory();
            //Create a list of columns with default values
            List<Column> list = factory.CreateColumns(columnNameList);
            HttpResponseMessage resp = Request.CreateResponse(HttpStatusCode.OK, list);
            return resp;
        }
    }
}