// This file is part of the hBrowse software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
// 31.03.2011 Major v1.2.0 release (many changes to settings and core of the application)
// 15.09.2011 Code comments was formated to use NaturalDocs
// 19.09.2011 version 2.0.0 release
//

/*
   Class: ControlsUpdate
   This class is responsible for any UI manipulation
*/
function ControlsUpdate() {

// ============================================================================
// General UI manipulation - FINISH
// ============================================================================

// Error dialog setup ---------------------------------------------------------
    
    /*
        Function: setupErrorDialog
        Builds an error message content to display when exception occurs
        
        Parameters:
            err - Exception error object
    */
    this.setupErrorDialog = function(err) {
        var ul = $('<ul></ul>');
        var st = err.stack.split("\n");
        for (var i=0;i<st.length;i++) {
            if (st[i] !== '') ul.append($('<li></li>').html(st[i]));
        }
        $('#dialog-content').html(ul);
        $('#dialog-message').dialog({ 
            title: err.name+': '+err.message,
            modal: true,
            width: 700,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			} 
	    });
        $('#dialog-message').dialog('open');
    };

// ----------------------------------------------------------------------------

// Update page refresh select field -------------------------------------------
    
    /*
        Function: pageRefresh_update
        Updates page refresh dropdown list with a proper option selection
    */
    this.pageRefresh_update = function() {
        var thisRef = this;
        $('#refresh option').each( function(i){
            $(this).removeAttr('selected');
            if ($(this).val() == thisRef.Data.state('refresh')) $(this).attr('selected','selected');
        });
    };
    
// ----------------------------------------------------------------------------

