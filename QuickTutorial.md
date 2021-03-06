

# General Information #
The hBrowseFramework (aka Tasks Monitoring Web UI) is a generic monitoring tool designed to meet the needs of various communities. It is strongly configurable and easy to adjust and implement accordingly to a specific community needs. Each part of this software (dynamic tables, user selection etc.) is in fact a separate plugin which can be used separately from the main application. It was especially designed to meet the requirements of Atlas and CMS users as well as to use it as a bulked Ganga monitoring tool.

## Main Features ##
  * **Highly configurable environment** - Things like table columns, charts, data sources and many more can be set up in only one file
  * **Bookmarking support** - every view has a proper representation in URL
  * **History support** - not so common in ajax applications
  * **Easy search** - Application provides easy way to search the tables data (part of jQuery datatables plugin)
  * **Google charts support** - if you are familiar with google charts service you can easily add or modify charts
  * **Independent View** - Application gets the data from ajax requests so using of different data sources is possible
  * **3 main views** - user selection list, table of main content and table of sub content.

# Quick start manual #
## Basics ##
First thing to consider when setting up TMWebUI application is your data server. Main and in fact only requirement is your server to be able to serve data in a json format for 3 main views:
  * User selection list
  * Main content table (like jobs in Ganga)
  * Sub-content table (like subjobs in Ganga)
Json data format is not important because special translation functions can be used inside the application. Of course, data that is in a right format is processed much quicker.

## Setting up the application ##
To setup the application you need to modify _media/scripts/settings.js\_example_ file. Settings are split onto 3 categories:
  * Application
  * Users
  * Mains
  * Subs
Each category is represented by a javascript object (dictionary). Properties can be either string or number, boolean value or a function that returns strictly defined content. Below you can find properties reference for each category.

