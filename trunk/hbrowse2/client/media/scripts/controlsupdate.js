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

function ControlsUpdate() {
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

    this.userDropdown_update = function() {
        var thisRef = this;
        $('#userSelect_dropdown option').each( function(i){
            $(this).removeAttr('selected');
            if ($(this).val() == thisRef.Data.user) $(this).attr('selected','selected');
        });
    };
    
    // Generate users options
    this.generateUserDropdownOptions = function() {
        var i, newOption;
        var thisRef = this;
        
        newOption = $('<option></option>').attr('value','').html('');
        $('#userSelect_dropdown').empty();
        $('#userSelect_dropdown').append(newOption);
        for (i=0;i<thisRef.Data.mem.users.length;i++) {
            newOption = $('<option></option>').attr('value',this.Data.mem.users[i]).html(this.Data.mem.users[i]);
            $('#userSelect_dropdown').append(newOption);
        }
        
        $('#userSelect_dropdown').unbind('change').change( function() { thisRef.userDropDown_Change(this); });
        this.userDropdown_update();
    };
    
    this.userRefresh_update = function() {
        var thisRef = this;
        $('#refresh option').each( function(i){
            $(this).removeAttr('selected');
            if ($(this).val() == thisRef.Data.refresh) $(this).attr('selected','selected');
        });
    };
    
    this.breadcrumbs_update = function() {
        var i, _Settings, sDefaults, iniTableSettings, filtersUrl = [], output, bcLength, url;
        var thisRef = this;
        
        var addBC = function(url, table) {
            return '<a href="#'+url+'">'+table+'</a> &raquo; ';
        };
        
        _Settings = this.Settings.Application; // Shortcut
        sDefaults = _Settings.modelDefaults();
        
        // id=breadcrumbs
        if (this.Data.user || !_Settings.userSelection) {
            output = '&nbsp;';
            // show table
            if (_Settings.userSelection) output += '[ <span class="bold">' + this.Data.user + '</span> ] &raquo; ';
            
            bcLength = this.Data.breadcrumbs.length;
            
            for (i=0;i<bcLength;i++) {
                if (this.Data.breadcrumbs[i].table != this.Settings[this.Data.table].tableName) {
                    output += addBC(this.Data.breadcrumbs[i].url, this.Data.breadcrumbs[i].table);
                } else {
                    this.Data.breadcrumbs.splice(i,(bcLength-i));
                    break;
                }
            }
            
            if (bcLength == 0 && sDefaults.initialTable != this.Data.table && sDefaults.initialTable != '') {
                url = 'user='+this.Data.user+'&refresh='+this.Data.refresh+'&table='+sDefaults.initialTable+'&p=1&records='+this.Data.records+'&activemenu=0';
                
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
            
            output += this.Settings[this.Data.table].tableName;
        }
        else {
            // show users
            output = '';
        }
        
        $('#breadcrumbs').html(output);
    };
    
    this.charts_prepTable = function(chtCnt, tableTarget, domIdPrefix) {
        if (chtCnt > 0) {
            var rowCnt = Math.ceil((chtCnt/2));
            var table = $('<table></table>').attr({
                'class':'chartTbl',
                'cellpadding':'0',
                'cellspacing':'0'
            }).css('width','100%');
            
            var cnt = 0;
            for (var i=0;i<rowCnt;i++) {
                var tr = $('<tr></tr>');
                tr.append( $('<td></td>').addClass('chartTd').append( $('<span></span>').attr('id',domIdPrefix+cnt).css({'display':'inline-block'}) ) );cnt++;
                tr.append( $('<td></td>').addClass('chartTd').append( $('<span></span>').attr('id',domIdPrefix+cnt).css({'display':'inline-block'}) ) );cnt++;
                table.append(tr);
            }
            
            $(tableTarget).append(table);
        }
    };
    
    this.charts_load = function(query, domIdPrefix, cnt) {
        $('#'+domIdPrefix+cnt).empty();
        $('#'+domIdPrefix+cnt).append(
            $('<img></img>').attr({
                'src':'http://chart.apis.google.com/chart?'+query,
                'class':'chartImg'
            })
        );
    };
    
    this.chartsTable_load = function(tData, domIdPrefix, cnt) {
        var i, j, table, tHead, tHeadTr, tHeadTd, tBody, tBodyTr, tBodyTd;
    
        $('#'+domIdPrefix+cnt).empty();
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
        $('#'+domIdPrefix+cnt).append(table);
    };
    
    this.drawChtMessageFrame = function(content) {
        var frame = $('<div></div>').addClass('chartMessageFrame');
        return frame;
    };
    
    this.drawChtRequestButton = function(_charts, domIdPrefix, cnt) {
        var thisRef = this;
        
        var chtMessageFrame = this.drawChtMessageFrame();
        $('#'+domIdPrefix+cnt).empty();
        chtMessageFrame.append('<span class="chartTitle">'+_charts[cnt].name+'</span><br />');
        chtMessageFrame.append($('<input />').attr({
            'id':'butt_'+domIdPrefix+cnt,
            'type':'button',
            'value':'Load Chart'
        }).click(function(){ thisRef.drawChtRequestButton_click(this, _charts, domIdPrefix, cnt); }));
        $('#'+domIdPrefix+cnt).append(chtMessageFrame);
    };
    
    this.drawNoDataMessage = function(_charts, domIdPrefix, cnt) {
        var chtMessageFrame = this.drawChtMessageFrame();
        
        chtMessageFrame.append('<span class="chartTitle">'+_charts[cnt].name+'</span><br />There is no data<br />to draw a chart');
        $('#'+domIdPrefix+cnt).empty();
        $('#'+domIdPrefix+cnt).append(chtMessageFrame);
    };
    
    this.hideShowFilters = function(action) {
        if (action == 'show') {
            if ($( $('#dropDownMenu1').attr('href') ).css('display') != 'block' && this.Data.activemenu == 1) {
                $('#dropDownMenu1').trigger('click',[true]);
            }
            $('#dropDownMenu1,#dataFiltersLabel').parent('li').show();
        } else if (action == 'hide') {
            if ($( $('#dropDownMenu1').attr('href') ).css('display') == 'block' && this.Data.activemenu == 1) {
                $('#dropDownMenu1').trigger('click',[true]);
            }
            $('#dropDownMenu1,#dataFiltersLabel').parent('li').hide();
        }
    };
    
    this.drawFilters = function() {
        var i, j, _Settings, optArr, mainSpan, filter, option, groupIndex, mulitselectconf = {};
        var thisRef = this;
        
        // setting up a proper table settings
        _Settings = this.Settings[this.Data.table]; // Shortcut
        // if settings for a given table are undefined create an empty settings
        // object to prevent en error in the next command
        if (_Settings === undefined) _Settings = {};
        
        // if filters for a given table exists, draw controlls
        if (_Settings.filters !== undefined && this.Filter != this.Data.table) {
            this.Filter = this.Data.table;
            // defining empty functions to use as defaults for ajax functions
            var emptyFunc = function() {/*do nothing*/};
            var returnEmptyObjFunc = function() { return {}; };
            
            // setup incoming ajax data
            var handleAjaxData = function(data){
                try {
                    thisRef.Data.mem.filters[_Settings.filters[i].urlVariable] = data;
                    optArr = _Settings.filters[i].options.translateData(data);
                } catch(err1) {
                    if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err1);
                }
            };
            
            // define options array: [['optionValue1','optionLabel1'],['optionValue2','optionLabel2']]
            optArr = []; 
            
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
                // create span to draw a filter html control
                mainSpan = $('<span></span>').attr('id','filter_'+_Settings.filters[i].urlVariable).addClass('filterItems').html(_Settings.filters[i].label+'<br />');
                
                // draw text, date or datetime filter, if hidden, input field will not display
                if (_Settings.filters[i].fieldType == 'text' || _Settings.filters[i].fieldType == 'hidden' || _Settings.filters[i].fieldType == 'date' || _Settings.filters[i].fieldType == 'datetime') {
                    filter = $('<input></input>').attr({
                        'type':'text',
                        'id':_Settings.filters[i].urlVariable,
                        'value':this.Data.filters[_Settings.filters[i].urlVariable]
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
                        if (this.Data.mem.filters[_Settings.filters[i].urlVariable] === undefined) {
                            // check if options.dataURL_params is defined
                            // if no, use previously defined function returning empty object
                            if (_Settings.filters[i].options.dataURL_params === undefined) _Settings.filters[i].options.dataURL_params = returnEmptyObjFunc;
                            
                            // query for the options, previously defnied handleAjaxData
                            // function will be used to store and preper the data 
                            this.Data.ajax_getData_sync('filter', _Settings.filters[i].options.dataURL, _Settings.filters[i].options.dataURL_params(this.Data), handleAjaxData, emptyFunc);
                        }
                        // if data already resides in memory, simply use them to redraw the filter control
                        else {
                            try {
                                optArr = _Settings.filters[i].options.translateData(this.Data.mem.filters[_Settings.filters[i].urlVariable]);
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
                            optArr = _Settings.filters[i].options.translateData(this.Data);
                        } catch(err3) {
                            if (thisRef.Settings.Application.debugMode) thisRef.setupErrorDialog(err3);
                        }
                    }
                    
                    // if options array (optArr) is still empty, terminate a function
                    if (optArr.length === 0) return false;
                    //if (optArr === false) return false;
                    
                    // if there is more than one option element, draw
                    if (optArr.length > 0) for (j=0;j<optArr.length;j++) {
                        // create option html element
                        option = $('<option></option>').attr('value',optArr[j][0]).text(optArr[j][1]);
                        
                        // check which fields should be selected
                        if (_Settings.filters[i].fieldType == 'multiselect') {
                            if (optArr[j][0] == thisRef.Data.filters[_Settings.filters[i].urlVariable] || $.inArray(optArr[j][0], thisRef.Data.filters[_Settings.filters[i].urlVariable]) != -1) option.attr('selected','selected');
                        } else {
                            if (optArr[j][0] == this.Data.filters[_Settings.filters[i].urlVariable]) option.attr('selected','selected');
                        }
                        filter.append(option);
                    }
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
                else if (_Settings.filters[i].fieldType == 'multiselect') {
                    mulitselectconf = {
                        selectedText: "# of # selected",
                        classes:'hb-multiselect'
                    };
                
                    if (_Settings.filters[i].options.disableFilterOptionsList !== undefined) {
                        $.extend(mulitselectconf, {
                            click: thisRef.multiselect_change,
                            checkAll: thisRef.multiselect_change,
                            uncheckAll: thisRef.multiselect_change
                        });
                        //$('#'+_Settings.filters[i].urlVariable).bind('multiselectclick',this.multiselect_change);
                    }
                    
                    $('#'+_Settings.filters[i].urlVariable).multiselect(mulitselectconf);
                    $('button.ui-multiselect').css('width','130px');
                }
                else if (_Settings.filters[i].fieldType == 'select') {
                    $('#'+_Settings.filters[i].urlVariable).change(this.multiselect_change);
                }
            }
            
            this.hideShowFilters('show');//$('#dataFilters').show();
            
            this.filter_change();
        }
    };
    
    this.filtersUpdate = function() {
        var i, _Settings;
        var thisRef = this;
        
        var addSelectOption = function(j) {
            $(this).removeAttr('selected');
            if ($(this).val() == thisRef.Data.filters[_Settings.filters[i].urlVariable]) $(this).attr('selected','selected');
        };
        
        var addMultiSelectOption = function(j) {
            try {
                $(this).removeAttr('selected');
                if ($(this).val() == thisRef.Data.filters[_Settings.filters[i].urlVariable] || $.inArray($(this).val(), thisRef.Data.filters[_Settings.filters[i].urlVariable]) != -1) $(this).attr('selected','selected');
            } catch(err) {/*do nothing*/}
        };
        
        if (this.appDisplayState() != 'users') {
            _Settings = this.Settings[this.Data.table]; // Shortcut
            
            if (_Settings.filters !== undefined) {
                for (i=0;i<_Settings.filters.length;i++) {
                    if (_Settings.filters[i].fieldType == 'text' || _Settings.filters[i].fieldType == 'date') {
                        $('.filterItems #'+_Settings.filters[i].urlVariable).attr('value', this.Data.filters[_Settings.filters[i].urlVariable]);
                    } 
                    else if (_Settings.filters[i].fieldType == 'select') {
                        $('.filterItems #'+_Settings.filters[i].urlVariable+' option').each( addSelectOption );
                    } else if (_Settings.filters[i].fieldType == 'multiselect') {
                        $('.filterItems #'+_Settings.filters[i].urlVariable+' option').each( addMultiSelectOption );
                    }
                    
                    this.filtersSubmit_OnOff(i);
                }
                
                this.setupURL();
                this.filter_change();
            }
        }
    };
}
