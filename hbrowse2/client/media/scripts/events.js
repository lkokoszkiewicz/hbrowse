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
/*global ControlsUpdate: false*/

/*
   Class: Events
   This class is responsible for handling all page events
*/
function Events() {

// ============================================================================
// General UI events - START
// ============================================================================

// Users list item click -------------------------------------------------------

    /*
        Function: userListItem_Click
        Event handler for users list click event
        
        Parameters:
            el - Clicked element
    */
    this.userListItem_Click = function(el) {
        var settings = this.Settings.Application.modelDefaults();
        
        this.Data.state('user', $(el).text());
        this.Data.state('tid', '');
        this.Data.state('table', settings.initialTable);
        this.Data.state('noreload', false);
        this.setupURL();
    };
    
// ----------------------------------------------------------------------------

// Open menu click ------------------------------------------------------------
    
    /*
        Function: openMenu_Click
        Event handler for users list click event
        
        Parameters:
            el - Clicked element
            noActiveMenuReset - Boolean
    */
    this.openMenu_Click = function(el, noActiveMenuReset) {
        if (noActiveMenuReset === undefined) noActiveMenuReset = false;
        
        var menuID;
        
        // Pick clicked menuID (url variable value, eg. 1 or 2)
        menuID = $(el).attr('id').replace("dropDownMenu", "");
        
        // Close other opened menus
        if (this.Data.state('activemenu') !== 0 && this.Data.state('activemenu') != menuID) {
            $('#dropDownMenu'+this.Data.state('activemenu')).trigger('click', [true]).removeClass('selected');
        }
        
        if (!noActiveMenuReset) {
            this.Data.state('activemenu', menuID);
            this.Data.state('noreload', true);
            this.setupURL();
        }
        
        // Slide down the menu
        $( $(el).attr('href') ).slideDown(100);
        
        // Add a class `selected` to the top menu element
        $(el).addClass('selected');
    };
    
// ----------------------------------------------------------------------------

// Close menu click -----------------------------------------------------------
    
    /*
        Function: closeMenu_Click
        Event handler for users list click event
        
        Parameters:
            el - Clicked element
            noActiveMenuReset - Boolean
    */
    this.closeMenu_Click = function(el, noActiveMenuReset) {
        if (noActiveMenuReset === undefined) noActiveMenuReset = false;
        
        var menuID;
        
        // Pick clicked menuID (url variable value, eg. 1 or 2)
        menuID = $(el).attr('id').replace("dropDownMenu", "");
        
        if (!noActiveMenuReset) {
            this.Data.state('activemenu', 0);
            this.Data.state('noreload', true);
            this.setupURL();
        }
        
        // slide up the menu
        $( $(el).attr('href') ).slideUp(100);
        
        // Remove a class `selected` to the top menu element
        $(el).removeClass('selected');
    };
    
// ---------------------------------------------------------------------------

// Refresh change ------------------------------------------------------------
    
    /*
        Function: refresh_Change
        Event handler for page automatis data refresh change
        
        Parameters:
            el - Clicked element
    */
    this.refresh_Change = function(el) {
        var thisRef = this;
        this.Data.state('refresh', parseInt($(el).val(), 10));
        
        try { clearInterval(this.intervalID); } finally {}
        if (this.Data.state('refresh') > 0) {
            this.intervalID = setInterval( function() { thisRef.viewUpdater(); }, (this.Data.state('refresh')*1000) );
        }
        
        this.Data.state('noreload', false);
        this.setupURL();
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// General UI events - FINISH
// ============================================================================

// ============================================================================
// Expanded row events - START
// ============================================================================

// Expand row click -----------------------------------------------------------
    
    /*
        Function: expand_click
        Executed when small plus icon (at the left of the data table) is clicked
        
        Parameters:
            dataID - Table data Row index
            
        Returns:
            Array of data needed for expanded row content rendering
            (See ducumentation: http://code.google.com/p/hbrowse/wiki/QuickTutorial2#expandData_/object/)
    */
    this.expand_click = function(dataID) {
        var _Settings, rowDataSet, output;
        var thisRef = this;
        
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        rowDataSet = this.Data.state().mem.table.data[dataID];
        
        var processData = function(jsonDataSet) {
            if (jsonDataSet === undefined) jsonDataSet = false;
            
            try {
                output = _Settings.expandData.dataFunction(rowDataSet, jsonDataSet);
            } catch(err) {
                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err);
            }
        };
        
        if (_Settings.expandData.dataURL) {
            if (_Settings.expandData.dataURL_params === undefined) _Settings.expandData.dataURL_params = function() { return {}; };
            this.Data.ajax_getData_sync('expand', _Settings.expandData.dataURL, _Settings.expandData.dataURL_params(this.Data, rowDataSet), processData, function(){});
        } else {
            processData();
        }
        
        if ($.inArray(dataID, this.Data.state('or')) == -1) {
            if (_Settings.multipleER) this.Data.state().or.push(dataID);
            else this.Data.state('or', [dataID]);
            this.Data.state('noreload', true);
            this.setupURL();
        }
        
        return output;
    };
    
// ----------------------------------------------------------------------------

// Expand Row -----------------------------------------------------------------
    
    /*
        Function: expand_click_postprocess
        Postprocess of the expand row clicking (run after rendering)
        Draws charts and adding the drilldown handler to expanded row data table
        
        Parameters:
            expandedID - Expanded row index
            inputObj - input object
                       (See ducumentation: http://code.google.com/p/hbrowse/wiki/QuickTutorial2#expandData_/object/)
            isMain - boolean, is the table main table
    */
    this.expand_click_postprocess = function(expandedID, inputObj, isMain) {
        if (isMain === undefined) isMain = false;
        var thisRef = this;
        
        if (isMain) {
            $('#expandDataTable_'+expandedID+' tbody a.drilldown').closest('td').unbind();
            $('#expandDataTable_'+expandedID+' tbody a.drilldown').closest('td').click(function(){
                var aPos = $(this).closest('tr').prevAll().length;
                thisRef.drillDown_click(this, aPos);
            });
        }
        var _charts = [];
        for (var i=0;i<inputObj.length;i++) {
            if (inputObj[i][0] == 'charts') _charts = inputObj[i][1];
        }
        thisRef.executeCharts(_charts, 'expCht_'+expandedID+'_', '#expand_'+expandedID+' #chartExpandSlot_'+expandedID);
    };
    
// ----------------------------------------------------------------------------

// Expanded row close ---------------------------------------------------------
    
    /*
        Function: erClose_click
        Expanded row close click handler
        
        Parameters:
            dataID - Table data Row index
    */
    this.erClose_click = function(dataID) {
        if (this.Data.state('or').length > 1) {
            var position = $.inArray(dataID, this.Data.state('or'));
            this.Data.state('or').splice(position,1);
        }
        else {
            this.Data.state('or', []);
        }
        this.Data.state('noreload', true);
        this.setupURL();
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Expanded row events - FINISH
// ============================================================================

// ============================================================================
// General data table events - START
// ============================================================================

// Data table content change --------------------------------------------------
    
    /*
        Function: mainsTableContent_change
        Executed when data table content changes due to sorting 
        or client side filtering
        
        Parameters:
            el - clicked element
    */
    this.mainsTableContent_change = function(el) {
        var records, _Settings = this.Settings.Mains; // Shortcut
        var thisRef = this;
        if ($('#dataTable_0_paginate input').val() !== undefined) this.Data.state('p', $('#dataTable_0_paginate input').val());
        if (this.Data.state('noreload') === false) {
            $('.tablePlus').attr('src', 'media/images/table_plus.png');
            this.Data.state('or', []);
        }
        records = parseInt($('#dataTable_0_length select').val(), 10);
        if (!isNaN(records)) this.Data.state('records', records);
        $('#dataTable_0 tbody a.drilldown').closest('td').unbind();
        $('#dataTable_0 tbody a.drilldown').closest('td').click(function(){ 
            var aPos = thisRef.mainsTable[0].fnGetPosition(this);
            thisRef.drillDown_click(this, aPos[0]); 
        });
        
        // Running settings post processing (if avaliable)
        try {
            _Settings.tableActivityEvent(el, thisRef.Data.state('mem'));
        } catch(err) { /* do nothing */ }
        
        this.Data.state('noreload', true);
        this.setupURL();
    };
    
// ----------------------------------------------------------------------------

// Drilldown click ------------------------------------------------------------
    
    /*
        Function: drillDown_click
        Table drilldown handler function, executed when used 
        decides to see another table
        
        Parameters:
            el - clicked element
            rowIndex - Data table row index
    */
    this.drillDown_click = function(el, rowIndex) {
        var i, _Settings, dParams = false;
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        
        // Save breadcrumbs
        this.Data.state().breadcrumbs.push({
            'table':_Settings.tableName,
            'url':$.param.fragment()
        });
        
        // setup model
        if ($.isFunction(_Settings.drillDownHandler)) dParams = _Settings.drillDownHandler(this.Data.state(), el, rowIndex);
        if (dParams) {
            if (dParams.uparam !== undefined) this.Data.state('uparam', dParams.uparam);
            if (dParams.table !== undefined) this.Data.state('table', dParams.table);
            if (dParams.filters !== undefined) {
                for (i in dParams.filters) {
                    if (dParams.filters.hasOwnProperty(i)) {
                        this.Data.state().filters[i] = dParams.filters[i];
                    }
                }
            }
        } else alert('setupUserParams settings function was replaced by drillDownHandler function, see documentation and latest settings.js_example for detailes!');
        this.Data.state('or', []);
        this.Data.state('sorting', []);
        this.Data.state('p', 1);
        this.Data.state('noreload', false);
        this.setupURL();
    };
    
// ----------------------------------------------------------------------------

// Sorting columns click ------------------------------------------------------
    
    /*
        Function: tableSorting_click
        Executed when sortable column header is clicked
        
        Parameters:
            el - Clicked element
            dataTable - Handler to the data table UI object
    */
    this.tableSorting_click = function(el, dataTable) {
        var tSettings = dataTable.fnSettings();
        
        this.Data.state('sorting', [ tSettings.aaSorting[0][0], tSettings.aaSorting[0][1] ]);
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// General data table events - FINISH
// ============================================================================

// ============================================================================
// Filters events - START
// ============================================================================
    
// Filters submit ----------------------------------------------------------------------------

    /*
        Function: filtersSubmit_click
        Filters submit handler
        
        Parameters:
            el - clicked element
    */
    this.filtersSubmit_click = function(el) {
        var i, _Settings;
    
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        
        for (i=0;i<_Settings.filters.length;i++) {
            this.Data.state().filters[_Settings.filters[i].urlVariable] = ($('.filterItems #'+_Settings.filters[i].urlVariable).val() || '');
            this.filtersSubmit_OnOff(i);
        }
        this.Data.state('or', []);
        this.Data.state('sorting', []);
        this.Data.state('p', 1);
        this.setupURL();
        
        this.filter_change();
    };
    
// ----------------------------------------------------------------------------

// Filters On/Off function handling -------------------------------------------
    
    /*
        Function: filtersSubmit_OnOff
        This function runs a post processing function of filters submit click
        See the cahrts section of framework documentation
        
        Parameters:
            i - Filter index
    */
    this.filtersSubmit_OnOff = function(i) {
        var _Settings;
        
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        
        if (_Settings.filters[i].options.On !== undefined && this.Data.state().filters[_Settings.filters[i].urlVariable] !== '') {
            _Settings.filters[i].options.On(this.Data);
        } else if (_Settings.filters[i].options.Off !== undefined && this.Data.state().filters[_Settings.filters[i].urlVariable] === '') {
            _Settings.filters[i].options.Off(this.Data);
        }
    };
    
// ----------------------------------------------------------------------------

// Multiselect filters change -------------------------------------------------
    
    /*
        Function: multiselect_change
        Executed when used changes multiselect filters. It is run only
        when chart.options.disableFilterOptionsList function is defined
        inside settings filter definitions
        
        Parameters:
            event - the original event object
            ui - ui.inputs: an array of the checkboxes (DOM elements)
                 inside the optgroup
                 ui.label: the text of the optgroup
                 ui.checked: whether or not the checkboxes were
                 checked or unchecked in the toggle (boolean)
            el - clicked or cahnges element
    */
    this.multiselect_change = function(event, ui, el) {
        var i, j, filter, filterID, optClass, disableFilters, checked, checkedArr = [], filtersToChange = {}, _Settings, _Filter;
        
        // Selecting a proper settings set
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        
        // Selecting a proper filter from the settings set
        j = 0;
        for (i=0;i<_Settings.filters.length;i++) {
            if (_Settings.filters[i].urlVariable == $(el).attr('id')) {
                _Filter = _Settings.filters[i];
                j = 1;
                break;
            }
        }
        if (j == 0) return false; // If filter not found, stop the method
        
        // Take a proper constraints from the settings (see documentation)
        disableFilters = _Filter.options.disableFilterOptionsList(this.Data.state());
        // Check which options are actually selected
        checked = $('#'+_Filter.urlVariable).multiselect('getChecked');
        
        // Build an array with selected options
        // (used later to determine which constraints arrays should be taken from the settings)
        for (i=0;i<checked.length;i++) {
            checkedArr.push($(checked[i]).attr('value'));
        }
        
        // Go thru the settings constraints and pick the proper ones
        // Function builds the filtersToChange object:
        // filtersToChange = {'filter1_urlVariable':[<element1>,<element2>,...],...}
        // this object is a list of filters fields that are allowed for a current filter selection
        for (i=0;i<disableFilters.length;i++) {
            for (j=0;j<disableFilters[i][1].length;j++) {
                filter = disableFilters[i][1][j];
                if (filtersToChange[filter[0]] === undefined) filtersToChange[filter[0]] = [];
                if ($.inArray(disableFilters[i][0],checkedArr) != -1) {
                    $.merge(filtersToChange[filter[0]],filter[1]);
                }
            }
        }
        
        // Now that we have all the data we can proceed with filters constraining
        // we will go thru each filtersToChange object elements disabling filters options
        for (filterID in filtersToChange) {
            // first, remove duplicated entries for each filter const. array
            filtersToChange[filterID] = hbrowseAPI.uniqueArr(filtersToChange[filterID]);
            // Itarate through filter options and disable a proper ones
            $('#'+filterID+' option').each(function(i){
                // if option value exists inside const. array and there are any checked items, disable the option 
                if ($.inArray($(this).val(), filtersToChange[filterID]) == -1 && checkedArr.length !== 0) {
                    // disable the option and add the class named the same as the current filter
                    $(this).addClass($(el).attr('id')).attr('disabled','disabled');
                } else {
                    // enable an option only if it wasn't disabled by a different filter
                    // the indication of this is class name. enable it only if option does not have
                    // other classes rather than equal to current filter id
                    optClass = $(this).attr('class'); // get the class string from the option
                    // if class exists, split it to array
                    if (optClass !== undefined || optClass == '') optClass = optClass.split(' ');
                    else optClass = [$(el).attr('id')]; // if class is empty, add a default value (which is current filter id)
                    
                    // so, if the only class element is the current filter id
                    if ($(this).hasClass($(el).attr('id')) && optClass.length == 1)
                        // enable the filter option and remove the current filter id class
                        $(this).removeClass($(el).attr('id')).removeAttr('disabled');
                    else 
                        // else, only remove current filter id class
                        $(this).removeClass($(el).attr('id'));
                }
            });
            // refresh the multiselect control
            $('#'+filterID).multiselect('refresh');
        }
        // setup multiselect width
        $('button.ui-multiselect').css('width','130px');
    };
    
// ----------------------------------------------------------------------------

// Filters change event -------------------------------------------------------
    
    /*
        Function: filter_change
        Executed when filters submit button is clicked and every time filters need refreshing.
        Mainly selects a proper options of the filters of type 'select'
    */
    this.filter_change = function() {
        var i, j, div, _Settings, selectElements, elIndex, fElementsArr = [];
        var thisRef = this;
        
        // Prepare html for the filters summary
        div = $('<div></div>').append($('<h3></h3>').html('Filters Summary').css('margin','0px 0px 3px 0px'));
        
        // Load proper Settings
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        
        // loop through the filters array
        for (i=0; i<_Settings.filters.length;i++) {
            if (this.Data.state().filters[_Settings.filters[i].urlVariable] !== '') {
                if (_Settings.filters[i].fieldType == 'select') {
                    try {
                        if (_Settings.filters[i].urlVariable === undefined) selectElements = _Settings.filters[i].options.translateData();
                        else selectElements = _Settings.filters[i].options.translateData(this.Data.state().mem.filters[_Settings.filters[i].urlVariable]);
                        for (j=0;j<selectElements.length;j++) {
                            if (selectElements[j][0] == this.Data.state().filters[_Settings.filters[i].urlVariable]) {
                                div.append('<span style="font-weight:bold">'+_Settings.filters[i].label+'</span>: '+selectElements[j][1]+'<br />');
                            }
                        }
                    } catch(err1) { /*do nothing*/ }
                } else if (_Settings.filters[i].fieldType == 'multiselect') {
                    try {
                        if (_Settings.filters[i].urlVariable === undefined) selectElements = _Settings.filters[i].options.translateData();
                        else selectElements = _Settings.filters[i].options.translateData(this.Data.state().mem.filters[_Settings.filters[i].urlVariable]);
                        
                        fElementsArr = [];
                        for (j=0;j<selectElements.length;j++) {
                            elIndex = $.inArray(selectElements[j][0], this.Data.state().filters[_Settings.filters[i].urlVariable]);
                            if (elIndex != -1) {
                                fElementsArr.push(selectElements[j][1]);
                            }
                        }
                        div.append('<span style="font-weight:bold">'+_Settings.filters[i].label+'</span>: '+fElementsArr.join(', ')+'<br />');
                    } catch(err2) { /*do nothing*/ }
                } else {
                    div.append('<span style="font-weight:bold">'+_Settings.filters[i].label+'</span>: '+this.Data.state().filters[_Settings.filters[i].urlVariable]+'<br />');
                }
            }
        }
        
        $('#dataFiltersLabel').lkfw_tooltip({
            'content':{
                'dataFiltersLabel':{
                    'html':div
                }
            },
            'take':'id',
            'place':'bottom',
            'classDist':'_filtersSummary',
            'delay':1000,
            'clickable':true,
            'posShift':[-5,-1],
            'css':{
                'width':'100%'
            }
        });
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Filters events - FINISH
// ============================================================================

// ============================================================================
// Charts events - START
// ============================================================================
    
    this.drawChtRequestButton_click = function(el, _charts, domIdPrefix, cnt) {
        $(el).attr({'value':'Loading...','disabled':'disabled'});
        this.drawChart(_charts, domIdPrefix, cnt, true);
    };
    
// ============================================================================
// Filters events - FINISH
// ============================================================================

}

// Inherits from ControlsUpdate()
Events.prototype = new ControlsUpdate();
