

# Basics #
First thing to consider when setting up hBrowse UI application is your data server. Main and in fact only requirement is your server to be able to serve data in a json format for all of your views eg:
  * User selection list
  * Main content table (like jobs in Ganga)
  * Sub-content table (like subjobs in Ganga)
Json data format is not important because special translation functions can be used inside the application. Of course, data that is in a right format is processed much quicker.

# First running the application #
If you download the whole package (not just the essential libraries) you get a working example application with example data sources (files) which you should be replaced. So, basically, the package is a "starting point" example application which should be modified to meet the requirements.

# Setting up the application #
To setup the application you need to modify _media/scripts/settings.js_ file. Settings are split onto 3 categories:
  * Application
  * Users
  * <Table classes>, ...
Each category is represented by a javascript object (dictionary). Properties can be either string or number, boolean value or a function that returns strictly defined content. Below you can find properties reference for each category.

## Application ##
### userSelection /bool/ ###
Display user selection page? If false, a placeholder user name (Application.modelDefaults.user, eg. 'default') and default table object name (Application.modelDefaults.table) has to be setup.
### jsonp /bool/ ###
Allow requests to other hosts (default: false)
### pageTitle /string/ ###
page title (example: 'Task Monitoring')
### footerTxt /string/ ###
footer text (example: 'jTaskMonitoring')
### supportLnk /string/ ###
link to support page (example: 'https://twiki.cern.ch/twiki/bin/view/ArdaGrid/TaskMonitoringWebUI')
### logoLnk /string/ ###
link to page logo (example: 'media/images/atlaslogo.png')
### usersListLbl /string/ ###
Label of user list search field (example: 'Users List')
### mainsLbl /string/ ###
Name of mains content (example: 'Tasks')
### subsLbL /string/ ###
Name of subs content (example: 'Jobs')
### modelDefaults /function()/ ###
Here You can set up model (data.js) default values, in most cases doesn't need to be changed. Function has to return the following values in a form of a dictionary:
  * user - **/string/** default user name (default: '')
  * refresh - **/int/** seconds (default: 0)
  * table - **/string/** - default table object (default: '')
  * initialTable - **/string/** - Table that is a root of a tables tree
  * p - **/int/** page number (default: 0)
  * sorting - **/array/** (default: `[]`)
  * or - **/array/** opened table rows (default: `[]`)
  * uparam - **/array/** user defined params (for params that cannot be shared between use cases) (default: `[]`)
### onLoadRequestURL /string/ ###
You can define an on load ajax request that will provide the application with any kind of default (startup) data loaded from the provided url. You can access the data inside Controller.Data.state().mem.onload.
### hashChangeEvent /function(state, dataMem)/ ###
Input:
  * state - State of the view (subs|mains|users). Keep in mind that this is only the state of the url, not the state of the application, because of asynchronous ajax requests the state of the view might be (temporally) different then state of the url hash.
  * dataMem - Data.state.mem object
Optional hash change function alows to react on hast changes.
### initEvent /function(state, dataMem)/ ###
Input:
  * state - State of the view (subs|mains|users). Keep in mind that this is only the state of the url, not the state of the application, because of asynchronous ajax requests the state of the view might be (temporally) different then state of the url hash.
  * dataMem - Data.state.mem object
Optional init function alows to run some additional action on application initialization.

## Users ##
### dataURL /string/ ###
Users list URL for ajax request
### dataURL\_params /function(dataState)/ ###
(optional) Ajax request parameters
Input: Data.state object
Output: `{'<parameter_name>':<parameter_value>,...} (default: {})`
### searchLabel /string/ ###
Label of the search field
### translateData /function(responseData)/ ###
Translates ajax response onto searchable list plugin data format
Input: json responce
Output: `[user1, user2, ...]`

## Table Classes ##
Here you can define your monitoring system tables that will display the data. Table class should start with the Capital letter. Here you have the possible settings:

### tableName /string/ ###
Defines table name. Used in breadcrumbs.
### showChartsTabFirst /bool/ ###
(optional, default: false) If true, charts tab will be default for this table.
### dataURL /string/ ###
Mains URL for ajax request
### dataURL\_params /function(dataState)/ ###
(optional) Ajax request parameters
Input: Data.state object
Output: `{'<parameter_name>':<parameter_value>,...} (default: {})`
### expandableRows /bool/ ###
If TRUE, rows will expand after clicking '+'
### multipleER /bool/ ###
If TRUE, multiple rows can be expanded
### expandData /object/ ###
Definition of data that will be displayed after row expansion, expandData object has the following structure:
  * dataURL - **/string/** URL for ajax request
  * dataURL\_params - **/function/** Ajax request parameters
    * Input: controller.Data object and current row data
    * Output: `{'<parameter_name>':<parameter_value>,...} (default: {})`
  * dataFunction - **/Function/** Function, definition of data that will be displayed after row expansion. It returns an array of content to display, the order of contents is represented on the webpage.
    * Input:
      * rowDataSet - clicked row data (from ajax datatable response)
      * jsonDataSet - data extracted from ajax response
    * Output:
```
// You can skip each of the output parameters ('properties', 'html', 'table' or 'charts' output sections), expanded row will keep to the order set up in this output array
[
  ['properties',[[(property_name),'(property_value)'],...]],
  ['table',{
    'tblLabels':[(label1),(label2),...],
    'tblData':[[(row1value1),(row1value2),...],[(row2value1),(row2value2),...],...]
  }],
  ['html','(custom_html)'],
  ['charts',[<chart_obj1>,<chart_obj2>]] 
]
```

### sorting /array/ ###
sets up column sorting, `[<column_index>,<sorting_direction>]`, sorting\_direction='desc'|'asc' (default: `[1,'desc']`)
When setup to false it turns off the datatable column sorting at all, the data will appear in the order given by server.
### iDisplayLength /int/ ###
Number of rows to display on single page (default: 25)
### aLengthMenu /array/ ###
This parameter allows you to readily specify the entries in the length drop down menu that DataTables shows when pagination is enabled. It can be either a 1D array of options which will be used for both the displayed option and the value, or a 2D array which will use the array in the first position as the value, and the array in the second position as the displayed options (useful for language strings such as 'All').
```
'aLengthMenu': [[10, 25, 50, -1], [10, 25, 50, "All"]]
```
or simply
```
'aLengthMenu': [10, 15, 20, 25, 30, 50, 100, 200]
```
### tblLabels /array | object/ ###
column labels (example: `['monitorTaskId','Num of Jobs','Pending','Running','Successful','Failed','Unknown','Graphically']`)
**From version 1.5.0**
There is also a possibility of adding an `complex headers`. Using this option allows to group table labels like in this [example](http://www.datatables.net/examples/advanced_init/complex_header.html).

Here is the example function that you can define instead of standard array:
```
// Column labels
'tblLabels': function() {
    return {
        'header':{
            'groups':[['monitorTaskId',2,0],['Num of Jobs',2,0],['Statuses',0,5],['Graphically',2,0]],
            'labels':[['Pending',0,0],['Running',0,0],['Successful',0,0],['Failed',0,0],['Unknown',0,0]]
        },
        'footer': {
            'labels':[['monitorTaskId',2,0],['Num of Jobs',2,0],['Pending',0,0],['Running',0,0],['Successful',0,0],['Failed',0,0],['Unknown',0,0],['Graphically',2,0]],
            'groups':[['Statuses',0,5]]
        }
    };
}
```
Every label is an array: `[<label text>,<row_span>,<col_span>,<(optional)column_index>,<(optional)css_styles>]`. _Groups_, for header are positioned above _labels_ and for footer below. In optional _column\_index_ you can change the column data source to sum or average values from a different column, to ignore the _column\_index_ setting just set it to _false_ (necessary to use when you don't want to change a default column index but use _css\_styles_ at the same time, see example below).
The above definition will generate the following html structure:
```
<table id="dataTable_0" cellpadding="0" cellspacing="1" class="display">
    <thead>
        <tr>
            <th rowspan="2" class="sorting_disabled rExpand" colspan="1" style="width: 10px; "></th>
            <th rowspan="2" class="tblSort sorting_desc" colspan="1">monitorTaskId</th>
            <th rowspan="2" class="tblSort sorting" colspan="1">Num of Jobs</th>
            <th colspan="5" class="tblSort" rowspan="1">Statuses</th>
            <th rowspan="2" class="tblSort sorting_disabled" colspan="1">Graphically</th>
        </tr>
        <tr>
            <th class="numericTD sorting" rowspan="1" colspan="1">Pending</th>
            <th class="tblSort sorting" rowspan="1" colspan="1">Running</th>
            <th class="tblSort sorting" rowspan="1" colspan="1">Successful</th>
            <th class="tblSort sorting" rowspan="1" colspan="1">Failed</th>
            <th class="tblSort sorting" rowspan="1" colspan="1">Unknown</th>
        </tr>
    </thead>
    <tfoot>
        <tr>
            <th rowspan="2" colspan="1"></th>
            <th rowspan="2" class="tblSort" colspan="1">monitorTaskId</th>
            <th rowspan="2" class="tblSort" colspan="1">Num of Jobs</th>
            <th class="tblSort" rowspan="1" colspan="1">Pending</th>
            <th class="tblSort" rowspan="1" colspan="1">Running</th>
            <th class="tblSort" rowspan="1" colspan="1">Successful</th>
            <th class="tblSort" rowspan="1" colspan="1">Failed</th>
            <th class="tblSort" rowspan="1" colspan="1">Unknown</th>
            <th rowspan="2" class="tblSort" colspan="1">Graphically</th>
        </tr>
        <tr>
            <th colspan="5" rowspan="1">Statuses</th>
        </tr>
    </tfoot>
</table>
```
In addition, there is a possibility to add a summary sum or average value of entire column values (this option, for now, was tested only for ints). Here is en example:
```
'footer': {
    'groups':[['Statuses Summary',0,5]],
    'labels':[['monitorTaskId',2,0],['Num of Jobs',2,0],['=SUM',0,0,false,{'text-align':'right','color':'#FF9900'}],['=AVG',0,0,false,{'text-align':'right','color':'#BB72F3'}],['=SUM',0,0,false,{'text-align':'right','color':'#59D118'}],['=AVG',0,0,false,{'text-align':'right','color':'#C50000'}],['=SUM',0,0,false,{'text-align':'right','color':'#C2BDDD'}],['Graphically',2,0]]
}
```
So, the label array was extended a little. After header label, row and col span column index and css styles object was added. Column index represents the column index which values we want to sum up (after adding optional expandable row 'plus image coulmn'). Column index is optional so it can be left empty or set to false. You have to use false if you don't want to specify it but you want to define additional style-sheets for a specific header.

Complex headers option is an experimental one for now, and it's difficult for us to predict all possible behaviors of the script but we encourage you to try it out and waiting for a feedback.
### aoColumns /array/ ###
(optional) columns options, see http://www.datatables.net/usage/columns
### getDataArray /function(responseData)/ ###
function: extracting array of table data (for dataTable) form Ajax response. Allows the system to automatically find a proper data row if needed (eg. for expandable row).
Example:
  * Ajax response: `{'user_taskstable':[{col_val1, col_val2, ...}, ...]}`
  * Required function: `function(data) { return data.user_taskstable; }`
### translateData /function(getArrayDataOutput)/ ###
function, translates ajax response onto dataTables plugin data format, here you can setup you table content and a links to the subcontent, to do this just add an html "a" tag with class "drilldown" to the cell.
Input: Array of data selected in `getDataArray` function. The output of getArrayData function.
Output: `[[col_val1, col_val2, ...], ...]`
### drillDownHandler /function(dataState, element, rowIndex)/ ###
It is executed every time someone clicks a table cell with a.drilldown html tag in it (inside main table, expanded row table or chart table). Main purpose of the function is to indicate tid and (optionary) uparam parameters from the Data object (uparam allows to setup additional parameters to tid that would define a sub table ajax request). This allows to properly display subs table.
Input:
  * dataState - application Data.state object
  * element - clicked jQuery element
  * rowIndex - index of the clicked row
Output:
```
{
 'table':'<tableObjectName>',
 'filters':{ '<filterUrlVariable>':'<filterValue>', ... }
}
```
### tableActivityEvent /function(element, dataMem)/ ###
Input:
  * element - Clicked element
  * dataMem - Data.state.mem object
Optional function that allows user to handle table change event (on changing sorting or page). Function will also run on table init, in this case element will be empty.
### filtersPreSubmit /function/ ###
(optional) Function allowing to test the filters values before submitting the filters form.

Input:
  * Data - Data.state object

Returns:
  * true - if everything is ok
  * false - if not
  * (html) - if you want to display some comments
### filterGroups /array/ ###
(optional) Array of filters group names. This option allows filters to be grouped in a separate blocks if filterGroups is defined `groupIndex` option has to be added to filter objects to determine to which group of filters it should be attached.
Example:
```
'filterGroups':['Group 1','Group 2'],
```
### filters /array/ ###
It's an array of objects, each object represents different filter and all of the filters values are stored in a Controller.Data.filters object and you can use them (eg in dataURL\_params functions) by doing Data.filters.{filter\_urlVariable}. The filter object consists of the following elements:
    * label - **/string/** filter label /displayed above the input field/ (default: '')
    * urlVariable - **/string/** lower cased, no spaces, no special characters /used in url and inside Controller.Data object/ (default: 'filter')
    * fieldType - **/string/** accept 3 kinds of input types ('text' | 'select' | 'multiselect' | 'date') (default: 'text')
    * groupIndex - **/int/** - (optional) Determines to which group filter should be attached
    * value - **/string/** Initial value for the filter (default: '')
    * disableCache - **/boolean/** If set it to true the filters request will be done every time the table loads (default: false)
    * options - **/obejct/** there are several options that you can setup depending on _fieldType_ and needs, here is the example:
```
{
'dataURL':'/dashboard/request.py/inittaskprod?data=sites',  // (optional) String, works only for select fieldType
'dataURL_params':function(Data){return {};},  // (optional) Here you can setup request parameters
// Function translates model or ajax data onto simple elements array
// Input: data - data represents Data.mem object or ajax response depending on whether dataURL exists or not
// Output: [['el1','el1 label'],['el2','el2 label'], ...] - Can also be defined as a static list (when you don't want to
// load the data from url nor using Data.mem object)
'translateData': function(data) {
/* Example useage:
var sitesArr = data.basicData;
var output = [ ['','Off'] ];

for (var i=0;i<sitesArr.length;i++) {
output.push([sitesArr[i].SITENAME,sitesArr[i].SITENAME]);
}

return output;
*/
},
// On and Off optional functions are executed when filters submit is clicked
// On is executed when field has value other then empty string ("")
// Otherwise Off is executed
'On':function(Data) {  // Data is a Controller.Data.state object
$('#from,#till,#timeRange').attr('disabled',true);
},
'Off':function(Data) {  // Data is a Controller.Data.state object
$('#from,#till,#timeRange').attr('disabled',false);
},
/* This function allows to disable othe filters options when selecting certain option.
Output:
[
  [
    <filterOptionValue>,
    [
      [ <otherFilterUrlVariable>, [<OptionWhichShouldStayActive>, ... ] ], ...
    ], ...
  ], ...
]
*/ 
'disableFilterOptionsList':function(Data) { // Data is a Controller.Data.state object
    var output = [], i, filteroptions = Data.mem.filters.typeofproc.basicData;

    for (i=0;i<filteroptions.length;i++) {
        output.push([
            filteroptions[i].TASKTYPE,
            [
                ['workinggroup',filteroptions[i].GroupName.split(',')],
                ['activity',filteroptions[i].AtlasGenActivity.split(',')]
            ]
        ]);
    }

    return output;
}
}
```
### chartGroups /array/ ###
(optional) Array of chart group names. This option allows charts (only for charts under `charts` option) to be grouped in a separate blocks if chartGroups is defined `groupIndex` option has to be added to charts objects to determine to which group of charts it should be attached
### chartColCount /int/ ###
(optional) Defines the number of columns in charts table located under "Charts" tab.
### charts /array/ ###
(optional) allow to insert charts into charts tab
### topTblChartColCount /int/ ###
(optional) Defines the number of columns in charts table located above the main table.
### topTableCharts /array/ ###
(optional) allow to insert charts on top of the dataTable

## Setting up charts ##
Charts are based on google charts service and highcharts jQuery plotting library. The types of charts to draw can be toggled using _type_ property (gchart for google charts, hchart for highcharts and table for displaying a table in a place of chart). In case when you want to use google charts to display charts on the page function _translateData_ will have to return object with complete google charts parameter set (see the first example and google charts web page: http://code.google.com/apis/chart/). Google charts can be created using Chart Wizard (http://code.google.com/apis/chart/docs/chart_wizard.html), this will give you the necessary parameters to fill. In case when using highcharts the _translateData_ function would have to return highcharts options object (instructions for using highcharts can be found here: http://www.highcharts.com/). When composing highcharts options object you don't have to specify options.chart.renderTo option, it will be replaced anyway. To display a 'chart table' you will need to return a strictly specified object (you can see the last example). Below you can find example charts settings:
```
'charts': [
    {
        'name':'Status Overview',
        'type':'gchart', // (gchart||hchart),
        'onDemand':true,
        'dataURL': 'http://pcadc01.cern.ch/client/chartdata',
        'dataURL_params': function(Data) { return {}; },
        // translates data onto requires format:
        // {"chd":"t:60,40","chl":"Hello||World"} or highcharts options object (http://www.highcharts.com/)
        'translateData':function(dataJSON) {
            output = {
                'chtt':'Example Chart',
                'cht':'p3',
                'chs':'600x350',
                'chd':dataJSON.chd,
                'chl':dataJSON.chl
            };
            return output;
        }
    }
]
```

```
'charts': [
    {
        'name':'Status Overview',
        'type':'gchart', // (gchart||hchart)
        'onDemand':false,
        // translates data onto requires format:
        // {"chd":"t:60,40","chl":"Hello||World"} or highcharts options object (http://www.highcharts.com/)
        'translateData':function(dataMem) {
            var data = dataMem.subs.data;
            var dataLen = data.length;
            
            var obj = {
                'statuses':['S','F','R','PR','P','U'],
                'statusesCnt':[0,0,0,0,0,0],
                'statusesLbl':['Succesfull','Failed','Running','NotCompleted','Pending','Unknown']
            };
            
            for (var i=0; i<dataLen; i++) {
                var row = data[i];
                for (var j=0; j<obj.statuses.length; j++) {
                    if (row.STATUS == obj.statuses[j]) obj.statusesCnt[j]++;
                }
            }
            
            for (var j=0; j<obj.statusesLbl.length; j++) {
                if (obj.statusesCnt[j] > 0) obj.statusesLbl[j] += ' ('+obj.statusesCnt[j]+')';
                else obj.statusesLbl[j] = '';
            }
            
            var output = {
                "chd":"t:"+obj.statusesCnt.join(','),
                "chl":obj.statusesLbl.join('||'),
                'chtt':'Status Overview',
                'cht':'p3',
                'chs':'600x250',
                'chco':'59D118||C50000||3072F3||BB72F3||FF9900||C2BDDD'
            };
            return output;
        }
    },
    {
        'name':'Graphical representation',
        'type':'hchart', // (gchart||hchart)
        'onDemand':false,
        // translates data onto requires format:
        // {"chd":"t:60,40","chl":"Hello||World"} or highcharts options object (http://www.highcharts.com/)
        'translateData':function(dataMem) {
            var data = dataMem.mains.data;
            var dataLen = data.length;
            if (dataLen > 25) dataLen = 25;
            
            var obj = {
                'statuses':['SUCCESS','FAILED','RUNNING','PENDING','UNKNOWN'],
                'statusesCnt':[[],[],[],[],[]],
                'taskIDs':[],
                'statusesLbl':['Succesfull','Failed','Running','Pending','Unknown'],
                'statusesColors':['#59D118','#C50000','#3072F3','#FF9900','#C2BDDD']
            };
            
            for (var i=0; i<dataLen; i++) {
                var row = data[i];
                for (var j=0; j<obj.statuses.length; j++) {
                    obj.statusesCnt[j].push(row[obj.statuses[j]]);
                }
                obj.taskIDs.push(row.TASKMONID.slice(0,10)+'*'+row.TASKMONID.substr(-8));
            }
            
            var series = [];
            
            for (var i=0;i<obj.statuses.length;i++) {
                series.push({
                    name:obj.statusesLbl[i],
                    data:obj.statusesCnt[i],
                    color:obj.statusesColors[i]
                });
            }
            
            output = {
                chart: {
                    height:400,
                    width:500,
                    renderTo: 'container',
                    defaultSeriesType: 'bar',
                    backgroundColor:'#eeeeee',
                    borderColor:'#aaaaaa',
                    borderWidth:2
                },
                title: {
                    text: 'Graphical representation'
                },
                xAxis: {
                    categories: obj.taskIDs,
                    title: { text: 'Taks IDs' }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Jobs number' }
                },
                legend: {
                    backgroundColor: '#FFFFFF',
                    reversed: true
                },
                tooltip: {
                    formatter: function() { return ''+this.series.name +': '+ this.y +''; }
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                series: series
            }
            
            return output;
        }
    },
    {
        'name':'Table',
        'type':'table', // (gchart|hchart|table)
        'onDemand':false,
        'translateData':function(dataMem) {
            var data = dataMem.mains.data.Tier1Stat;
            var output = {
                width:550,
                tblLabels:['Cloud','Datasets','Total Files in datasets','Total CpFiles in datasets','Completed','Transfer','Subscribed'],
                tblData:[] // EXAMPLE OF tblData: [{'html':'phi1','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'},{'html':'phi1','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'}]
            };
            
            for (var i=0;i<data.length;i++) {
                var arrRow = [
                    {'html':'<span class="upperTableHeaders">'+data[i].cloud+'</span>','bgcolor':'#7FA4BF'},
                    {'html':data[i].datasets,'bgcolor':'#FFFF99'},
                    {'html':data[i].files,'bgcolor':'#FFFF99'},
                    {'html':data[i].cpfiles,'bgcolor':'#FFFF99'},
                    {'html':data[i].completed,'bgcolor':'#FFFF99'},
                    {'html':data[i].transfer,'bgcolor':'#FFFF99'},
                    {'html':data[i].subscribed,'bgcolor':'#FFFF99'}
                ];
                output.tblData.push(arrRow);
            }
            
            var arrSummaryHead = [
                {'html':'','bgcolor':'#7FA4BF'},
                {'html':'<span class="upperTableHeaders">Datasets</span>','bgcolor':'#7FA4BF'},
                {'html':'<span class="upperTableHeaders">Total Files in datasets</span>','bgcolor':'#7FA4BF'},
                {'html':'<span class="upperTableHeaders">Last Subscription</span>','bgcolor':'#7FA4BF'},
                {'html':'<span class="upperTableHeaders">LFC Checked</span>','bgcolor':'#7FA4BF'},
                {'html':'<span class="upperTableHeaders">Last Transfer</span>','bgcolor':'#7FA4BF'},
                {'html':'','bgcolor':'#7FA4BF'}
            ];
            output.tblData.push(arrSummaryHead);
            
            var arrSummaryData = [
                {'html':'<span style="color:#FFFFFF;font-weight:bold;margin:0px 2px 0px 2px">Total</span>','bgcolor':'#7FA4BF'},
                {'html':dataMem.mains.data.Total.NDATASET,'bgcolor':'#FFFF99'},
                {'html':dataMem.mains.data.Total.files,'bgcolor':'#FFFF99'},
                {'html':dataMem.mains.data.Total.LastSubscription,'bgcolor':'#FFFF99'},
                {'html':dataMem.mains.data.Total.LFCChecked,'bgcolor':'#FFFF99'},
                {'html':dataMem.mains.data.Total["Last Transfer"],'bgcolor':'#FFFF99'},
                {'html':'','bgcolor':'#FFFF99'}
            ];
            output.tblData.push(arrSummaryData);
            
            return output;
        }
    }
]
```
**Chart object description:**
### name /string/ ###
Obligatory chart name
### type /string/ ###
(gchart|hchart|table)
### onDemand /bool/ ###
If true chart will load data and draw after clicking a button
### dataURL /string/ ###
(optional) URL for ajax charts data request
### dataURL\_params /function/ ###
(optional) Ajax request parameters
Input: data object
Output: `{'<parameter_name>':<parameter_value>,...}`
### translateData /function/ ###
defines charts input parameters
input: `<data object>`, Data.mem object or AJAX response
output example:
  * Google charts:
```
{"chd":"t:60,40","chl":"Hello|World"}
```
  * Highcharts:
```
{
    chart: {
        renderTo: 'container',
        defaultSeriesType: 'bar',
        height:281,
        backgroundColor:'#ffffff',
        borderColor:'#aaaaaa',
        borderWidth:1
    },
    title: {
        text: 'Stacked bar chart'
    },
    xAxis: {
        categories: cCategories
    },
    yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
            text: 'Datasets number'
        }
    },
    legend: {
        backgroundColor: '#FFFFFF',
        reversed: true
    },
    tooltip: {
        shared: true,
        crosshairs: true
    },
    plotOptions: {
        bar: {
            borderWidth:0,
            stacking: 'normal',
            pointPadding:0,
            groupPadding:0.1,
            shadow:false
        }
    },
    series: [{
        name: 'Completed',
        color: '#006600',
        data: cData[0]
    }, {
        name: 'Transfer',
        color: '#33FF00',
        data: cData[1]
    }, {
        name: 'Subscribed',
        color: '#FF9933',
        data: cData[2]
    }]
}
```
  * Table
```
{
    'name':'Table',
    'type':'table', // (gchart|hchart|table)
    'onDemand':false,
    'translateData':function(dataMem) {
        var data = dataMem.mains.data.Tier1Stat;
        var output = {
            width:550,
            tblLabels:['Cloud','Datasets','Total Files in datasets','Total CpFiles in datasets','Completed','Transfer','Subscribed'],
            tblData:[]
            //    [{'html':'phi1','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'},{'html':'phi1','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'}]
        };
        
        for (var i=0;i<data.length;i++) {
            var arrRow = [
                {'html':'<span class="upperTableHeaders">'+data[i].cloud+'</span>','bgcolor':'#7FA4BF'},
                {'html':data[i].datasets,'bgcolor':'#FFFF99'},
                {'html':data[i].files,'bgcolor':'#FFFF99'},
                {'html':data[i].cpfiles,'bgcolor':'#FFFF99'},
                {'html':data[i].completed,'bgcolor':'#FFFF99'},
                {'html':data[i].transfer,'bgcolor':'#FFFF99'},
                {'html':data[i].subscribed,'bgcolor':'#FFFF99'}
            ];
            output.tblData.push(arrRow);
        }
        
        return output;
    }
}
```
As a data source for charts both local stored data (data used to generate a tables) and data from ajax request can be used. When you want to use ajax data you will have to specify _dataURL_ and _dataURL\_params_ parameters, in this case input for _translateData_ function will be object extracted from ajax response, otherwise Data.mem (see data.js file for Data.mem object structure) object will serve as an input for this function.

### postProcess /function/ ###
(optional) Function that is run after chart is loaded. You can use it to load another chart or to attach some events to newly created table.
Input: Data object