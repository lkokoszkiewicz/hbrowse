
# How does it work? #
Application works in a loop of mutual dependency between 3 main aspects:
  * Bookmarking URLs
  * Data model
  * View
Basically when we want to change the content of the page we will first modify the URL. The change like this will be noticed by an application and, based on URL, internal data model will be updated. At the end, view will be generated based on data stored in a model:

<img src='http://hbrowse.googlecode.com/files/wui.working.loop.png' alt='WUI Components' />

# Model overview #
All the application data are stored inside Data model which is defined in data.js file. Settings lets you access the data model in various places so it's important to understand it's structure. Data stored inside data model are split onto 2 parts, operating data and cached data. Operating data are used to display proper informations on the screen and they consists informations like user name, time periods, interface settings etc. Cached data are used in various situations like charts drawing or additional requests etc. Here is the structure with default data:
```
var Data = {
    var State = {
        user: settings.user,
        refresh: settings.refresh,
        table: settings.table,
        p: settings.p,
        records: 25,
        sorting: settings.sorting,
        or: settings.or, // opened table rows
        uparam: settings.uparam, // user defined params (for params that cannot be shared between use cases)
        activemenu: 0,
        
        noreload: false,
        
        filters: {},
        breadcrumbs: [],
        
        // Stored Data
        mem: {
            users: [],
            table: {
                user: '',
                timestamp: 0,
                data: [],
                json:{}
            },
            filters:{},
            onload:{}
        }
    };
}
```
# Brief modules overview #
Application consists of 3 main modules that are used in presentation layer.

<img src='http://hbrowse.googlecode.com/files/hbrowse-components.png' alt='WUI Components' />

  * **lkfw.datatable plugin** - jQuery datatables plugin overlay that expands it's original functionality.
  * **lkfw.searchable.list plugin** - jQuery livesearch plugin overlay fitted to the needs of the monitoring application.
  * **Google Charts** - Task Monitoring Web UI uses google's chart service to draw data plots.

First two modules can be used separately in other application as a simple jQuery plugin. All you need to is to copy a component file and associated libraries.

## lkfw.searchable.list plugin ##
This plugin can be used outside of the parent application as a separate jQuery plugin.

Required libraries:
  * jquery-1.4.2.min.js
  * quicksilver.js
  * jquery.livesearch.js
Options:
| **Option** | **Description** |
|:-----------|:----------------|
| listId | **/string/** Id prefix of the searchable list html element |
| srchFieldId | **/string/** Id prefix of the html input search field |
| items | **/array/** Simple array of searchable items |
| srchFldLbl | **/string/** Label of the input search field |

Initialization example:
```
$('#someDiv').lkfw_searchableList({
    listId: 'users',
    srchFieldId: 'usersSrch',
    items: ['user1','user2','user3'],
    srchFldLbl: 'Search'
});
```

## lkfw.datatable plugin ##
This plugin can be used outside of the parent application as a separate jQuery plugin.

Required libraries:
  * jquery-1.4.2.min.js
  * jquery.dataTables.min.js
Options:
| **Option** | **Description** |
|:-----------|:----------------|
| dTable | **/array/** Array that stores all dataTable objects (tables), if you want to create more that one you can refer to anyone of them by index number. |
| tableId | **/string/** Data Table html id |
| items | **/array/** Array of table content. In practice it's an array of arrays, each sub-array represents a table row. Sub-arrays lengths have to be equal to column labels (headers) number. |
| tblLabels | **/array/** Simple array of column labels (headers). |
| dataTable | **/dictionary/** Dictionary of dataTables jQuery plugin specific properties (see: http://www.datatables.net/usage/options) |
| expandableRows | **/bool/** True or false depending on either you want rows to expand or not. |
| multipleER | **/bool/** True or false depending on either you want multiple rows to expand or only one. |
| rowsToExpand | **/array/** Array of rows ids. All of the rows from this list will be expanded on initialization. |
| sorting | **/array/** aaSorting dataTables option (see: http://www.datatables.net/usage/options) |
| fnERContent | **/function/** This function provides data for expanded rows. As an input, it takes table data row id (id are sorted "as provided" in _items_ property). It should return the following structure:<br />`{`<br />`'properties':[['property1','value1'],['property2','value2'],...],`<br />`'table':{'tblLabels':['colLabel1','colLabel2','colLabel3',...],'tblData':[['rowData1','rowData2','rowData3',...],...]},`<br />`'html':'some custom html...'`<br />`}`<br />The content of expandable row can differ according to what is needed. Data Tables and property-value lists are supported but also, thru custom html, such elements like google charts and many more. |
| fnERClose | **/function/** This method is called on expanded row close event and it's used to do some post processing operations. As an input, it takes table data row id (id are sorted "as provided" in _items_ property) |
| fnContentChange | **/function/** This method is called on any data table content change caused by, for example, sorting change, page change etc. |
| fnTableSorting | **/function/** Additional method to handle sorting changes events. In the jTaskMonitoring application is used to accordingly setup URL hash. |

Initialization example:
```
$('#someDiv').lkfw_dataTable({
    dTable: someVariable,
    tableId: 'mains',
    expandableRows: true,
    multipleER: false,
    items: [['row0val1','row0val2','row0val3'],['row1val1','row1val2','row1val3']],
    tblLabels: ['colname1','colname2','colname3'],
    rowsToExpand: [],
    sorting: [1,'desc'],
    fnERContent:function(dataID){ return thisRef.expand_click(dataID) },
    fnContentChange: function(el) { thisRef.mainsTableContent_change(el) },
    fnERClose: function(dataID) { thisRef.erClose_click(dataID) },
    fnTableSorting: function(el) { thisRef.tableSorting_click(el,thisRef.mainsTable[0]) },
    dataTable: {
        iDisplayLength: 25,
        sPaginationType: "input",
        bLengthChange: false
    }
});
```