// Breadcrumbs update ---------------------------------------------------------
    
    /*
        Function: breadcrumbs_update
        Builds a proper breadcrumbs html output and publishes it to the site
    */
    this.breadcrumbs_update = function() {
        var i, _Settings, sDefaults, iniTableSettings, filtersUrl = [], output, bcLength, url;
        var thisRef = this;
        
        var addBC = function(url, table) {
            return '<a href="#'+url+'">'+table+'</a> &raquo; ';
        };
        
        _Settings = this.Settings.Application; // Shortcut
        sDefaults = _Settings.modelDefaults();
        
        // id=breadcrumbs
        if (this.Data.state('user') || !_Settings.userSelection) {
            output = '&nbsp;';
            // show table
            if (_Settings.userSelection) output += '[ <span class="highlight">' + this.Data.state('user') + '</span> ] &raquo; ';
            
            bcLength = this.Data.state('breadcrumbs').length;
            
            for (i=0;i<bcLength;i++) {
                if (this.Data.state().breadcrumbs[i].table != this.Settings[this.Data.state('table')].tableName) {
                    output += addBC(this.Data.state().breadcrumbs[i].url, this.Data.state().breadcrumbs[i].table);
                } else {
                    this.Data.state().breadcrumbs.splice(i,(bcLength-i));
                    break;
                }
            }
            
            if (bcLength == 0 && sDefaults.initialTable != this.Data.state('table') && sDefaults.initialTable != '') {
                url = 'user='+this.Data.state('user')+'&refresh='+this.Data.state('refresh')+'&table='+sDefaults.initialTable
                    +'&p=1&records='+this.Data.state('records')+'&activemenu=0';
                
                // Check if initial table have any filters defined
                // Load initial table setting
                iniTableSettings = this.Settings[sDefaults.initialTable];
                
                // check for filters, if exists, add proper values to url
                if (iniTableSettings.filters !== undefined) {
                    for (i=0;i<iniTableSettings.filters.length;i++) {
                        filtersUrl.push(iniTableSettings.filters[i].urlVariable+'='+iniTableSettings.filters[i].value);
                    }
                    // add filters to hash string
                    url += '&'+filtersUrl.join('&');
                }
                
                output += addBC(url, this.Settings[sDefaults.initialTable].tableName);
                // user=testuser5&refresh=0&table=Mains&p=1&records=25&activemenu=0
            }
            
            output += this.Settings[this.Data.state('table')].tableName;
        }
        else {
            // show users
            output = '';
        }
        
        $('#breadcrumbs').html(output);
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// General UI manipulation - FINISH
// ============================================================================
    
// ============================================================================
// Charts drawing and updates - START
// ============================================================================

// Prepare grouping DIVs ------------------------------------------------------

    /*
        Function: charts_prepGroups
        Draws a proper dom object structure to create charts grouping with
        jQuery UI accordion widget
        
        Parameters:
            tableTarget - Drawing target area ID (eg: #chartContent)
            domIdPrefix - Individual chart span id prefix (eg: cht_)
            groupTableIndexes - Array, holds information on how many charts
                                will reside in the group
            chartGroups - Chart groups array taken from settings
                          'chartGroups' option
        
        See Also:
            <charts_prepTable>
    */
    this.charts_prepGroups = function(tableTarget, domIdPrefix, groupTableIndexes, chartGroups) {
        var accordionID;
        
        accordionID = tableTarget.replace('#','')+'_group';
        $(tableTarget).append($('<div></div>').attr('id',accordionID).addClass('chartGroup').css('margin-top','15px'));
        
        // Draw groups divs
        for (i=0;i<chartGroups.length;i++) {
            $('#'+accordionID).append($('<h3></h3>').html(chartGroups[i]));
            $('#'+accordionID).append($('<div></div>').attr('id','chartGroupContent_'+i));
            this.charts_prepTable(groupTableIndexes[i], '#chartGroupContent_'+i, domIdPrefix+i+'_');
        }
        $('#'+accordionID).accordion({
			autoHeight: false,
			navigation: true
		});
    };
    
// ----------------------------------------------------------------------------

// Prepares charts holding table ----------------------------------------------
    
    /*
        Function: charts_prepTable
        Function that prepares 2 column charts table
        
        Parameters:
            chtCnt - Indication of how many charts are to display
            tableTarget - Drawing target area ID (eg: #chartContent)
            domIdPrefix - Individual chart span id prefix (eg: cht_)
        
        See Also:
            <charts_prepGroups>
    */
    this.charts_prepTable = function(chtCnt, tableTarget, domIdPrefix) {
        var _Settings, colCount = 2;
        
        // setting up a proper table settings
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        
        if (_Settings.chartTblColCount !== undefined) colCount = _Settings.chartTblColCount;
        
        if (chtCnt > 0) {
            var rowCnt = Math.ceil((chtCnt/colCount));
            var table = $('<table></table>').attr({
                'class':'chartTbl',
                'cellpadding':'0',
                'cellspacing':'0'
            }).css('width','100%');
            
            var cnt = 0;
            for (var i=0;i<rowCnt;i++) {
                var tr = $('<tr></tr>');
                for (var j=0;j<colCount;j++) {
                    tr.append( $('<td></td>').addClass('chartTd').append( $('<span></span>')
                        .attr('id',domIdPrefix+cnt).css({'display':'inline-block'}) ) );cnt++;
                }
                //tr.append( $('<td></td>').addClass('chartTd').append( $('<span></span>')
                //    .attr('id',domIdPrefix+cnt).css({'display':'inline-block'}) ) );cnt++;
                table.append(tr);
            }
            $(tableTarget).append(table);
        }
    };
    
// ----------------------------------------------------------------------------

// Draw google charts ---------------------------------------------------------
    
    /*
        Function: googleCharts_load
        Function drawing google charts
        
        Parameters:
            query - Url query string formated for google charts
                    (see: http://code.google.com/apis/chart/)
            domId - DOM target element ( where to draw )
        
        See Also:
            <tableCharts_load>
    */
    this.googleCharts_load = function(query, domId) {
        $('#'+domId).empty();
        $('#'+domId).append(
            $('<img></img>').attr({
                'src':'http://chart.apis.google.com/chart?'+query,
                'class':'chartImg'
            })
        );
    };

// ----------------------------------------------------------------------------

// Draw table chart -----------------------------------------------------------
    
    /*
        Function: tableCharts_load
        Function used to draw a table in place of a chart
        
        Parameters:
            tData - Properly formated object with the table data
            domId - DOM target element ( where to draw )
        
        See Also:
            <googleCharts_load>
    */
    this.tableCharts_load = function(tData, domId) {
        var i, j, table, tHead, tHeadTr, tHeadTd, tBody, tBodyTr, tBodyTd;
    
        $('#'+domId).empty();
        table = $('<table></table>').attr({
            'cellpadding':'0px',
            'cellspacing':'1px'
        }).addClass('chartTable').css('border','1px #aaaaaa solid');
        if (tData.width !== undefined) table.css('width',tData.width);
        
        tHead = $('<thead></thead>');
        tHeadTr = $('<tr></tr>').addClass('chartTableHeadTr');
        for (i=0;i<tData.tblLabels.length;i++) {
            tHeadTd = $('<td></td>').addClass('chartTableHeadTd').text(tData.tblLabels[i]);
            tHeadTr.append(tHeadTd);
        }
        tHead.append(tHeadTr);
        
        tBody = $('<tbody></tbody>');
        for (i=0;i<tData.tblData.length;i++) {
            tBodyTr = $('<tr></tr>');
            for (j=0;j<tData.tblData[i].length;j++) {
                tBodyTd = $('<td></td>').html(tData.tblData[i][j].html);
                if (tData.tblData[i][j].bgcolor !== undefined) {
                    tBodyTd.css('background-color',tData.tblData[i][j].bgcolor);
                }
                tBodyTr.append(tBodyTd);
            }
            tBody.append(tBodyTr);
        }
        table.append(tHead).append(tBody);
        $('#'+domId).append(table);
    };
    
// ----------------------------------------------------------------------------

// Draw chart message frame ---------------------------------------------------
    
    /*
        Function: drawChtMessageFrame
        Draw chart message frame when we have 'onDemand chart' or there is no
        data to display a chart
    */
    this.drawChtMessageFrame = function() {
        var frame = $('<div></div>').addClass('chartMessageFrame');
        return frame;
    };
    
// ----------------------------------------------------------------------------

// Draw chart request button --------------------------------------------------
    
    /*
        Function: drawChtRequestButton
        Draw chart request button, used when chart has the 'onDemand' option
        activated
        
        Parameters:
            _charts - Settings charts array shortcut
            domIdPrefix - Individual chart span id prefix (eg: cht_)
            destIndex - String or array (in case of chart grouping) defining
                        (in connection with domIdPrefix) where chart should
                        be drawn
    */
    this.drawChtRequestButton = function(_charts, domIdPrefix, destIndex) {
        var thisRef = this;
        
        if ($.isArray(destIndex)) {
            cnt = destIndex[0];
            domId = domIdPrefix+destIndex[1]+'_'+destIndex[2];
        } else {
            cnt = destIndex;
            domId = domIdPrefix+destIndex;
        }
        
        var chtMessageFrame = this.drawChtMessageFrame();
        $('#'+domId).empty();
        chtMessageFrame.append('<span class="chartTitle">'+_charts[cnt].name+'</span><br />');
        chtMessageFrame.append($('<input />').attr({
            'id':'butt_'+domId,
            'type':'button',
            'value':'Load Chart'
        }).click(function(){ thisRef.drawChtRequestButton_click(this, _charts, domIdPrefix, destIndex); }));
        $('#'+domId).append(chtMessageFrame);
    };
    
// ----------------------------------------------------------------------------

// Draw no data chart message -------------------------------------------------    
    
    /*
        Function: drawNoDataMessage
        Draws no data chart message when there is no data to display the chart
        
        Parameters:
            _charts - Settings charts array shortcut
            domIdPrefix - Individual chart span id prefix (eg: cht_)
            cnt - Chart index
    */
    this.drawNoDataMessage = function(_charts, domIdPrefix, cnt) {
        var chtMessageFrame = this.drawChtMessageFrame();
        
        chtMessageFrame.append('<span class="chartTitle">'+_charts[cnt].name+'</span><br />There is no data<br />to draw a chart');
        $('#'+domIdPrefix+cnt).empty();
        $('#'+domIdPrefix+cnt).append(chtMessageFrame);
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Charts drawing and updates - FINISH
// ============================================================================

// ============================================================================
// Filters drawing and updates - START
// ============================================================================

// Hide/Show filters ----------------------------------------------------------
    
    /*
        Function: hideShowFilters
        Shows or hides filters and filters toggle button
        
        Parameters:
            action - string (show|hide)
    */
    this.hideShowFilters = function(action) {
        if (action == 'show') {
            if ($( $('#dropDownMenu1').attr('href') ).css('display') != 'block' && this.Data.state('activemenu') == 1) {
                $('#dropDownMenu1').trigger('click',[true]);
            }
            $('#dropDownMenu1,#dataFiltersLabel').parent('li').show();
        } else if (action == 'hide') {
            if ($( $('#dropDownMenu1').attr('href') ).css('display') == 'block' && this.Data.state('activemenu') == 1) {
                $('#dropDownMenu1').trigger('click',[true]);
            }
            $('#dropDownMenu1,#dataFiltersLabel').parent('li').hide();
        }
    };

// ----------------------------------------------------------------------------

// Draw filters ---------------------------------------------------------------
    
    /*
        Function: drawFilters
        Draws filters based of settings information
    */
    this.drawFilters = function() {
        var i, j, _Settings, optArr, mainSpan, filter, option, groupIndex, 
            show = false; constFiltersList = [], mulitselectconf = {};
        var thisRef = this;
        
        // setting up a proper table settings
        _Settings = this.Settings[this.Data.state('table')]; // Shortcut
        // if settings for a given table are undefined create an empty settings
        // object to prevent en error in the next command
        if (_Settings === undefined) _Settings = {};
        
        // if filters for a given table exists, draw controlls
        if (_Settings.filters !== undefined && this.Filter != this.Data.state('table')) {
            this.Filter = this.Data.state('table');
            // defining empty functions to use as defaults for ajax functions
            var emptyFunc = function() {/*do nothing*/};
            var returnEmptyObjFunc = function() { return {}; };
            
            // draw Array options
            var drawFilterOptions = function(optArr, filter) {
                if (optArr.length > 0) for (j=0;j<optArr.length;j++) {
                    // create option html element
                    var option = $('<option></option>').attr('value',optArr[j][0]).text(optArr[j][1]);
                    
                    // check which fields should be selected
                    if (_Settings.filters[i].fieldType == 'multiselect') {
                        if (optArr[j][0] == thisRef.Data.state().filters[_Settings.filters[i].urlVariable] 
                            || $.inArray(optArr[j][0], 
                                thisRef.Data.state().filters[_Settings.filters[i].urlVariable]) != -1) {
                            
                            option.attr('selected','selected');
                        }
                    } else {
                        if (optArr[j][0] == thisRef.Data.state().filters[_Settings.filters[i].urlVariable]) {
                            option.attr('selected','selected');
                        }
                    }
                    filter.append(option);
                }
            };
            
            // setup incoming ajax data
            var handleAjaxData = function(data, i){
                try {
                    thisRef.Data.state().mem.filters[_Settings.filters[i].urlVariable] = data;
                    optArr = _Settings.filters[i].options.translateData(data);
                    drawFilterOptions(optArr, $('#'+_Settings.filters[i].urlVariable));
                    $('#'+_Settings.filters[i].urlVariable).multiselect('refresh');
                    $('button.ui-multiselect').css('width','130px');
                } catch(err1) {
                    if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err1);
                }
            }; 
            
            // Clear space for filters
            $('#dataFiltersInputs').empty();
            
            // Draw groups divs
            if (_Settings.filterGroups !== undefined) {
                var groups = [];
                for (i=0;i<_Settings.filterGroups.length;i++) {
                    groups.push($('<div></div>').addClass('filterGroup'));
                    groups[i].append($('<div></div>').addClass('filterGroupLabel').html(_Settings.filterGroups[i]));
                }
            }
            
            // table filters loop
            for (i=0;i<_Settings.filters.length;i++) {
                // define options array: [['optionValue1','optionLabel1'],['optionValue2','optionLabel2']]
                optArr = [];
                
                // Decide whether to show filters button or not
                // hide filters button if all avaliable filters are of type hidden
                if (_Settings.filters[i].fieldType != 'hidden') show = true;
                
                // create span to draw a filter html control
                mainSpan = $('<span></span>').attr('id','filter_'+_Settings.filters[i].urlVariable)
                    .addClass('filterItems').html('<span class="filterLabel">'+_Settings.filters[i].label+'</span><br />');
                
                // draw text, date or datetime filter, if hidden, input field will not display
                if (_Settings.filters[i].fieldType == 'text' || _Settings.filters[i].fieldType == 'hidden' 
                    || _Settings.filters[i].fieldType == 'date' || _Settings.filters[i].fieldType == 'datetime') {
                    
                    filter = $('<input></input>').attr({
                        'type':'text',
                        'id':_Settings.filters[i].urlVariable,
                        'value':this.Data.state().filters[_Settings.filters[i].urlVariable]
                    });
                    
                    if (_Settings.filters[i].fieldType == 'hidden') {
                        mainSpan.css('display','none');
                    }
                    
                    // add control to above `span`
                    mainSpan.append(filter);
                }
                // draw select or multiselect filter
                // select and multiselect filters may get options elements from ajac requests
                else if (_Settings.filters[i].fieldType == 'select' || _Settings.filters[i].fieldType == 'multiselect') {
                    // create select control
                    filter = $('<select></select>').attr('id',_Settings.filters[i].urlVariable);
                    
                    // if filter is of type multiselect add multiple attribute to the select field
                    // multiple selection fields are using miltiselect jquery plugin so they appear
                    // as a drop down box
                    if (_Settings.filters[i].fieldType == 'multiselect') filter.attr('multiple','multiple');
                    
                    // if options.dataURL exists, options will be obtained from ajax request
                    if (_Settings.filters[i].options.dataURL !== undefined) {
                        // check if, by any chance, options wasn't downloaded earlier
                        // to do this we check if a proper ajax response was reqistered inside Data.mem object
                        // if not, script will download a proper data
                        if (this.Data.state().mem.filters[_Settings.filters[i].urlVariable] === undefined) {
                            // check if options.dataURL_params is defined
                            // if no, use previously defined function returning empty object
                            if (_Settings.filters[i].options.dataURL_params === undefined) 
                                _Settings.filters[i].options.dataURL_params = returnEmptyObjFunc;
                            
                            // query for the options, previously defnied handleAjaxData
                            // function will be used to store and preper the data 
                            this.Data.ajax_getData_alt('filter', _Settings.filters[i].options.dataURL, 
                                _Settings.filters[i].options.dataURL_params(this.Data.state()), 
                                handleAjaxData, emptyFunc, i);
                        }
                        // if data already resides in memory, simply use them to redraw the filter control
                        else {
                            try {
                                optArr = _Settings.filters[i].options
                                    .translateData(this.Data.state().mem.filters[_Settings.filters[i].urlVariable]);
                            } catch(err2) {
                                if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err2);
                            }
                        }
                    }
                    // if options.dataURL property is not defined it means that select options
                    // should be defined directly inside options.translateData function
                    // in this case `Data` object will be used as a parameter for this function
                    // so a developer would be able to use any data alredy stored there
                    else {
                        try {
                            optArr = _Settings.filters[i].options.translateData(this.Data.state());
                        } catch(err3) {
                            if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err3);
                        }
                    }
                    
                    drawFilterOptions(optArr, filter);
                    
                    mainSpan.append(filter);
                }
                
                // run a proper on/off filters functions
                this.filtersSubmit_OnOff(i);
                
                // if you have groups defined add the items to the group divs first
                if (_Settings.filterGroups !== undefined) {
                    // if group index is undefined, put the filter into 
                    if (_Settings.filters[i].groupIndex !== undefined) groupIndex = _Settings.filters[i].groupIndex;
                    else groupIndex = 0;
                    groups[groupIndex].append(mainSpan);
                } else {
                    $('#dataFiltersInputs').append(mainSpan);
                }
            }
            
            if (_Settings.filterGroups !== undefined) {
                for (i=0;i<groups.length;i++) {
                    $('#dataFiltersInputs').append(groups[i]);
                }
            }
            
            // Turn on date pickers and create events
            for (i=0;i<_Settings.filters.length;i++) {
                if (_Settings.filters[i].fieldType == 'date') {
                    $('#'+_Settings.filters[i].urlVariable).datepicker({
                        dateFormat: 'yy-mm-dd',
			            changeMonth: true,
			            changeYear: true
		            });
                }
                else if (_Settings.filters[i].fieldType == 'datetime') {
                    $('#'+_Settings.filters[i].urlVariable).datetimepicker({
                        dateFormat: 'yy-mm-dd',
			            changeMonth: true,
			            changeYear: true
		            });
                }
                else if (_Settings.filters[i].fieldType == 'multiselect' || _Settings.filters[i].fieldType == 'select') {
                    mulitselectconf = {
                        selectedText: "# of # selected",
                        classes:'hb-multiselect'
                    };
                    
                    // if field type is `select`, disable multiselect option
                    if (_Settings.filters[i].fieldType == 'select') {
                        $.extend(mulitselectconf, {
                            selectedList: 1,
                            multiple: false
                        });
                    }
                    
                    // if constrains function is defined, attach events
                    if (_Settings.filters[i].options.disableFilterOptionsList !== undefined) {
                        $.extend(mulitselectconf, {
                            click: function(event, ui) { thisRef.multiselect_change(event, ui, this) },
                            checkAll: function(event, ui) { thisRef.multiselect_change(event, ui, this) },
                            uncheckAll: function(event, ui) { thisRef.multiselect_change(event, ui, this) }
                        });
                    
                        constFiltersList.push('#'+_Settings.filters[i].urlVariable);
                    }
                    
                    $('#'+_Settings.filters[i].urlVariable).multiselect(mulitselectconf);
                    $('button.ui-multiselect').css('width','130px');
                }
            }
                
            // run options disabling based on filters constraints
            for (i=0;i<constFiltersList.length;i++) {
                if ($(constFiltersList[i]).multiselect('getChecked').length > 0) {
                    this.multiselect_change({}, {}, constFiltersList[i]);
                }
            }
            
            if (show) this.hideShowFilters('show');
            else this.hideShowFilters('hide');
            
            this.filter_change();
        }
    };
    
