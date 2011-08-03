// This file is part of the jTaskMonitoring software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
// 31.03.2011 Major v1.2.0 release (many changes to settings and core of the application)
//

/*JSHINT*/
/*global Settings: false, Data: false, Highcharts: false, Events: false*/

function Controller() {
    // Data class initialization
    this.Settings = new Settings();
    this.Data = new Data($('#ajaxAnimation'), this.Settings);
    
    this.Tables = {'mains':[],'subs':[]};
    //this.subsTable = [];
    
    this.appDisplayState = function() {
        var _Settings = this.Settings.Application; // Shortcut
        if (this.Data.user || !_Settings.userSelection) {
            if (this.Data.tid) {
                // Show subs
                return 'subs';
            }
            else {
                //show mains
                return 'mains';
            }
        }
        else if (_Settings.userSelection) {
            // Show users
            return 'users';
        }
    };
    
    this.openActiveMenu = function() {//alert('inside function openActiveMenu');
        // Open active menu
        if (this.Data.activemenu !== 0) {
            //alert('menu active');
            if (!$('#dropDownMenu'+this.Data.activemenu).hasClass('selected')) {
                //alert('clicking to open');
                $('#dropDownMenu'+this.Data.activemenu).trigger('click',[true]);
                //alert('clicked');
            }
        } else {
            //alert('clicking ot close');
            $('.dropDown.selected').trigger('click',[true]);
            //alert('clicked to close');
        }
        //alert('exiting function openActiveMenu');
    };
    
    // "viewUpdater" function updates all page controls
    // and decides what to display based on available data
    this.viewUpdater = function() {
        var _Settings = this.Settings.Application; // Shortcut
        
        if (this.appDisplayState() == 'subs') {
            // Show subs
            this.mainsTable = [];
            this.openActiveMenu();
            this.drawMainsTable(this.Settings.Subs);
            $('#content').show();
        }
        else if (this.appDisplayState() == 'mains') {
            //show mains
            this.Data.uparam = [];
            this.subsTable = [];
            this.openActiveMenu();
            this.drawMainsTable(this.Settings.Mains);
            $('#content').show();
        }
        else if (this.appDisplayState() == 'users') {
            // Show users
            this.Data.uparam = [];
            this.mainsTable = [];
            this.subsTable = [];
            this.breadcrumbs_update();
            $('#content').hide();
            this.hideShowFilters('hide');
            this.Data.activemenu = 2;
            this.openActiveMenu();
            //if (this.Data.activemenu != 2) $('#dropDownMenu2').trigger('click');
            //this.drawUsers();
        }
        try {    
            // Create filters elements
            this.drawFilters();
            this.userRefresh_update();
            this.filtersUpdate();
            this.noreload = true;
            this.setupURL();
        } catch(err) {
            if (_Settings.debugMode) this.setupErrorDialog(err);
        }
    };
    
    // "drawUsers" draws users selection page
    this.drawUsers = function() {
        var thisRef = this;
        var _Settings = this.Settings.Users; // Shortcut
        
        // "draw" function is calling lkfw.searchable.list plugin to create searchable list of users
        var draw = function() {
            // Charts tab chandling - start
            $('#chartContent').empty(); // Empty charts tab
            $("#siteTabs").tabs("select",0); // Select data table tab
            $("#siteTabs").tabs("disable",1); // Disable charts tab
            $('#topTableCharts').empty();
            // Charts tab chandling - finish
            
            $('#usersToggleMenu').lkfw_searchableList({
                listId: 'users',
                items: thisRef.Data.mem.users,
                srchFldLbl: _Settings.searchLabel
            });
            
            $('#users_0 li').unbind('click').click( function() { thisRef.userListItem_Click(this); });
            //thisRef.breadcrumbs_update();
        };
        
        // Hide filters panel
        //if (this.appDisplayState() == 'users') thisRef.hideShowFilters('hide');//$('#dataFilters').hide();
        
        // Draw searchable list
        if (this.Data.mem.users) draw();
        
    };
    
    // "getUsers" retrieves users list and builds user drop-down selection field
    this.getUsers = function() {
        var thisRef = this;
        var _Settings = this.Settings.Users; // Shortcut
        
        if (_Settings.dataURL_params === undefined) _Settings.dataURL_params = function() { return {}; };
        
        // "getData" function converts data given by ajax request onto
        // lkfw.searchable.list plugin readable format
        // Arguments:
        //   data - object returned by ajax call
        var getData = function(data) {
            try {
                thisRef.Data.mem.users = _Settings.translateData(data);
            } catch(err) {
                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err);
            }
            
            thisRef.generateUserDropdownOptions();
            
            /*if (!(this.Data.user || $.bbq.getState('user'))) */thisRef.drawUsers();
        };
        
        // Get the users list from ajax call
        this.Data.ajax_getData('usersReq', _Settings.dataURL, _Settings.dataURL_params(this.Data), getData, function(){});
    };
    
    // "drawDataTable" draws data table for subs (in ganga nomenclature)
    // or mains (in CMS nomenclature)
    this.drawMainsTable = function(_Settings) {
        var thisRef = this;
        //var _Settings = this.Settings.Mains; // Shortcut
        
        if (_Settings.dataURL_params === undefined) _Settings.dataURL_params = function() { return {}; };
        
        // "draw" function is calling lkfw.datatable plugin to create table filled with data
        var draw = function(data) {
            // Charts tab handling - start
            if (_Settings.charts !== undefined) $("#siteTabs").tabs("enable",1); // Enable charts tab
            else $("#siteTabs").tabs("disable",1); // Disable charts tab
            $("#siteTabs").tabs("select",0); // Select data table tab
            $('#topTableCharts').empty();
            // Charts tab handling - finish
            
            thisRef.mainsTable = $('#tableContent').lkfw_dataTable({
                dTable: thisRef.Tables[_Settings.tableID],
                tableId: 'mains',
                expandableRows: _Settings.expandableRows,
                multipleER: _Settings.multipleER,
                items: data,
                tblLabels: _Settings.tblLabels,
                rowsToExpand: thisRef.Data.or,
                useScrollerPlugin: ( (_Settings.useScrollerPlugin !== undefined) ? _Settings.useScrollerPlugin : false ),
                sorting: (thisRef.Data.sorting.length > 0 ? thisRef.Data.sorting : _Settings.sorting),
                fnERContent:function(dataID){ return thisRef.expand_click(dataID); },
                fnERContentPostProcess:function(expandedID,inputObj){ return thisRef.expand_click_postprocess(expandedID,inputObj,true); },
                fnContentChange: function(el) { thisRef.mainsTableContent_change(el); },
                fnERClose: function(dataID) { thisRef.erClose_click(dataID); },
                fnTableSorting: function(el) { thisRef.tableSorting_click(el,thisRef.mainsTable[0]); },
                dataTable: {
                    iDisplayLength: thisRef.Data.records,//_Settings.iDisplayLength,
                    sPaginationType: "input",
                    bLengthChange: ( (_Settings.aLengthMenu !== undefined) ? true : false ),
                    aLengthMenu:( (_Settings.aLengthMenu !== undefined) ? _Settings.aLengthMenu : [10, 25, 50, 100] ),
                    aoColumns: _Settings.aoColumns
                }
            });
            thisRef.breadcrumbs_update();
            
            $('#loadingTable').stop(true, true).fadeOut(400);
        };
        
        // "getData" function converts data given by ajax request onto
        // lkfw.datatable plugin readable format
        // Arguments:
        //   data - object returned by ajax call
        var getData = function(data) {
            var userMains = _Settings.getDataArray(data);
            var t = new Date();
            var tSettings, tPages;
            
            // Save the data
            thisRef.Data.mem.table = {
                user: this.Data.user,
                timestamp: Math.floor(t.getTime()/1000),
                data: userMains
            };
            
            // Draw data table
            try {
                draw(_Settings.translateData(userMains));
            } catch(err) {
                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err);
            }
            
            // Setting up current page - START
            tSettings = thisRef.mainsTable[0].fnSettings();
            tPages = parseInt( (tSettings.fnRecordsDisplay()-1) / tSettings._iDisplayLength, 10 ) + 1;
            
		    if ( $.bbq.getState('p') && ($.bbq.getState('p') <= tPages) ) {
                $('#url-page').trigger('click');  // Load page number from URL
                thisRef.Data.noreload = true;  // tell keyup event that page has been reloaded (history is not working without this)
                $('#dataTable_0_filter input').trigger('keyup');  // Recreate expand events for current page
                thisRef.Data.noreload = false;  // Make sure that noreload is off after operation
            }
            else {
                thisRef.Data.p = 1;
                $('#dataTable_0_filter input').trigger('keyup');  // Recreate expand events for current page
                thisRef.Data.noreload = true;
                thisRef.setupURL();
            }
            // Setting up current page - FINISH
            
            $.each(thisRef.Data.or, function() {
                $('#tablePlus_'+this).parent().trigger('click');
            });
            
            // Hide filters panel
            if (_Settings.filters !== undefined) thisRef.hideShowFilters('show');//$('#dataFilters').show();
            else thisRef.hideShowFilters('hide');//$('#dataFilters').hide();
            
            thisRef.executeCharts(_Settings.charts, 'cht_', '#chartContent');
            thisRef.executeCharts(_Settings.topTableCharts, 'topTblcht_', '#topTableCharts', true);
        };
        
        // Get the data from ajax call
        $('#loadingTable').delay(800).fadeIn(400); // Dim content area
        $('#breadcrumbs a').css('color','#888888').unbind();
        this.Data.ajax_getData('mainsReq', _Settings.dataURL, _Settings.dataURL_params(this.Data), getData, function(){});
    };
    
    /*this.drawSubsTable = function() {
        var thisRef = this;
        var _Settings = this.Settings.Subs; // Shortcut
        
        if (_Settings.dataURL_params === undefined) _Settings.dataURL_params = function() { return {}; };
        
        // "draw" function is calling lkfw.datatable plugin to create table filled with data
        var draw = function(data) {
            // Charts tab handling - start
            if (_Settings.charts !== undefined) $("#siteTabs").tabs("enable",1); // Enable charts tab
            else $("#siteTabs").tabs("disable",1); // Disable charts tab
            $("#siteTabs").tabs("select",0); // Select data table tab
            $('#topTableCharts').empty();
            // Charts tab handling - finish
            
            thisRef.subsTable = $('#tableContent').lkfw_dataTable({
                dTable: thisRef.subsTable,
                tableId: 'subs',
                expandableRows: _Settings.expandableRows,
                multipleER: _Settings.multipleER,
                items: data,
                tblLabels: _Settings.tblLabels,
                useScrollerPlugin: ( (_Settings.useScrollerPlugin !== undefined) ? _Settings.useScrollerPlugin : false ),
                sorting: (thisRef.Data.sorting.length > 0 ? thisRef.Data.sorting : _Settings.sorting),
                fnERContent:function(dataID){ return thisRef.expand_click(dataID); },
                fnERContentPostProcess:function(expandedID,inputObj){ return thisRef.expand_click_postprocess(expandedID,inputObj,false); },
                fnContentChange: function(el) { thisRef.subsTableContent_change(el); },
                fnERClose: function(dataID) { thisRef.erClose_click(dataID); },
                fnTableSorting: function(el) { thisRef.tableSorting_click(el,thisRef.subsTable[0]); },
                dataTable: {
                    iDisplayLength: thisRef.Data.records,//_Settings.iDisplayLength,
                    sPaginationType: "input",
                    bLengthChange: ( (_Settings.aLengthMenu !== undefined) ? true : false ),
                    aLengthMenu:( (_Settings.aLengthMenu !== undefined) ? _Settings.aLengthMenu : [10, 25, 50, 100] ),
                    aoColumns: _Settings.aoColumns
                }
            });
            thisRef.breadcrumbs_update();
            
            // Create filters elements
            thisRef.drawFilters();
            
            $('#loadingTable').stop(true, true).fadeOut(400);
        };
        
        // "getData" function converts data given by ajax request onto
        // lkfw.datatable plugin readable format
        // Arguments:
        //   data - object returned by ajax call
        var getData = function(data) {
            var tSettings, tPages;
            var mainSubs = _Settings.getDataArray(data);
            var t = new Date();
            
            // Save the data
            thisRef.Data.mem.subs = {
                user: this.Data.user,
                timestamp: Math.floor(t.getTime()/1000),
                data: mainSubs
            };
            
            // Draw data table
            try {
                draw(_Settings.translateData(mainSubs));
            } catch(err) {
                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err);
            }
            
            tSettings = thisRef.subsTable[0].fnSettings();
            tPages = parseInt( (tSettings.fnRecordsDisplay()-1) / tSettings._iDisplayLength, 10 ) + 1;
            
            if ( $.bbq.getState('p') && ($.bbq.getState('p') <= tPages) ) {
                $('#url-page').trigger('click');  // Load page number from URL
                thisRef.Data.noreload = true;  // tell keyup event that page has been reloaded (history is not working without this)
                $('#dataTable_0_filter input').trigger('keyup');  // Recreate expand events for current page
                thisRef.Data.noreload = false;  // Make sure that noreload is off after operation
            } else {
                thisRef.Data.p = 1;
                $('#dataTable_0_filter input').trigger('keyup');  // Recreate expand events for current page
                thisRef.Data.noreload = true;
                thisRef.setupURL();
            }
            
            $.each(thisRef.Data.or, function() {
                $('#tablePlus_'+this).parent().trigger('click');
            });
            
            // Hide filters panel
            if (_Settings.filters !== undefined) thisRef.hideShowFilters('show');//$('#dataFilters').show();
            else thisRef.hideShowFilters('hide');//$('#dataFilters').hide();
            
            thisRef.executeCharts(_Settings.charts, 'cht_', '#chartContent');
            thisRef.executeCharts(_Settings.topTableCharts, 'topTblcht_', '#topTableCharts', true);
        };
        
        // Get the data from ajax call
        $('#loadingTable').delay(800).fadeIn(400); // Dim content area
        $('#breadcrumbs a').css('color','#888888').unbind();
        this.Data.ajax_getData('subsReq', _Settings.dataURL, _Settings.dataURL_params(this.Data), getData, function(){});
    };*/
    
    this.drawChart = function(_charts, domIdPrefix, cnt, forceDraw) {
        if (forceDraw === undefined) forceDraw = false;
        if (_charts[cnt].onDemand === undefined) _charts[cnt].onDemand = false;
        
        var thisRef = this;
        
        var gChartDraw = function(gData) {
            var query = gData.join('&');
            thisRef.charts_load(query, domIdPrefix, cnt);
        };
        
        var hChartDraw = function(hData) {
            if (hData.chart === undefined) hData.chart = {};
            hData.chart.renderTo = domIdPrefix+cnt;
            hData.credits = false;
            new Highcharts.Chart(hData);
        };
        
        var tableDraw = function(tData) {
            thisRef.chartsTable_load(tData, domIdPrefix, cnt);
        };
        
        var getData = function(data, chart) {
            var i, translatedData, gData, hData, tData;
            
            translatedData = chart.translateData(data);
            if (translatedData === false) {
                thisRef.drawNoDataMessage(_charts, domIdPrefix, cnt);
                return false;
            }
            if (chart.type == 'gchart') {
                gData = [];
                for (i in translatedData) { // Adding dynamic variables
                    if (translatedData.hasOwnProperty(i)) {
                        gData.push(i+'='+translatedData[i]);
                    }
                }
                gChartDraw(gData);
            }
            else if (chart.type == 'hchart') {
                hData = translatedData;
                hChartDraw(hData);
            }
            else if (chart.type == 'table') {
                tData = translatedData;
                tableDraw(tData);
            }
        };
        
        if (_charts[cnt].onDemand === false || forceDraw === true) {
            // Get the data from ajax call
            if (_charts[cnt].dataURL) {
                if (_charts[cnt].dataURL_params === undefined) _charts[cnt].dataURL_params = function() { return {}; };
                this.Data.ajax_getData_sync('chartData_'+cnt, _charts[cnt].dataURL, _charts[cnt].dataURL_params(this.Data), getData, function(){},_charts[cnt]);
            }
            else {
                getData(this.Data.mem, _charts[cnt]);
            }
        }
        else {
            this.drawChtRequestButton(_charts, domIdPrefix, cnt);
        }
    };
    
    this.executeCharts = function(_charts, domIdPrefix, tableTarget, hideTargetElement) {
        var thisRef = this;
        
        try {
            $(tableTarget).empty();
            this.charts_prepTable(_charts.length, tableTarget, domIdPrefix);
            for (var cnt=0;cnt<_charts.length;cnt++) {
                this.drawChart(_charts, domIdPrefix, cnt);
            }
        } catch(err) {
            if (_charts !== undefined && this.Settings.Application.debugMode) this.setupErrorDialog(err);
        }
    };
    
    // "setupURL" builds url fragmant for bookmarking
    this.setupURL = function() {
        var thisRef = this;
            
        var updateHashwithFilters = function(urlHash, _Settings) {
            if (_Settings.filters !== undefined) {
                for (var i=0;i<_Settings.filters.length;i++) {
                    urlHash[_Settings.filters[i].urlVariable] = thisRef.Data.filters[_Settings.filters[i].urlVariable];
                }
            }
            return urlHash;
        };
        
        var urlHash = {
            user:this.Data.user,
            refresh:this.Data.refresh,
            tid:this.Data.tid,
            table:this.Data.table,
            p:this.Data.p,
            records:this.Data.records,
            sorting:this.Data.sorting,
            or:this.Data.or,
            uparam:this.Data.uparam,
            activemenu:this.Data.activemenu
        };
        
        if (this.appDisplayState() == 'mains') {
            urlHash = updateHashwithFilters(urlHash, this.Settings.Mains);
        }
        else if (this.appDisplayState() == 'subs') {
            urlHash = updateHashwithFilters(urlHash, this.Settings.Subs);
        }
        $.bbq.pushState(urlHash,2);
    };
    
    // "Init" initializes the monitoring system
    this.Init = function() {
        var _Settings = this.Settings.Application; // Shortcut
        var thisRef = this;
        
        // Application settings
        // Remove users drop down box
        //if (!_Settings.userSelection && _Settings.userSelection !== undefined) $('#userDropBox').hide();
        if (!_Settings.dataRefresh && _Settings.dataRefresh !== undefined) $('#refreshDropBox').hide();
        $('title').text(_Settings.pageTitle); // Set page title
        $('#footerTxt').html(_Settings.footerTxt); // Set footer text
        $('#menuHelp a').attr('href', _Settings.supportLnk);
        $('#logo').css('background-image', 'url('+_Settings.logoLnk+')');
        $("#dialog-message").dialog({autoOpen: false});
        
        // Events definitions
        $('#refresh').change( function() { thisRef.refresh_Change(this); });
        $('#refreshImg').click( function() { thisRef.viewUpdater(); } );
        $('.dropDown').toggle(function(event, noActiveMenuReset){
            thisRef.openMenu_Click(this, noActiveMenuReset);
        }, function(event, noActiveMenuReset) {
            thisRef.closeMenu_Click(this, noActiveMenuReset);
        });
		
		// Activate tabs
        $("#siteTabs").tabs({select: function(event, ui) {
            if (ui.index == 1) $('#topTableCharts').hide();
            else $('#topTableCharts').show();
        }});
        
        // Setup Data from URL
        this.Data.quickSetup($.bbq.getState());
        
        // Init users search
        if (_Settings.userSelection) this.getUsers();
        
        // Bind the event onhashchange
        $(window).bind('hashchange', function(){
            thisRef.Data.quickSetup($.bbq.getState());
            if (!thisRef.Data.noreload) thisRef.viewUpdater();
            else thisRef.Data.noreload = false;
            
            // Running settings post processing (if avaliable)
            try {
                _Settings.hashChangeEvent(thisRef.appDisplayState(thisRef.Data.mem));
            } catch(err) { /* do nothing */ }
        });
        
        this.viewUpdater();
        
        // Running settings post processing (if avaliable)
        try {
            _Settings.initEvent(thisRef.appDisplayState(),thisRef.Data.mem);
        } catch(err) { /* do nothing */ }
        
        // Set up refresh
        this.refresh_Change('#refresh');
    };
}

// Inherits from Events()
Controller.prototype = new Events();