### Application ###
#### userSelection /bool/ ####
Display user selection page? If false, a placeholder user name has to be setup (eg. default, see below) (true/false)
#### jsonp /bool/ ####
Allow requests to other hosts (default: false)
#### pageTitle /string/ ####
page title (example: 'Task Monitoring')
#### footerTxt /string/ ####
footer text (example: 'jTaskMonitoring')
#### supportLnk /string/ ####
link to support page (example: 'https://twiki.cern.ch/twiki/bin/view/ArdaGrid/TaskMonitoringWebUI')
#### logoLnk /string/ ####
link to page logo (example: 'media/images/atlaslogo.png')
#### usersListLbl /string/ ####
Label of user list search field (example: 'Users List')
#### mainsLbl /string/ ####
Name of mains content (example: 'Tasks')
#### subsLbL /string/ ####
Name of subs content (example: 'Jobs')
#### modelDefaults /function/ ####
Here You can set up model (data.js) default values, in most cases doesn't need to be changed. Function has to return the following values:
  * user - **/string/** default user name (default: '')
  * from - **/int/** timestamp (default: 0)
  * till - **/int/** timestamp (default: 0)
  * timeRange - **/string/** (default: 'lastDay')
  * refresh - **/int/** seconds (default: 0)
  * tid - **/string/** eg. Job id in Gange nomenclature (default: '')
  * p - **/int/** page number (default: 0)
  * sorting - **/array/** (default: `[]`)
  * or - **/array/** opened table rows (default: `[]`)
  * uparam - **/array/** user defined params (for params that cannot be shared between use cases) (default: `[]`)

### Users ###
#### dataURL /string/ ####
Users list URL for ajax request
#### dataURL\_params /function/ ####
(optional) Ajax request parameters
Input: controller.Data object
Output: `{'<parameter_name>':<parameter_value>,...} (default: {})`
#### searchLabel /string/ ####
Label of the search field
#### translateData /function/ ####
Translates ajax response onto searchable list plugin data format
Input: json responce
Output: `[user1, user2, ...]`

### Mains ###
#### dataURL /string/ ####
Mains URL for ajax request
#### dataURL\_params /function/ ####
(optional) Ajax request parameters
Input: controller.Data object
Output: `{'<parameter_name>':<parameter_value>,...} (default: {})`
#### expandableRows /bool/ ####
If TRUE, rows will expand after clicking '+'
#### multipleER /bool/ ####
If TRUE, multiple rows can be expanded
#### expandData /object/ ####
Definition of data that will be displayed after row expansion, expandData object has the following structure:
  * dataURL - **/string/** URL for ajax request
  * dataURL\_params - **/function/** Ajax request parameters
    * Input: controller.Data object and current row data
    * Output: `{'<parameter_name>':<parameter_value>,...} (default: {})`
  * dataFunction - **/Function/** Function, definition of data that will be displayed after row expansion
    * Input:
      * owDataSet - clicked row data (from ajax datatable response)
      * sonDataSet - data extracted from ajax response
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

#### sorting /array/ ####
sets up column sorting, `[<column_index>,<sorting_direction>]`, sorting\_direction='desc'|'asc' (default: `[1,'desc']`)
When setup to false it turns off the datatable column sorting at all, the data will appear in the order given by server.
#### iDisplayLength /int/ ####
Number of rows to display on single page (default: 25)
#### tblLabels /array/ ####
column labels (example: `['monitorTaskId','Num of Jobs','Pending','Running','Successful','Failed','Unknown','Graphically']`)
#### aoColumns /array/ ####
(optional) columns options, see http://www.datatables.net/usage/columns
#### getDataArray /function/ ####
function: extracting array of data (for dataTable) form Ajax response
Example:
  * Ajax response: `{'user_taskstable':[{col_val1, col_val2, ...}, ...]}`
  * Required function: `function(data) { return data.user_taskstable; }`
#### translateData /function/ ####
function, translates ajax response onto dataTables plugin data format, here you can setup you table content and a links to the subcontent, to do this just add an html "a" tag with class "drilldown" to the cell.
Output: `[[col_val1, col_val2, ...], ...]`
#### drillDownHandler /function/ ####
_**Replaced setupUserParams**_. It is executed every time someone clicks a table cell with a.drilldown html tag in it. Main purpose of the function is to indicate tid and (optionary) uparam parameters from the Data object (uparam allows to setup additional parameters to tid that would define a sub table ajax request). This allows to properly display subs table.
Input:
  * Data - application Data object
  * el - clicked jQuery element
  * rowIndex - index of the clicked row
Output:
```
{
 'uparam':[<parameters_list>],
 'tid':`<id_for_the_subtable>`
}
```
#### filters /array/ ####
It's an array of objects, each object represents different filter and all of the filters values are stored in a Controller.Data.filters object and you can use them (eg in dataURL\_params functions) by doing Data.filters.{filter\_urlVariable}. The filter object consists of the following elements:
  * label - **/string/** filter label /displayed above the input field/ (default: '')
  * urlVariable - **/string/** lower cased, no spaces, no special characters /used in url and inside Controller.Data object/ (default: 'filter')
  * fieldType - **/string/** accept 3 kinds of input types ('text' &#124; 'select' &#124; 'date') (default: 'text')
  * value - **/string/** Initial value for the filter (default: '')
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
'On':function(Data) {  // Data is a Controller.Data object
$('#from,#till,#timeRange').attr('disabled',true);
},
'Off':function(Data) {  // Data is a Controller.Data object
$('#from,#till,#timeRange').attr('disabled',false);
}
}
```
#### charts /array/ ####
(optional) allow to insert charts into charts tab
#### topTableCharts /array/ ####
(optional) allow to insert charts on top of the dataTable

### Subs ###
#### dataURL /string/ ####
Mains URL for ajax request
#### dataURL\_params /function/ ####
(optional) Ajax request parameters
Input: controller.Data
Output: {'

<parameter\_name>

':

<parameter\_value>

,...} (default: {})
#### expandableRows /bool/ ####
If TRUE, rows will expand after clicking '+'
#### multipleER /bool/ ####
If TRUE, multiple rows can be expanded
#### expandData /object/ ####
Definition of data that will be displayed after row expansion, expandData object has the following structure:
  * dataURL - **/string/** URL for ajax request
  * dataURL\_params - **/function/** (optional) Ajax request parameters
Input: controller.Data object and current row data
Output: {'

<parameter\_name>

':

<parameter\_value>

,...} (default: {})
  * dataFunction - **/Function/** Function, definition of data that will be displayed after row expansion
Input:
- rowDataSet - clicked row data (from ajax datatable response)
- jsonDataSet - data extracted from ajax response
Output: [
['properties',[[(property\_name),'(property\_value)'],...]],
['table',{
'tblLabels':[(label1),(label2),...],
'tblData':[[(row1value1),(row1value2),...],[(row2value1),(row2value2),...],...]
}],
['html','(custom\_html)'],
['charts',[

<chart\_obj1>

,

<chart\_obj2>

]]
]
You can skip each of the output parameters ('properties', 'html', 'table' or 'charts' output sections), expanded row will keep to the order set up in this output array
#### sorting /array/ ####
sets up column sorting, [

<column\_index>

,

<sorting\_direction>

], sorting\_direction='desc'&#124;'asc' (default: [1,'desc'])
#### iDisplayLength /int/ ####
Number of rows to display on single page (default: 25)
#### tblLabels /array/ ####
column labels (example: ['monitorTaskId','Num of Jobs','Pending','Running','Successful','Failed','Unknown','Graphically'])
#### aoColumns /array/ ####
(optional) columns options, see http://www.datatables.net/usage/columns
#### getDataArray /function/ ####
function: extracting array of data (for dataTable) form Ajax response
Example:
- Ajax response: {'user\_taskstable':[{col\_val1, col\_val2, ...}, ...]}
- Required function: function(data) { return data.user\_taskstable; }
#### translateData /function/ ####
function, translates ajax response onto dataTables plugin data format
Output: [[col\_val1, col\_val2, ...], ...]
#### filters /array/ ####
It's an array of objects, each object represents different filter and all of the filters values are stored in a Controller.Data.filters object and you can use them (eg in dataURL\_params functions) by doing Data.filters.{filter\_urlVariable}. The filter object consists of the following elements:
  * label - **/string/** filter label /displayed above the input field/ (default: '')
  * urlVariable - **/string/** lower cased, no spaces, no special characters /used in url and inside Controller.Data object/ (default: 'filter')
  * fieldType - **/string/** accept 3 kinds of input types ('text' &#124; 'select' &#124; 'date') (default: 'text')
  * value - **/string/** Initial value for the filter (default: '')
  * options - **/obejct/** there are several options that you can setup depending on _fieldType_ and needs, here is the example:
{
'dataURL':'/dashboard/request.py/inittaskprod?data=sites',  // (optional) String, works only for select fieldType
'dataURL\_params':function(Data){return {};},  // (optional) Here you can setup request parameters
// Function translates model or ajax data onto simple elements array
// Input: data - data represents Data.mem object or ajax response depending on whether dataURL exists or not
// Output: [['el1','el1 label'],['el2','el2 label'], ...] - Can also be defined as a static list (when you don't want to
// load the data from url nor using Data.mem object)
'translateData': function(data) {
/**Example useage:
var sitesArr = data.basicData;
var output = [['','Off'](.md) ];**

for (var i=0;i<sitesArr.length;i++) {
output.push([sitesArr[i](i.md).SITENAME,sitesArr[i](i.md).SITENAME]);
}

return output;
**/
},
// On and Off optional functions are executed when filters submit is clicked
// On is executed when field has value other then empty string ("")
// Otherwise Off is executed
'On':function(Data) {  // Data is a Controller.Data object
$('#from,#till,#timeRange').attr('disabled',true);
},
'Off':function(Data) {  // Data is a Controller.Data object
$('#from,#till,#timeRange').attr('disabled',false);
}
}
#### charts /array/ ####
(optional) allow to insert charts into charts tab
#### topTableCharts /array/ ####
(optional) allow to insert charts on top of the dataTable**