// ----------------------------------------------------------------------------

// Update filters state -------------------------------------------------------
    
    /*
        Function: filtersUpdate
        Updates filters controls based on current model state
    */
    this.filtersUpdate = function() {
        var i, _Settings, show = false;
        var thisRef = this;
        
        var addSelectOption = function(j) {
            $(this).removeAttr('selected');
            if ($(this).val() == thisRef.Data.state().filters[_Settings.filters[i].urlVariable]) $(this).attr('selected','selected');
        };
        
        var addMultiSelectOption = function(j) {
            try {
                $(this).removeAttr('selected');
                if ($(this).val() == thisRef.Data.state().filters[_Settings.filters[i].urlVariable] 
                    || $.inArray($(this).val(), thisRef.Data.state().filters[_Settings.filters[i].urlVariable]) != -1) {
                    
                    $(this).attr('selected','selected');
                }
            } catch(err) {/*do nothing*/}
        };
        
        if (this.appDisplayState() != 'users') {
            _Settings = this.Settings[this.Data.state('table')]; // Shortcut
            
            if (_Settings.filters !== undefined) {
                for (i=0;i<_Settings.filters.length;i++) {
                    // Decide whether to show filters button or not
                    // hide filters button if all avaliable filters are of type hidden
                    if (_Settings.filters[i].fieldType != 'hidden') show = true;
                
                    if (_Settings.filters[i].fieldType == 'text' || _Settings.filters[i].fieldType == 'date') {
                        $('.filterItems #'+_Settings.filters[i].urlVariable)
                            .attr('value', this.Data.state().filters[_Settings.filters[i].urlVariable]);
                    } 
                    else if (_Settings.filters[i].fieldType == 'select') {
                        $('.filterItems #'+_Settings.filters[i].urlVariable+' option').each( addSelectOption );
                        $('#'+_Settings.filters[i].urlVariable).multiselect('refresh');
                        $('button.ui-multiselect').css('width','130px');
                    } else if (_Settings.filters[i].fieldType == 'multiselect') {
                        $('.filterItems #'+_Settings.filters[i].urlVariable+' option').each( addMultiSelectOption );
                        $('#'+_Settings.filters[i].urlVariable).multiselect('refresh');
                        $('button.ui-multiselect').css('width','130px');
                    }
                    
                    this.filtersSubmit_OnOff(i);
                }
                
                this.setupURL();
                this.filter_change();
            }
            
            if (show) this.hideShowFilters('show');
            else this.hideShowFilters('hide');
        }
    };
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Filters drawing and updates - FINISH
// ============================================================================

}
