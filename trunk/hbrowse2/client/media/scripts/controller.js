// This file is part of the hBrowse software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
// 31.03.2011 Major v1.2.0 release (many changes to settings and core of the application)
// 19.09.2011 version 2.0.0 release
//

/*JSHINT*/
/*global Settings: false, Data: false, Highcharts: false, Events: false*/

/*
   Class: Controller
   This class is responsible for the page logic
*/
function Controller() {

// ============================================================================
// Object globals initialization - START
// ============================================================================

    // Data class initialization
    this.Settings = new Settings();
    this.Data = new Data($('#ajaxAnimation'), this.Settings);
    
    this.Table = [];
    this.Filter = '';
    
// ============================================================================
// Object globals initialization - FINISH
// ============================================================================

// ============================================================================
// UI driving functions - START
// ============================================================================

// Display application state --------------------------------------------------

    /*
        Function: appDisplayState
        Determines application state. Tells if application is in used 
        selection dialog or displaying a data table
        
        Returns:
            String, 'users' or 'table'
            
        See Also:
            <viewUpdater>
    */
    this.appDisplayState = function() {
        var _Settings = this.Settings.Application; // Shortcut
        if (this.Data.state('user') || !_Settings.userSelection) {
            // Show table
            return 'table';
        }
        else if (_Settings.userSelection) {
            // Show users
            return 'users';
        }
    };
    
// ----------------------------------------------------------------------------

// Open active menu -----------------------------------------------------------
    
    /*
        Function: openActiveMenu
        Opens active menu (based on URL)
    */
    this.openActiveMenu = function() {
        var i, menuIdList = [1,2];
        // Open active menu
        if (this.Data.state('activemenu') !== 0) {
            // Close other menus
            for (i=1;i<=menuIdList.length;i++) {
                if (i != this.Data.state('activemenu') && $('#dropDownMenu'+i).hasClass('selected')) {
                    $('#dropDownMenu'+i).trigger('click',[true]);
                }
            }
            // Open Active
            if (!$('#dropDownMenu'+this.Data.state('activemenu')).hasClass('selected')) {
                $('#dropDownMenu'+this.Data.state('activemenu')).trigger('click',[true]);
            }
        } else {
            $('.dropDown.selected').trigger('click',[true]);
        }
    };
    
// ----------------------------------------------------------------------------

// Current table --------------------------------------------------------------
    
    /*
        Function: resolveTable
        Determines what table is currently in use
        
        Returns:
            Table object name (string)
    */
    this.resolveTable = function() {
        var defaults;
        if (this.Data.state('table') != '') {
            return this.Data.state('table');
        } else {
            defaults = this.Settings.Application.modelDefaults();
            return defaults.Mains;
        }
    };
    
// ----------------------------------------------------------------------------

// Update view ----------------------------------------------------------------
    
    /*
        Function: viewUpdater
        Updates all page controls and decides what to display based on available data
    */
    this.viewUpdater = function() {
        var _Settings = this.Settings.Application; // Shortcut
        
        if (this.appDisplayState() == 'table') {
            //show table
            this.openActiveMenu();
            this.drawTable(this.Settings[this.Data.state('table')]);
            $('#content').show();
        }
        else if (this.appDisplayState() == 'users') {
            // Show users
            this.breadcrumbs_update();
            $('#content').hide();
            this.hideShowFilters('hide');
            this.Data.state('activemenu', 2);
            this.openActiveMenu();
        }
        try {
            this.pageRefresh_update();
            this.noreload = true;
            this.setupURL();
        } catch(err) {
            if (_Settings.debugMode) this.setupErrorDialog(err);
        }
    };

// ----------------------------------------------------------------------------
    
// ============================================================================
// UI driving functions - FINISH
// ============================================================================

// ============================================================================
// Users selection controls - START
// ============================================================================

// Draw users -----------------------------------------------------------------

    /*
        Function: drawUsers
        Draws users selection control
        
        See Also:
            <getUsers>
    */
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
            
            // Uses lkfw_searchableList plugin (see scripts/components/) to draw user selection field
            $('#usersToggleMenu').lkfw_searchableList({
                listId: 'users',
                items: thisRef.Data.state().mem.users,
                srchFldLbl: _Settings.searchLabel
            });
            
            $('#users_0 li').unbind('click').click( function() { thisRef.userListItem_Click(this); });
        };
        
        // Draw searchable list
        if (this.Data.state().mem.users) draw();
        
    };
    
