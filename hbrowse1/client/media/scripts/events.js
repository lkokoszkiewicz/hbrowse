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
/*global ControlsUpdate: false*/

function Events() {
    this.userDropDown_Change = function(el) {
        $('.tablePlus').attr('src', 'media/images/table_plus.png');
        //this.Data.or = [];
        this.Data.tid = '';
        this.Data.sorting = [];
        this.Data.user = $(el).val();
        this.Data.noreload = false;
        this.setupURL();
    };

    this.userListItem_Click = function(el) {
        this.Data.user = $(el).text();
        this.Data.noreload = false;
        this.setupURL();
    };
    
    this.timeRange_Change = function(el) {
        this.Data.timeRange = $(el).val();
        this.Data.from = 0;
        this.Data.till = 0;
        $('.tablePlus').attr('src', 'media/images/table_plus.png');
        //this.Data.or = [];
        this.Data.noreload = false;
        this.setupURL();
    };
    
    this.refresh_Change = function(el) {
        var thisRef = this;
        this.Data.refresh = parseInt($(el).val(), 10);
        
        try { clearInterval(this.intervalID); } finally {}
        if (this.Data.refresh > 0) this.intervalID = setInterval( function() { thisRef.viewUpdater(); }, (this.Data.refresh*1000) );
        //this.Data.noreload = true;
        //$('.tablePlus').attr('src', 'media/images/table_plus.png');
        //this.Data.or = [];
        this.Data.noreload = false;
        this.setupURL();
    };
    
    this.fromTill_Change = function(el) {
        if( !this.Data.changeFromTill(el.id, ($.datepicker.formatDate('@',$(el).datepicker( "getDate" )))) ) {
            if (this.Data[el.id] === 0) $(el).datepicker( "setDate", null );
            else $(el).datepicker( "setDate", $.datepicker.parseDate('@',(this.Data[el.id])) );
        }
        this.Data.timeRange = '';
        $('.tablePlus').attr('src', 'media/images/table_plus.png');
        this.Data.or = [];
        this.Data.noreload = false;
        this.setupURL();
    };
    
    this.userListItem_MouseOver = function(el) {
        $(el).css('background-color','#d7e6f1');
    };
    
    this.userListItem_MouseOut = function(el) {
        $(el).css('background-color','#ffffff');
    };
    
    this.breadcrumbs_click = function(el) {
        var _Settings = this.Settings.Application; // Shortcut
        if ($(el).text() == _Settings.usersListLbl) {
            this.Data.user = '';
        }
        this.Data.tid = '';
        this.Data.sorting = [];
        this.Data.uparam = [];
        this.Data.p = 1;
        $('.tablePlus').attr('src', 'media/images/table_plus.png');
        this.Data.or = [];
        this.Data.noreload = false;
        this.setupURL();
    };
    
    this.expand_click = function(dataID) {
        var _Settings, rowDataSet, output;
        var thisRef = this;
    
        if (this.appDisplayState() == 'mains') {
            _Settings = this.Settings.Mains; // Shortcut
            rowDataSet = this.Data.mem.mains.data[dataID];
        }
        else {
            _Settings = this.Settings.Subs; // Shortcut
            rowDataSet = this.Data.mem.subs.data[dataID];
        }
        
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
        
        if ($.inArray(dataID, this.Data.or) == -1) {
            if (_Settings.multipleER) this.Data.or.push(dataID);
            else this.Data.or = [dataID];
            this.Data.noreload = true;
            this.setupURL();
        }
        
        return output;
    };
    
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
    
    this.erClose_click = function(dataID) {
        if (this.Data.or.length > 1) {
            var position = $.inArray(dataID, this.Data.or);
            this.Data.or.splice(position,1);
        }
        else {
            this.Data.or = [];
        }
        this.Data.noreload = true;
        this.setupURL();
    };
    
    this.mainsTableContent_change = function(el) {
        var records, _Settings = this.Settings.Mains; // Shortcut
        var thisRef = this;
        if ($('#dataTable_0_paginate input').val() !== undefined) this.Data.p = $('#dataTable_0_paginate input').val();
        if (this.Data.noreload === false) {
            $('.tablePlus').attr('src', 'media/images/table_plus.png');
            this.Data.or = [];
        }
        records = parseInt($('#dataTable_0_length select').val(), 10);
        if (!isNaN(records)) this.Data.records = records;
        $('#dataTable_0 tbody a.drilldown').closest('td').unbind();
        $('#dataTable_0 tbody a.drilldown').closest('td').click(function(){ 
            var aPos = thisRef.mainsTable[0].fnGetPosition(this);
            thisRef.drillDown_click(this, aPos[0]); 
        });
        
        // Running settings post processing (if avaliable)
        try {
            _Settings.tableActivityEvent(el, thisRef.Data.mem);
        } catch(err) { /* do nothing */ }
        
        this.Data.noreload = true;
        this.setupURL();
    };
    
    this.drillDown_click = function(el, rowIndex) {
        var i, _Settings, dParams = false;
        _Settings = this.Settings.Mains; // Shortcut
        
        // setup model
        if ($.isFunction(_Settings.drillDownHandler)) dParams = _Settings.drillDownHandler(this.Data, el, rowIndex);
        if (dParams) {
            if (dParams.uparam !== undefined) this.Data.uparam = dParams.uparam;
            if (dParams.tid !== undefined) this.Data.tid = dParams.tid;
            if (dParams.filters !== undefined) {
                for (i in dParams.filters) {
                    if (dParams.filters.hasOwnProperty(i)) {
                        this.Data.filters[i] = dParams.filters[i];
                    }
                }
            }
        } else alert('setupUserParams settings function was replaced by drillDownHandler function, see documentation and latest settings.js_example for detailes!');
        this.Data.or = [];
        this.Data.sorting = [];
        this.Data.p = 1;
        this.Data.noreload = false;
        this.setupURL();
    };
    
    this.subsTableContent_change = function(el) {
        var _Settings = this.Settings.Subs; // Shortcut
        var thisRef = this;
        if ($('#dataTable_0_paginate input').val() !== undefined) this.Data.p = $('#dataTable_0_paginate input').val();
        
        this.Data.records = parseInt($('#dataTable_0_length select').val(), 10);
        
        // Running settings post processing (if avaliable)
        try {
            _Settings.tableActivityEvent(el, thisRef.Data.mem);
        } catch(err) { /* do nothing */ }
        
        this.Data.noreload = true;
        this.setupURL();
    };
    
    this.tableSorting_click = function(el, dataTable) {
        var tSettings = dataTable.fnSettings();
        //alert(tSettings.aaSorting[0][1]);
        this.Data.sorting = Array(tSettings.aaSorting[0][0],tSettings.aaSorting[0][1]);
        //this.Data.noreload = true;
        //this.setupURL();
    };
    
    this.filtersSubmit_click = function(el) {
        var i, _Settings;
    
        if (this.appDisplayState() == 'mains') _Settings = this.Settings.Mains; // Shortcut
        else if (this.appDisplayState() == 'subs') _Settings = this.Settings.Subs; // Shortcut
        
        for (i=0;i<_Settings.filters.length;i++) {
            this.Data.filters[_Settings.filters[i].urlVariable] = ($('.filterItems #'+_Settings.filters[i].urlVariable).val() || '');
            this.filtersSubmit_OnOff(i);
        }
        this.Data.or = [];
        this.Data.sorting = [];
        this.Data.p = 1;
        this.setupURL();
        
        this.filter_change();
    };
    
    this.filtersSubmit_OnOff = function(i) {
        var _Settings;
    
        if (this.appDisplayState() == 'mains') _Settings = this.Settings.Mains; // Shortcut
        else if (this.appDisplayState() == 'subs') _Settings = this.Settings.Subs; // Shortcut
        
        if (_Settings.filters[i].options.On !== undefined && this.Data.filters[_Settings.filters[i].urlVariable] !== '') {
            _Settings.filters[i].options.On(this.Data);
        } else if (_Settings.filters[i].options.Off !== undefined && this.Data.filters[_Settings.filters[i].urlVariable] === '') {
            _Settings.filters[i].options.Off(this.Data);
        }
    };
    
    this.filter_change = function() {
        var i, j, div, _Settings, selectElements, elIndex, fElementsArr = [];
        var thisRef = this;
        
        // Prepare html for the filters summary
        div = $('<div></div>').append($('<h3></h3>').html('Filters Summary').css('margin','0px 0px 3px 0px'));
        // Check the state of the app and load proper settings
        switch (this.appDisplayState()) {
            case 'mains':
                _Settings = this.Settings.Mains;
                break;
            case 'subs':
                _Settings = this.Settings.Subs;
                break;
        }
        
        // loop through the filters array
        for (i=0; i<_Settings.filters.length;i++) {
            if (this.Data.filters[_Settings.filters[i].urlVariable] !== '') {
                if (_Settings.filters[i].fieldType == 'select') {
                    try {
                        if (_Settings.filters[i].urlVariable === undefined) selectElements = _Settings.filters[i].options.translateData();
                        else selectElements = _Settings.filters[i].options.translateData(this.Data.mem.filters[_Settings.filters[i].urlVariable]);
                        for (j=0;j<selectElements.length;j++) {
                            if (selectElements[j][0] == this.Data.filters[_Settings.filters[i].urlVariable]) {
                                div.append('<span style="font-weight:bold">'+_Settings.filters[i].label+'</span>: '+selectElements[j][1]+'<br />');
                            }
                        }
                    } catch(err1) { /*do nothing*/ }
                } else if (_Settings.filters[i].fieldType == 'multiselect') {
                    try {
                        if (_Settings.filters[i].urlVariable === undefined) selectElements = _Settings.filters[i].options.translateData();
                        else selectElements = _Settings.filters[i].options.translateData(this.Data.mem.filters[_Settings.filters[i].urlVariable]);
                        
                        fElementsArr = [];
                        for (j=0;j<selectElements.length;j++) {
                            elIndex = $.inArray(selectElements[j][0], this.Data.filters[_Settings.filters[i].urlVariable]);
                            if (elIndex != -1) {
                                fElementsArr.push(selectElements[j][1]);
                            }
                        }
                        div.append('<span style="font-weight:bold">'+_Settings.filters[i].label+'</span>: '+fElementsArr.join(', ')+'<br />');
                    } catch(err2) { /*do nothing*/ }
                } else {
                    div.append('<span style="font-weight:bold">'+_Settings.filters[i].label+'</span>: '+this.Data.filters[_Settings.filters[i].urlVariable]+'<br />');
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
            'delay':500,
            'posShift':[12,-1],
            'css':{
                'width':'215px'
            }
        });
    };
    
    this.drawChtRequestButton_click = function(el, _charts, domIdPrefix, cnt) {
        $(el).attr({'value':'Loading...','disabled':'disabled'});
        this.drawChart(_charts, domIdPrefix, cnt, true);
    };
}

// Inherits from ControlsUpdate()
Events.prototype = new ControlsUpdate();