### Setting up charts ###
Charts are based on google charts service and highcharts jQuery plotting library. The types of charts to draw can be toggled using _type_ property (gchart for google charts and hchart for highcharts). In case when one want to use google charts to display charts on the page function _translateData_ will have to return object with complete google charts parameter set (see the first example and google charts web page: http://code.google.com/apis/chart/). Google charts can be created using Chart Wizard (http://code.google.com/apis/chart/docs/chart_wizard.html), this will give you the necessary parameters to fill. In case when using highcharts the _translateData_ function would have to return highcharts options object (instructions for using highcharts can be found here: http://www.highcharts.com/). When composing highcharts options object you don't have to specify options.chart.renderTo option, it will be replaced anyway. Below you can find example charts settings:
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
    }
]
```
Chart object description:
#### name /string/ ####
Obligatory chart name
#### type /string/ ####
(gchart&#124;hchart)
#### onDemand /bool/ ####
If true chart will load data and draw after clicking a button
#### dataURL /string/ ####
(optional) URL for ajax charts data request
#### dataURL\_params /function/ ####
(optional) Ajax request parameters
Input: data object
Output: {'

<parameter\_name>

':

<parameter\_value>

,...}
#### translateData /function/ ####
defines google charts dynamic parameters
input: <data object>, Data.mem object or AJAX response
output example: {"chd":"t:60,40","chl":"Hello&#124;World"}
As a data source for charts both local stored data (data used to generate a tables) and data from ajax request can be used. When you want to use ajax data you will have to specify _dataURL_ and _dataURL\_params_ parameters, in this case input for _translateData_ function will be object extracted from ajax response, otherwise Data.mem (see data.js file for Data.mem object structure) object will serve as an input for this function.

### Files setup ###
To enable easy update from svn few files and directories was set up as an example files:
  * index.html\_example
  * media/scripts/settings.js\_example
  * media/css\_example
example