// ----------------------------------------------------------------------------

// Get users list -------------------------------------------------------------
    
    /*
        Function: getUsers
        Gets users list from ajax request and executes the draw function for the users list
        
        See Also:
            <drawUsers>
    */
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
                thisRef.Data.state().mem.users = _Settings.translateData(data);
            } catch(err) {
                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err);
            }
            
            thisRef.drawUsers();
        };
        
        // Get the users list from ajax call
        this.Data.ajax_getData('usersReq', _Settings.dataURL, _Settings.dataURL_params(this.Data.state()), getData, function(){});
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Users selection controls - FINISH
// ============================================================================

// ============================================================================
// Datatable controls - START
// ============================================================================
    
// Draw data tabel----------------------------------------------------------------------------

    /*
        Function: drawTable
        Draws a datatable, sets up events for it
        
        Parameters:
            _Settings - shortcut to table settings
            
        See Also:
            <viewUpdater>
    */
    this.drawTable = function(_Settings) {
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
                dTable: thisRef.Table,
                tableId: 'mains',
                expandableRows: _Settings.expandableRows,
                multipleER: _Settings.multipleER,
                items: data,
                tblLabels: _Settings.tblLabels,
                rowsToExpand: thisRef.Data.state('or'),
                useScrollerPlugin: ( (_Settings.useScrollerPlugin !== undefined) ? _Settings.useScrollerPlugin : false ),
                sorting: (thisRef.Data.state('sorting').length > 0 ? thisRef.Data.state('sorting') : _Settings.sorting),
                fnERContent:function(trID, thatRef, drawERfunction){ return thisRef.expand_click(trID, thatRef, drawERfunction); },
                fnERContentPostProcess:function(expandedID,inputObj){ return thisRef.expand_click_postprocess(expandedID,inputObj,true); },
                fnContentChange: function(el) { thisRef.mainsTableContent_change(el); },
                fnERClose: function(dataID) { thisRef.erClose_click(dataID); },
                fnTableSorting: function(el) { thisRef.tableSorting_click(el,thisRef.mainsTable[0]); },
                dataTable: {
                    iDisplayLength: thisRef.Data.state('records'),//_Settings.iDisplayLength,
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
            
            // Save the data into model
            thisRef.Data.state().mem.table = {
                user: thisRef.Data.state('user'),
                timestamp: Math.floor(t.getTime()/1000),
                data: userMains,
                json: data
            };
            
            // Draw data table
            try {
                draw(_Settings.translateData(userMains));
            } catch(err) {
                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err);
            }
            
            // Create filters elements
            thisRef.drawFilters();
            thisRef.filtersUpdate();
            
            // Setting up current page - START
            tSettings = thisRef.mainsTable[0].fnSettings();
            tPages = parseInt( (tSettings.fnRecordsDisplay()-1) / tSettings._iDisplayLength, 10 ) + 1;
            
		    if ( $.bbq.getState('p') && ($.bbq.getState('p') <= tPages) ) {
                $('#url-page').trigger('click');  // Load page number from URL
                thisRef.Data.state('noreload', true);  // tell keyup event that page has been reloaded (history is not working without this)
                $('#dataTable_0_filter input').trigger('keyup');  // Recreate expand events for current page
                thisRef.Data.state('noreload', false);  // Make sure that noreload is off after operation
            }
            else {
                thisRef.Data.state('p', 1);
                $('#dataTable_0_filter input').trigger('keyup');  // Recreate expand events for current page
                thisRef.Data.state('noreload', true);
                thisRef.setupURL();
            }
            // Setting up current page - FINISH
            
            $.each(thisRef.Data.state('or'), function() {
                $('#tablePlus_'+this).parent().trigger('click');
            });
            
            // Hide filters panel
            if (_Settings.filters !== undefined) thisRef.hideShowFilters('show');//$('#dataFilters').show();
            else thisRef.hideShowFilters('hide');//$('#dataFilters').hide();
            
            thisRef.executeCharts(_Settings.charts, 'cht_', '#chartContent', _Settings);
            thisRef.executeCharts(_Settings.topTableCharts, 'topTblcht_', '#topTableCharts');
        };
        
        // Get the data from ajax call
        $('#loadingTable').delay(800).fadeIn(400); // Dim content area
        $('#breadcrumbs a').css('color','#888888').unbind();
        this.Data.ajax_getData('mainsReq', _Settings.dataURL, _Settings.dataURL_params(this.Data.state()), getData, function(){});
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Datatable controls - FINISH
// ============================================================================

