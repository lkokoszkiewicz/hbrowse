// This file is part of the jTaskMonitoring software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// Description:
// Here you have a working example of the settings file. Use it as a starting point, on which you can build an entire UI.
// To get additional info please look at documentation at http://code.google.com/p/hbrowse/wiki/SettingsDocumentationV2
//
// History:
// 28.05.2010 Created
//

function Settings() {
    // Application specific settings - START
    this.Application = {
        'debugMode': true, // Display debug messages on errors inside dataTranslate functions? (true|false)
        
        'userSelection': true, // Display user selection page? (true|false)
        'dataRefresh': true, // Display refresh dropdown field? (true|false)
        'timeRangeSelection': true, // Display time range dropdown field? (true|false)
        'jsonp': false, // allow requests to other hosts
        'pageTitle': 'Task Monitoring', // Page title
        'footerTxt': 'Task Monitoring', // Footer text
        'supportLnk': 'http://code.google.com/p/hbrowse/w/list', // Link to support page
        'logoLnk': 'media/images/logo.png', // Link to page logo
        'usersListLbl': 'Users', // Label of user list search field, example: 'Users List'
        'mainsLbl': 'Tasks', // Name of mains content, example: 'Tasks'
        'subsLbL': 'Jobs', // Name of subs content, example: 'Jobs'
        'modelDefaults': function() { // Here You can set up model (data.js) default values
            return {
                'user': '',
                'refresh': 0,
                'table':'',
                'initialTable': 'Mains',
                'p': 1,
                'sorting': [],
                'or': [], // opened table rows
                'uparam': [] // user defined params (for params that cannot be shared between use cases)
            }
        }//,
        // You can define an on load ajax request that will provide the application with any kind of default (startup) data loaded from the provided url. 
        //'onLoadRequestURL':'http://localhost/hbrowse2/gangataskmonitoring',
        // Optional init function alows to run some additional action on application initialization, it takes one parameter which is the state of the view (subs|mains|users)
        // Keep in mind the this is only the state of the url, not the state of the app, because of asyncronous ajax requests
        // the state of the view might be (temporarly) different then state of the url hash
        //'initEvent':function(appState){
        //    alert(';)');
        //}
        // Optional hash change function alows to react on hash changes, it takes one parameter which is the state of the view (subs|mains|users)
        // Keep in mind the this is only the state of the url, not the state of the app, because of asyncronous ajax requests
        // the state of the view might be (temporarly) different then state of the url hash
        /*'hashChangeEvent':function(appState) {
            alert(el);
        }*/
    };
    // Application specific settings - FINISH

    // Users list settings - START
    this.Users = {
        'dataURL': 'gangataskmonitoring', // Users list URL for ajax request
        // Function, ajax request parameters
        // Output: {'<parameter_name>':<parameter_value>,...} (default: {})
        /*'dataURL_params': function(Data) {
            return {};
        },*/
        'searchLabel': 'Search ', // Label of the search field
        // Function, translates ajax response onto searchable list plugin data format
        // Output: [user1, user2, ...]
        'translateData': function(dataJSON) {
            var usersList = Array();
            var dataArr = dataJSON.basicData[0];
            for (i in dataArr) {
                usersList.push(dataArr[i].GridName);//.replace(/"/g, ''));
            }
            return usersList;
        }
    };
    // Users list settings - FINISH
    
    // Mains settings - START
    this.Mains = {
        'tableName': 'Tasks', // Defines table name. Used in breadcrumbs. 
        'showChartsTabFirst':false, // (optional) If true, charts tab will be default for this table.
        'dataURL': 'gangataskstable', // Mains URL for ajax request
        // Function, ajax request parameters
        // Input: Data - application Data model, rowDataSet - clicked row data (from ajax datatable response)
        // Output: {'<parameter_name>':<parameter_value>,...} (default: {})
        'dataURL_params': function(Data, rowDataSet) {
            obj = {
                'usergridname':Data.user,
                'from':hbrowseAPI.ts2iso(Data.from,2),
                'to':hbrowseAPI.ts2iso(Data.till,3),
                'timerange':Data.timeRange,
                'typeofrequest':'A'
            };
            return obj;
        },
        'expandableRows':true, // If TRUE, rows will expand after clicking '+'
        'multipleER':false, // If TRUE, multiple rows can be expanded
        // Expanded data view setub object
        'expandData': {
            // Function, definition of data that will be displayed after row expansion
            // It returns an array of content to display, the order of contents is represented on the webpage
            // Input: 
            //  - rowDataSet - clicked row data (from ajax datatable response)
            //  - jsonDataSet - data extracted from ajax response
            // Output: {
            //   'properties':[[<property_name>,'<property_value>']] or false,
            //   'table':{
            //     'tblLabels':[<label1>,<label2>,...] or false,
            //     'tblData':[[<row1value1>,<row1value2>,...],[<row2value1>,<row2value2>,...],...]
            //   } or false,
            //   'charts':[<charts_objects>],
            //   'html':<custom_html> or false
            // }
            'dataFunction': function(rowDataSet, jsonDataSet) {
                var properties = false;
                var html = false;
                var table = false;
                var charts = false;
                
                properties = [
                    ['TaskMonitorId', rowDataSet.TaskMonitorId],
                    ['TaskId', rowDataSet.TaskId],
                    ['TaskCreatedTimeStamp', rowDataSet.TaskCreatedTimeStamp],
                    ['TaskType', rowDataSet.TaskType],
                    //['NEventsPerJob', rowDataSet.NEventsPerJob], // Temporarly switched off
                    ['Application', rowDataSet.Application],
                    ['ApplicationVersion', rowDataSet.ApplicationVersion],
                    ['Executable', rowDataSet.Executable],
                    ['InputCollection', rowDataSet.InputCollection.replace(/,/g, ', ')],
                    ['SubmissionTool', rowDataSet.SubmissionTool],
                    ['SubmissionTool Version', rowDataSet.SubToolVersion],
                    ['SubmissionType', rowDataSet.SubmissionType],
                    ['SubmissionUI', rowDataSet.SubmissionUI],
                    ['TargetCE', rowDataSet.TargetCE.replace(/,/g, ', ')]
                ];
                
                return [['properties',properties]];
            }
        },
        'sorting':[1,'desc'], // [<column_index>,<sorting_direction>], sorting_direction='desc'||'asc'
        'iDisplayLength': 25, // Number of rows to display on single page
        'aLengthMenu':[10, 15, 20, 25, 30, 50, 100, 200],
        // Column labels (complex headers example, see documentation for more info)
        'tblLabels': function() {
            return {
                'header':{
                    'groups':[['monitorTaskId',2,0],['Num of Jobs',2,0],['Statuses',0,5],['Graphically',2,0]],
                    'labels':[['Pending',0,0],['Running',0,0],['Successful',0,0],['Failed',0,0],['Unknown',0,0]]
                },
                'footer': {
                    'groups':[['Statuses Summary',0,5]],
                    'labels':[['monitorTaskId',2,0],['Num of Jobs',2,0],['=SUM',0,0,false,{'text-align':'right','color':'#FF9900'}],['=SUM',0,0,false,{'text-align':'right','color':'#BB72F3'}],['=SUM',0,0,false,{'text-align':'right','color':'#59D118'}],['=SUM',0,0,false,{'text-align':'right','color':'#C50000'}],['=SUM',0,0,false,{'text-align':'right','color':'#C2BDDD'}],['Graphically',2,0]]
                }
            };
        },
        // dataTables plugin column options
        // see: http://www.datatables.net/usage/columns
        'aoColumns': [
            {"sWidth":"200px"},
            {"sClass":"numericTD", "fnRender":function(oObj){return '<a class="drilldown noJobsClick">'+oObj.aData[2]+'</a>';},"bUseRendered": false},
            {"sClass":"numericTD", "fnRender":function(oObj){return '<a class="drilldown noPendClick">'+oObj.aData[3]+'</a>';},"bUseRendered": false},
            {"sClass":"numericTD", "fnRender":function(oObj){return '<a class="drilldown noRunnClick">'+oObj.aData[4]+'</a>';},"bUseRendered": false},
            {"sClass":"numericTD", "fnRender":function(oObj){return '<a class="drilldown noSuccClick">'+oObj.aData[5]+'</a>';},"bUseRendered": false},
            {"sClass":"numericTD", "fnRender":function(oObj){return '<a class="drilldown noFailClick">'+oObj.aData[6]+'</a>';},"bUseRendered": false},
            {"sClass":"numericTD", "fnRender":function(oObj){return '<a class="drilldown noUnknClick">'+oObj.aData[7]+'</a>';},"bUseRendered": false},
            {"sWidth":"130px","bSortable":false}
        ],
        // Function: extracting array of table data form Ajax response
        // Allows the system to automatically find a proper data row if needed (eg. for expandable row)
        // Example:
        // - Ajax response: {'user_taskstable':[{col_val1, col_val2, ...}, ...]}
        // - Required function: function(data) { return data.user_taskstable; }
        'getDataArray': function(data) {
            return data.user_taskstable;
        },
        // Function, translates ajax response onto dataTables plugin data format
        // Input: Array of data selected in `getDataArray` function
        // Output: [[col_val1, col_val2, ...], ...]
        'translateData': function(dataJSON) {
            var tasksArr = Array();
            for (i in dataJSON) {
                tasksArr.push(Array(
                    ('<div class="wrapColumn" style="width:200px" title="'+dataJSON[i].TASKMONID+'"><a class="drilldown tmIdClick">'+dataJSON[i].TASKMONID+'</a></div>' || 'default'),
                    (dataJSON[i].NUMOFJOBS || '0'),
                    (dataJSON[i].PENDING || '0'),
                    (dataJSON[i].RUNNING || '0'),
                    (dataJSON[i].SUCCESS || '0'),
                    (dataJSON[i].FAILED || '0'),
                    (dataJSON[i].UNKNOWN || '0'),
                    '<img src="http://chart.apis.google.com/chart?chbh=a,0&chs=130x15&cht=bhs:nda&chco=59D118,C50000,3072F3,FF9900,C2BDDD&chds=0,'+dataJSON[i].NUMOFJOBS+',0,'+dataJSON[i].NUMOFJOBS+',0,'+dataJSON[i].NUMOFJOBS+',0,'+dataJSON[i].NUMOFJOBS+',0,'+dataJSON[i].NUMOFJOBS+'&chd=t:'+dataJSON[i].SUCCESS+'|'+dataJSON[i].FAILED+'|'+dataJSON[i].RUNNING+'|'+dataJSON[i].PENDING+'|'+dataJSON[i].UNKNOWN+'" />'
                ));
            }
            return tasksArr;
        },
        // Function, it is executed every time someone clicks cell with a.drilldown html tag in it
        // Main purpose of the function is to indicate parameters for displaying the drilldown table.
        // This allows to properly display a drilldown table
        // Input:
        //  - Data - application Data object
        //  - el - clicked jQuery element
        //  - rowIndex - index of the clicked row
        // Output: {
        //   'table':'<tableObjectName>',
        //   'filters':{ '<filterUrlVariable>':'<filterValue>', ... }
        // }
        'drillDownHandler': function(Data, el, rowIndex) {
            var classTranslate = {
                'tmIdClick':'all',
                'noJobsClick':'all',
                'noPendClick':'P',
                'noRunnClick':'R',
                'noSuccClick':'S',
                'noFailClick':'F',
                'noUnknClick':'U'
            };
            var drivingClass = $(el).find('a').attr('class').replace("drilldown ","");
            
            if (drivingClass != 'chartsTable') {
                var tid = Data.mem.table.data[rowIndex].TASKMONID;
                var status = classTranslate[drivingClass];
            } else {
                var tid = $(el).find('a').html();
                var status = 'all';
            }
            
            return {'table':'Subs',filters:{'tid':tid}};
        },
        // Optional function that allows user to handle table change event (on changing sorting or page).
        // Function will also run on table init, in this case element will be empty.
        /*'tableActivityEvent': function(el) {
            alert('it works! (mains)');
        },*/
        'charts': [
            {
                'name':'Status Overview',
                'type':'hchart', // (gchart|hchart)
                'onDemand':false,
                // translates data onto requires format:
                // {"chd":"t:60,40","chl":"Hello|World"}
                'translateData':function(dataMem) {
                    var data = dataMem.table.data;
                    var dataLen = data.length;
                    
                    if (dataLen > 0) {
                        var obj = {
                            'statuses':['SUCCESS','FAILED','RUNNING','PENDING','UNKNOWN'],
                            'statusesCnt':[0,0,0,0,0],
                            'statusesLbl':['Succesfull','Failed','Running','Pending','Unknown'],
                            'statusesColors':['#59D118','#C50000','#3072F3','#FF9900','#C2BDDD']
                        };
                        
                        for (var i=0; i<dataLen; i++) {
                            var row = data[i];
                            for (var j=0; j<obj.statuses.length; j++) {
                                obj.statusesCnt[j] += row[obj.statuses[j]];
                            }
                        }
                        
                        var data = [];
                        
                        for (var i=0;i<obj.statusesCnt.length;i++) {
                            if (obj.statusesCnt[i] > 0) {
                                if (obj.statuses[i] == 'FAILED') data.push({name:obj.statusesLbl[i]+' ('+obj.statusesCnt[i]+')',color:obj.statusesColors[i],y:obj.statusesCnt[i],sliced:true,selected:true});
                                else data.push({name:obj.statusesLbl[i]+' ('+obj.statusesCnt[i]+')',color:obj.statusesColors[i],y:obj.statusesCnt[i]});
                            }
                        }
                    } else return false;
                    
                    output = {
                        chart: {
                            height:400,
                            width:550,
                            backgroundColor:'#ffffff',
                            borderColor:'#aaaaaa',
                            borderWidth:1
                        },
                        title: {
                            text: 'Status Overview'
                        },
                        tooltip: {
                            formatter: function() {return '<b>'+ this.point.name +'</b>: '+ this.y;}
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer'
                            }
                        },
                        series: [{
                            type: 'pie',
                            data: data
                        }]
                    };
                    
                    return output;
                }
            },
            {
                'name':'Graphical representation',
                'type':'hchart', // (gchart|hchart)
                'onDemand':false,
                // translates data onto requires format:
                // {"chd":"t:60,40","chl":"Hello|World"}
                'translateData':function(dataMem) {
                    var data = dataMem.table.data;
                    var dataLen = data.length;
                    
                    if (dataLen > 0) {
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
                    } else return false;
                    
                    output = {
                        chart: {
                            height:400,
                            width:550,
                            renderTo: 'container',
                            defaultSeriesType: 'bar',
                            backgroundColor:'#ffffff',
                            borderColor:'#aaaaaa',
                            borderWidth:1
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
                'name':'Graphical representation',
                'type':'table', // (gchart|hchart|table)
                'onDemand':false,
                'translateData':function(dataMem) {
                    var output = {
                        width:550,
                        tblLabels:['col1','col2','col3','col4'],
                        tblData:[
                            [{'html':'<a class="drilldown chartsTable">app_ana_testuser_2265</a>','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'},{'html':'phi1','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'}],
                            [{'html':'<a class="drilldown chartsTable">app_ana_testuser_2265</a>','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'},{'html':'phi1','bgcolor':'#00FF00'},{'html':'phi1','bgcolor':'#FF0000'}]
                        ]
                    };
                    
                    return output;
                }
            }
        ]
    };
    // User Tasks settings - FINISH
    
    // Subs settings - START
    this.Subs = {
        'tableName':'Jobs',
        'dataURL': 'gangataskjobs', // Subs list URL for ajax request
        // Function, ajax request parameters
        // Output: {'<parameter_name>':<parameter_value>,...} (default: {})
        'dataURL_params': function(Data) {
            //alert(Data.filters.status);
            obj = {
                'taskmonid':Data.filters.tid,
                'what':(Data.filters.status || 'all')
            };
            return obj;
        },
        'expandableRows':true, // If TRUE, rows will expand after clicking '+'
        'multipleER':true, // If TRUE, multiple rows can be expanded
        // Expanded data view setub object
        'expandData': {
            'dataURL': 'resubmittedjobsAtl',
            'dataURL_params': function(Data, currentRow) {
                //alert(currentRow);
                obj = {
                    'what':'ALL',
                    'taskjobid':currentRow.TaskJobId,
                    'taskmonid':Data.tid
                };
                return obj;
            },
            // Function, definition of data that will be displayed after row expansion
            // Input: 
            //  - rowDataSet - clicked row data (from ajax datatable response)
            //  - jsonDataSet - data extracted from ajax response
            // Output: {
            //   'properties':[[<property_name>,'<property_value>']] or false,
            //   'table':{
            //     'tblLabels':[<label1>,<label2>,...],
            //     'tblData':[[<row1value1>,<row1value2>,...],[<row2value1>,<row2value2>,...],...]
            //   } or false,
            //   'html':<custom_html> or false
            // }
            'dataFunction': function(rowDataSet, jsonDataSet) {
                if (rowDataSet.STATUS == 'F') var properties = [['Reason of Failure',(rowDataSet.AppGenericStatusReasonValue || 'None/Unknown')]];
                else var properties = false;
                var html = '<p style="margin:0px; color:#1E4A68; font-weight:bold;text-align:center;font-size:11pt">&nbsp;Retries</p>';
                var table = false;
                
                var tblData = Array();
                var rsJobs = jsonDataSet.rsJobs;
                
                for (var i=0;i<rsJobs.length;i++) {
                    tblData.push([rsJobs[i].SchedulerJobId,rsJobs[i].EventRange,rsJobs[i].JobExitCode,rsJobs[i].AppStatusReason,rsJobs[i].GridEndId,rsJobs[i].Site,rsJobs[i].submitted,rsJobs[i].started,rsJobs[i].finished]);
                }
                
                table = {
                    'tblLabels':['SchedulerJobId','Id in Task','Appl Exit Code','Appl Exit Reason','Grid End Status','Site','Submitted','Started','Finished'],
                    'tblData':tblData
                };
                
                return [['properties',properties],['table',table],['html',html]];
            }
        },
        'sorting':[1,'desc'], // [<column_index>,<sorting_direction>], sorting_direction='desc'||'asc'
        'iDisplayLength': 25, // Number of rows to display on single page
        'aLengthMenu':[10, 15, 20, 25, 30, 50, 100, 200],
        // Column labels
        'tblLabels': ['SchedulerJobId','Id in Task','Job Status','Appl Exit Code','Grid End Status','Retries','Site','Submitted','Started','Finished'],
        // dataTables plugin column options
        // see: http://www.datatables.net/usage/columns
        'aoColumns': [
            {"sWidth":"200px"},
            {"sClass":"numericTD","sWidth":"90px"},
            {"sWidth":"100px"},
            {"sClass":"numericTD","sWidth":"110px"},
            {"sWidth":"110px"},
            {"sClass":"numericTD","sWidth":"70px"},
            null,
            null,
            null,
            null
        ],
        // Function: extracting array of data form Ajax response
        // Example:
        // - Ajax response: {'user_taskstable':[{col_val1, col_val2, ...}, ...]}
        // - Required function: function(data) { return data.user_taskstable; }
        'getDataArray': function(data) {
            //$.bbq.pushState({'user':data.taskjobs[1].username},0);
            return data.taskjobs[0];
        },
        // Function, translates ajax response onto dataTables plugin data format
        // Output: [[col_val1, col_val2, ...], ...]
        'translateData': function(dataJSON) {
            var jobStatuses = {
                'PR':'NotCompleted',
                'P':'Pending',
                'R':'Running',
                'U':'Unknown',
                'S':'Successfull',
                'F':'Failed'
            };
            var gridEndStatus = {
                'D':'Done',
                'A':'Aborted',
                'C':'Cancelled'
            };
            var replaceLinuxEpoch = function(time) {
                if (!time || (time == '1970-01-01 01:01:01')) return 'Unknown';
                else return time;
            };
            var tasksArr = Array();
            for (i in dataJSON) {
                tasksArr.push(Array(
                    ('<div class="wrapColumn" style="width:200px" title="'+dataJSON[i].SchedulerJobId+'"><a target="_blanc" href="http://panda.cern.ch:25980/server/pandamon/query?job='+dataJSON[i].EventRange+'">'+dataJSON[i].SchedulerJobId+'</a></div>' || 'default'),
                    (dataJSON[i].EventRange || '0'),
                    (jobStatuses[dataJSON[i].STATUS] ? '<div class="status '+jobStatuses[dataJSON[i].STATUS]+'">'+jobStatuses[dataJSON[i].STATUS]+'</div>' : '<div class="status Unknown">Unknown</div>'),
                    (dataJSON[i].JobExecExitCode || 'Not yet'),
                    (dataJSON[i].GridEndId || 'Unknown'),
                    (dataJSON[i].resubmissions || '0'),
                    ('<a href="http://dashb-atlas-ssb.cern.ch/dashboard/request.py/sitehistory?site='+dataJSON[i].Site+'">'+dataJSON[i].Site+'</a>' || '0'),
                    replaceLinuxEpoch(dataJSON[i].submitted),
                    replaceLinuxEpoch(dataJSON[i].started),
                    replaceLinuxEpoch(dataJSON[i].finished)
                ));
            }
            return tasksArr;
        },
        /*'tableActivityEvent': function(el) {
            $('.tblSort').lkfw_tooltip({
                'content':{
                    'SchedulerJobId':{
                        'html':'SchedulerJobID'
                    }
                },
                'take':'html',
                'delay':0,
                'css':{
                    'width':'215px'
                }
            });
            //alert('it works! (subs)');
        },*/
        // (optional) Function allowing to test the filters values before submitting the filters form
        // returns:
        //    true - if everything is ok
        //    false - if not
        //    (html) - if you want to display some comments
        'filtersPreSubmit':function(Data) {
            return true;
        },
        // (optional) filterGroups option allows filters to be grouped in a separate blocks
        // if filterGroups is defined `groupIndex` option has to be added to charts objects
        // to determine to which group filters should be attached
        'filterGroups':['Group 1','Group 2'],
        'filters':[
            {
                'label':'Select filter',  // String
                'urlVariable':'multifilter',  // String - lower cased, no spaces, no special characters
                'fieldType':'multiselect',  // String (text|select|multiselect|date)
                'groupIndex':0,
                'value':'',
                'options':{
                    'disableFiltersList':['textfilter'],
                    'translateData': function(jsonData) {
                        return [/*['','Off'],*/['1','opt1'],['2','opt2'],['3','opt3'],['4','opt4'],['5','opt5']];
                    }
                }
            },
            {
                'label':'Autocomplete filter',  // String
                'urlVariable':'autocomplete',  // String - lower cased, no spaces, no special characters
                'fieldType':'autocomplete',  // String (text|select|multiselect|date)
                'groupIndex':0,
                'value':'',
                'options':{
                    'disableFiltersList':['textfilter'],
                    'translateData': function(jsonData) {
                        return [
                            "ActionScript",
                            "AppleScript",
                            "Asp",
                            "BASIC",
                            "C",
                            "C++",
                            "Clojure",
                            "COBOL",
                            "ColdFusion",
                            "Erlang",
                            "Fortran",
                            "Groovy",
                            "Haskell",
                            "Java",
                            "JavaScript",
                            "Lisp",
                            "Perl",
                            "PHP",
                            "Python",
                            "Ruby",
                            "Scala",
                            "Scheme"
                        ];
                    }
                }
            },
            {
                'label':'Select filter',  // String
                'urlVariable':'textfilter',  // String - lower cased, no spaces, no special characters
                'fieldType':'text',  // String (text|select|date)
                'groupIndex':0,
                'value':'',
                'options':{}
            },
            {
                'label':'Date filter',  // String
                'urlVariable':'datefilter',  // String - lower cased, no spaces, no special characters
                'fieldType':'date',  // String (text|select|date)
                'groupIndex':1,
                'value':'',
                'options':{
                    'disableFiltersList':['textfilter','multifilter']
                }
            },
            {
                'label':'Select filter',  // String
                'urlVariable':'textfilter2',  // String - lower cased, no spaces, no special characters
                'fieldType':'text',  // String (text|select|date)
                'groupIndex':1,
                'value':'',
                'options':{
                    'disableFiltersList':['textfilter']
                }
            },
            {
                'label':'Task ID',  // String
                'urlVariable':'tid',  // String - lower cased, no spaces, no special characters
                'fieldType':'hidden',  // String (text|hidden|select|date|datetime)
                'groupIndex':1,
                'value':'',
                'options':{}
            }
        ],
        // (optional) chartGroups option allows charts (only for charts under `charts` option) 
        // to be grouped in a separate blocks
        // if filterGroups is defined `groupIndex` option has to be added to charts objects
        // to determine to which group filters should be attached
        'chartGroups':['Group 1','Group 2'],
        'chartColCount':2,
        'charts': [
            {
                'name':'Status Overview',
                'type':'hchart', // (gchart|hchart)
                'onDemand':false,
                'groupIndex':0,
                // translates data onto requires format:
                // {"chd":"t:60,40","chl":"Hello|World"}
                'translateData':function(dataMem) {
                    var data = dataMem.table.data;
                    var dataLen = data.length;
                    
                    if (dataLen > 0) {
                        var obj = {
                            'statuses':['S','F','R','PR','P','U'],
                            'statusesCnt':[0,0,0,0,0,0],
                            'statusesLbl':['Successful','Failed','Running','NotCompleted','Pending','Unknown'],
                            'statusesColors':['#59D118','#C50000','#3072F3','#BB72F3','#FF9900','#C2BDDD']
                        };
                        
                        for (var i=0; i<dataLen; i++) {
                            var row = data[i];
                            for (var j=0; j<obj.statuses.length; j++) {
                                if (row.STATUS == obj.statuses[j]) obj.statusesCnt[j]++;
                            }
                        }
                        
                        var data = [];
                        
                        for (var i=0;i<obj.statusesCnt.length;i++) {
                            if (obj.statusesCnt[i] > 0) {
                                if (obj.statuses[i] == 'F') data.push({name:obj.statusesLbl[i]+' ('+obj.statusesCnt[i]+')',color:obj.statusesColors[i],y:obj.statusesCnt[i],sliced:true,selected:true});
                                else data.push({name:obj.statusesLbl[i]+' ('+obj.statusesCnt[i]+')',color:obj.statusesColors[i],y:obj.statusesCnt[i]});
                            }
                        }
                    } else return false;
                    
                    output = {
                        chart: {
                            height:350,
                            width:550,
                            backgroundColor:'#ffffff',
                            borderColor:'#aaaaaa',
                            borderWidth:1
                        },
                        title: {
                            text: 'Status Overview'
                        },
                        tooltip: {
                            formatter: function() {return '<b>'+ this.point.name +'</b>: '+ this.y;}
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer'
                            }
                        },
                        series: [{
                            type: 'pie',
                            data: data
                        }]
                    };
                    
                    return output;
                }
            },
            {
                'name':'Jobs Distributed by Site',
                'type':'hchart', // (gchart|hchart)
                'onDemand':false,
                'groupIndex':0,
                // translates data onto requires format:
                // {"chd":"t:60,40","chl":"Hello|World"}
                'translateData':function(dataMem) {
                    var data = dataMem.table.data;
                    var dataLen = data.length;
                    
                    if (dataLen > 0) {
                        var in_array = function(array, p_val) {
                            for(var i = 0, l = array.length; i < l; i++) {
                                if(array[i] == p_val) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        
                        var obj = {
                            'statuses':['S','F','R','PR','P','U'],
                            'statusesCnt':[[],[],[],[],[],[]],
                            'sites':[],
                            'maxJobs':0,
                            'chds':[],
                            'statusesLbl':['Successful','Failed','Running','Not Compl.','Pending','Unknown'],
                            'statusesColors':['#59D118','#C50000','#3072F3','#BB72F3','#FF9900','#C2BDDD']
                        };
                        
                        for (var i=0; i<dataLen; i++) {
                            var row = data[i];
                            if (!in_array(obj.sites, row.Site)) { 
                                obj.sites.push(row.Site);
                                for (var k=0; k<obj.statuses.length; k++) {
                                    obj.statusesCnt[k].push(0);
                                }
                            }
                        }
                        
                        for (var j=0;j<obj.sites.length;j++) {
                            for (var i=0; i<dataLen; i++) {
                                var row = data[i];
                                //alert(obj.sites[j]+'=='+row.Site);
                                if (obj.sites[j] == row.Site) {
                                    for (var k=0; k<obj.statuses.length; k++) {
                                        if (row.STATUS == obj.statuses[k]) obj.statusesCnt[k][j]++;
                                    }
                                }
                            }
                        }
                        
                        var series = [];
                        
                        for (var i=0;i<obj.statuses.length;i++) {
                            var data = [];
                            var showFlag = false;
                            for (var j=0;j<obj.sites.length;j++) {
                                data.push(obj.statusesCnt[i][j]);
                                if (obj.statusesCnt[i][j] > 0) showFlag = true;
                            }
                            if (showFlag) series.push({name:obj.statusesLbl[i],color:obj.statusesColors[i],data:data});
                        }
                    } else return false;
                    
                    var output = {
                        chart: {
                            defaultSeriesType: 'column',
                            height:350,
                            width:550,
                            backgroundColor:'#ffffff',
                            borderColor:'#aaaaaa',
                            borderWidth:1
                        },
                        title: {
                            text: 'Jobs Distributed by Site'
                        },
                        xAxis: {
                            categories: obj.sites,
                            labels: {
                                rotation: -35,
                                align: 'right',
                                style: {
                                    font: "normal 9px 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif"
                                }
                            }
                        },
                        yAxis: {
                            min: 0,
                            allowDecimals: false,
                            gridLineWidth: 1,
                            title: {
                                text: 'Number of Jobs'
                            }
                        },
                        tooltip: {
                            shared: true,
                            crosshairs: true
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                pointPadding:0,
                                groupPadding:0,
                            }
                        },
                        series: series
                    }
                    return output;
                }
            },
            {
                'name':'Processed Events',
                'type':'hchart', // (gchart|hchart)
                'onDemand':true,
                'groupIndex':1,
                'dataURL': 'proceventscumulativeAlt',
                'dataURL_params': function(Data) { return {'taskmonid':Data.tid}; },
                // translates data onto requires format:
                // {"chd":"t:60,40","chl":"Hello|World"}
                'translateData':function(jsonDataSet) {
                    var procEventsArr = jsonDataSet.allfinished[0];
                    
                    if (procEventsArr.length == 0) return false;
                    
                    var statusesArr = ['FINISHED','FAILED'];
                    var series = [
                        {
                            name:'Finished',
                            color:'#32CD32',
                            data:[]
                        }
                    ];
                    var startdatestring = jsonDataSet.firststarted[0][0]['started'];
                    var enddatestring = jsonDataSet.lastfinished[0][0]['finished'];
                    var timeInterval = (enddatestring - startdatestring)/60;
                    var succjobstotalevents = jsonDataSet.succjobs[0][0]['TOTALEVENTS'];
                    
                    //procEventsArr.sort(function(a,b){return (Date.parse(getDateObj(a.finished))-Date.parse(b.finished));});
                    var bufF = 0;
                    for (var i=0;i<procEventsArr.length;i++) {
                        bufF += procEventsArr[i].Events;
                        var x = procEventsArr[i].finished*1000;
                        var obj = {y:bufF,x:x};
                        //alert('{y:'+bufF+',x:'+x+'}');
                        series[0].data.push(obj);
                    }
                    
                    if (procEventsArr.length == 1) {
                        var obj = {y:0,x:(startdatestring*1000)};
                        series[0].data.splice(0,0,obj);
                    }
                    
                    options = {
                        chart: {
                            defaultSeriesType: 'area',
                            height:350,
                            width:550,
                            backgroundColor:'#ffffff',
                            borderColor:'#aaaaaa',
                            borderWidth:1
                        },
                        title: {
                            text: succjobstotalevents+' processed events in '+Math.ceil(timeInterval)+' minutes'//'Job Evolution Cumulative Plot'
                        },
                        xAxis: {
                            type: "datetime",
                            startOnTick: false,
                            endOnTick: false,
                            showLastLabel: true,
                            gridLineWidth: 1,
                            //tickInterval:tickInterval,
                            dateTimeLabelFormats: {
                                second: '%H:%M',
                                minute: '%H:%M',
                                hour: '%H:%M',
                                day: '%H:%M' 
                            }
                        },
                        yAxis: {
                            min: 0,
                            allowDecimals: false,
                            gridLineWidth: 1,
                            title: {
                                text: 'Events Number'
                            }
                        },
                        legend: {enabled:false},
                        tooltip: {
                            shared: false,
                            crosshairs: true,
                            formatter: function() {
                                var d = new Date(this.x);
                                return d.toUTCString()+'<br>'+
                                    '<span style="color:'+this.series.color+'">Events:</span> <b>'+ this.y +'</b>';
                            }
                        },
                        plotOptions: {
                            area: {
                                marker: { radius:1 },
                                fillColor: '#dddddd',
                                shadow: false
                            }
                        },
                        series: series
                    }
                    return options;
                }
            }/*,
            {
                'name':'Application Failed Jobs by Reason of Failure',
                'type':'gchart', // (gchart|hchart)
                'onDemand':true,
                'dataURL': '/dashboard/request.py/terminatedjobsappAtl',
                'dataURL_params': function(Data) { return {'taskmonid':Data.tid}; },
                // translates data onto requires format:
                // {"chd":"t:60,40","chl":"Hello|World"}
                'translateData':function(data) {
                    var failArr = data.abortedByApplicationReason[0];
                    var dataLen = failArr.length;
                    
                    var obj = {
                        'statusesCnt':[],
                        'statusesLbl':[]
                    };
                    
                    for (var i=0; i<dataLen; i++) {
                        var row = failArr[i];
                        obj.statusesCnt.push(row.TOTAL);
                        obj.statusesLbl.push(row.JobExitReason+' ('+row.TOTAL+')');
                    }
                    
                    var output = {
                        "chd":"t:"+obj.statusesCnt.join(','),
                        "chl":obj.statusesLbl.join('|'),
                        'chtt':'Application Failed Jobs by Reason of Failure',
                        'cht':'p3',
                        'chs':'430x190'
                    };
                    return output;
                }
            }*/
        ]
    };
    // Task Jobs settings - FINISH
}