// ============================================================================
// Charts - START
// ============================================================================
    
// Draw chart -----------------------------------------------------------------
    
    /*
        Function: drawChart
        Handles drawing a single chart depenting on chart object from settings
        
        Parameters:
            _charts - Current table charts object (from settings)
            domIdPrefix - ID prefix for individual chart wrapping span
            destIndex - Into or Array, depending on charts beeing groupped or not
                        Used to create individual chart wrapping span ID
            forceDraw - If true, chart will be displayed even if set to onDemand
                        Used when clicking 'load Chart' button
        
        See Also:
            <executeCharts>
    */
    this.drawChart = function(_charts, domIdPrefix, destIndex, forceDraw) {
        if (forceDraw === undefined) forceDraw = false;
        
        var cnt, thisRef = this;
        
        if ($.isArray(destIndex)) {
            cnt = destIndex[0];
            domId = domIdPrefix+destIndex[1]+'_'+destIndex[2];
        } else {
            cnt = destIndex;
            domId = domIdPrefix+destIndex;
        }
        
        if (_charts[cnt].onDemand === undefined) _charts[cnt].onDemand = false;
        
        var gChartDraw = function(gData) {
            var query = gData.join('&');
            thisRef.googleCharts_load(query, domId);
        };
        
        var hChartDraw = function(hData) {
            if (hData.chart === undefined) hData.chart = {};
            hData.chart.renderTo = domId;//domIdPrefix+cnt;
            hData.credits = false;
            new Highcharts.Chart(hData);
        };
        
        var tableDraw = function(tData) {
            thisRef.tableCharts_load(tData, domId);
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
                this.Data.ajax_getData_alt('chartData_'+cnt, _charts[cnt].dataURL, _charts[cnt].dataURL_params(this.Data.state()), getData, function(){},_charts[cnt]);
            }
            else {
                getData(this.Data.state().mem, _charts[cnt]);
            }
        }
        else {
            this.drawChtRequestButton(_charts, domIdPrefix, destIndex);
        }
    };
    
// ----------------------------------------------------------------------------

// Execute charts -------------------------------------------------------------
    
    /*
        Function: executeCharts
        Function that controlls charts drawing
        
        Parameters:
            _charts - Current table charts object (from settings)
            domIdPrefix - ID prefix for individual chart wrapping span
            tableTarget - target DOM object to which charts should be rendered
            _Settings - Current table Settings object shortcut
            
        See Also:
            <drawChart>
    */
    this.executeCharts = function(_charts, domIdPrefix, tableTarget, _Settings) {
        if (_Settings === undefined) _Settings = {};
        
        var i, groupingArr = [], groupTableIndexes = [], destIndex;
        var thisRef = this;
        
        try {
            $(tableTarget).empty();
            
            if (_Settings.chartGroups !== undefined) {
                $.each(_Settings.chartGroups, function(i, group) {
                    groupTableIndexes.push(0);
                });
                
                $.each(_charts, function(i, chartObj) {
                    if (chartObj.groupIndex === undefined) chartObj.groupIndex = 0;
                    groupingArr.push([ i, chartObj.groupIndex, groupTableIndexes[ chartObj.groupIndex ] ]);
                    groupTableIndexes[ chartObj.groupIndex ]++;
                });
                
                this.charts_prepGroups(tableTarget, domIdPrefix, groupTableIndexes, _Settings.chartGroups);
            } else {
                this.charts_prepTable(_charts.length, tableTarget, domIdPrefix);
            }
            
            for (i=0;i<_charts.length;i++) {
                if (groupingArr.length > 0) destIndex = groupingArr[i];
                else destIndex = i;
                this.drawChart(_charts, domIdPrefix, destIndex);
            }
        } catch(err) {
            if (_charts !== undefined && this.Settings.Application.debugMode) this.setupErrorDialog(err);
        }
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Charts - FINISH
// ============================================================================

// ============================================================================
// URL - START
// ============================================================================
    
// Setup URL ------------------------------------------------------------------
    
    /*
        Function setuURL
        Sets up url hash fragment variables to comply with model state
    */
    this.setupURL = function() {
        var thisRef = this;
        
        if (this.appDisplayState() == 'table') {
            //show table
            this.Data.state('uparam', []);
            this.Table = [];
        }
        else if (this.appDisplayState() == 'users') {
            // Show users
            this.Data.state('uparam', []);
            this.Data.state('breadcrumbs', []);
            this.Table = [];
        }
            
        var updateHashwithFilters = function(urlHash, _Settings) {
            if (_Settings.filters !== undefined) {
                for (var i=0;i<_Settings.filters.length;i++) {
                    urlHash[_Settings.filters[i].urlVariable] = thisRef.Data.state().filters[_Settings.filters[i].urlVariable];
                }
            }
            return urlHash;
        };
        
        var urlHash = {
            user:this.Data.state('user'),
            refresh:this.Data.state('refresh'),
            table:this.Data.state('table'),
            p:this.Data.state('p'),
            records:this.Data.state('records'),
            sorting:this.Data.state('sorting'),
            or:this.Data.state('or'),
            uparam:this.Data.state('uparam'),
            activemenu:this.Data.state('activemenu')
        };
        
        if (this.appDisplayState() == 'table') {
            urlHash = updateHashwithFilters(urlHash, this.Settings[this.Data.state('table')]);
        }
        $.bbq.pushState(urlHash,2);
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Charts - FINISH
// ============================================================================
    
// ============================================================================
// Controller initialization - START
// ============================================================================

// Load the data on application start -----------------------------------------

    this.onLoadRequest = function() {
        var _Settings = this.Settings.Application; // Shortcut
        var thisRef = this;
        
        var dataHandler = function(jsonData) {
            thisRef.Data.state().mem.onload = jsonData;
            try {
                _Settings.initEvent(thisRef.appDisplayState(),thisRef.Data.state('mem'));
            } catch(err) { /* do nothing */ }
        };
        
        if (_Settings.onLoadRequestURL !== undefined) {
            this.Data.ajax_getData_alt('onLoadRequest', _Settings.onLoadRequestURL, {}, dataHandler, $.noop, obj);
        } else {
            try {
                _Settings.initEvent(thisRef.appDisplayState(),thisRef.Data.state('mem'));
            } catch(err) { /* do nothing */ }
        }
    };
    
// ----------------------------------------------------------------------------

// Initialize the application -------------------------------------------------
    
    /*
        Function: Init
        Initialization function for the entire hBrowse system and Controller
        object in particular
    */
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
        $('#submitFilters').click(function(){ thisRef.filtersSubmit_click(this); });
		
		// Activate tabs
        $("#siteTabs").tabs({select: function(event, ui) {
            if (ui.index == 1) $('#topTableCharts').hide();
            else $('#topTableCharts').show();
        }});
        
        // Setup Data from URL
        this.Data.quickSetup($.bbq.getState());
        
        // Init users search
        if (_Settings.userSelection) this.getUsers();
        else $('#dropDownMenu2').parent('li').hide();
        
        // Bind the event onhashchange
        $(window).bind('hashchange', function(){
            thisRef.Data.quickSetup($.bbq.getState());
            
            if (!thisRef.Data.state('noreload')) thisRef.viewUpdater();
            else thisRef.Data.state('noreload', false);
            
            // Running settings post processing (if avaliable)
            try {
                _Settings.hashChangeEvent(thisRef.appDisplayState(thisRef.Data.state('mem')));
            } catch(err) { /* do nothing */ }
        });
        
        this.viewUpdater();
        
        // Running settings post processing (if avaliable)
        this.onLoadRequest();
        
        // Set up refresh
        this.refresh_Change('#refresh');
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Controller initialization - FINISH
// ============================================================================

}

// Inherits from Events()
Controller.prototype = new Events();
