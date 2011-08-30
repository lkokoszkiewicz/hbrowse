// This file is part of the jTaskMonitoring software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
//

/*JSHINT*/
/*global _Cache: false*/

function Data(ajaxAnimation, _Settings) {
    var i, settings, jsonp;
    
    settings = _Settings.Application.modelDefaults();
    
    // Copy val instead create reference
    this.copyVal = function(val) {
        return val;
    };
    
    jsonp = _Settings.Application.jsonp;
    // general values
    this.user = settings.user;
    this.refresh = settings.refresh;
    this.table = settings.table;
    this.p = settings.p;
    this.records = 25;
    this.sorting = settings.sorting;
    this.or = settings.or; // opened table rows
    this.uparam = settings.uparam; // user defined params (for params that cannot be shared between use cases)
    this.activemenu = 0;
    
    this.noreload = false;
    
    this.filters = {};
    this.breadcrumbs = [];
        
    // Data
    this.mem = {
        users: [],
        table: {
            user: '',
            timestamp: 0,
            data: [],
            json:{}
        },
        filters:{}
    };
    
    // Setting up user defined filters
    if (this.table != '') {
        if (_Settings[this.table].filters !== undefined) {
            for (i=0;i<_Settings[this.table].filters.length;i++) {
                this.filters[_Settings[this.table].filters[i].urlVariable] = this.copyVal(_Settings[this.table].filters[i].value);
            }
        }
    }
    
    // Ajax xmlhttprequest object used to store table data requests handlers
    this.xmlhttprequest = null;
    
    this.selectTableSettings = function() {
        var tSettings;
        if (this.tid === '' || this.user === '') tSettings = _Settings.Mains;
        else tSettings = _Settings.Subs;
        
        return tSettings;
    };
    
    this.quickSetup = function(params, ts2iso) {
        var i, filter;
        var settings = _Settings.Application.modelDefaults();
        var tSettings = this.selectTableSettings();
        
        this.user = (params.user || settings.user);
        this.refresh = (parseInt(params.refresh, 10) || settings.refresh);
        this.table = (params.table || settings.table);
        this.p = (parseInt(params.p, 10) || settings.p);
        this.records = (parseInt(params.records, 10) || this.copyVal(tSettings.iDisplayLength));
        this.or = (params.or || settings.or);
        this.sorting = (params.sorting || []);
        this.uparam = (params.uparam || settings.uparam);
        this.activemenu = (parseInt(params.activemenu, 10) || 0);
        
        // make this.or an array of ints
        for (i=0;i<this.or.length;i++) {
            this.or[i] = parseInt(this.or[i], 10);
        }
        
        // Setting up user defined filters
        if (this.table != '') {
            if (_Settings[this.table].filters !== undefined) {
                for (i=0;i<_Settings[this.table].filters.length;i++) {
                    filter = _Settings[this.table].filters[i];
                    //alert(_Settings[this.table].filters[i].urlVariable+': '+(params[_Settings[this.table].filters[i].urlVariable] || this.copyVal(_Settings[this.table].filters[i].value)));
                    this.filters[filter.urlVariable] = ((params[filter.urlVariable] === undefined || params[filter.urlVariable] == 'undefined') ? this.copyVal(filter.value) : params[filter.urlVariable]);
                }
            }
        }
    };
    
    this.setOr = function(dataID) {
        if ($.inArray(dataID, this.or) == (-1)) {
            this.or.push(dataID);
            return true;
        }
        else {
            return false;
        }
    };
    
    // Dates handling - Start
    this.iso2ts = function(date, mode) {
        if (mode === undefined) mode = 1;
        if (date === 0 || date == '0' || date === undefined) return 0;
        else {
            if (mode == 1) return $.datepicker.formatDate('@', $.datepicker.parseDate('yy-mm-dd',date));
            else if (mode == 2) return parseInt($.datepicker.formatDate('@', $.datepicker.parseDate('yy-mm-dd',date)), 10) + 86399000;
            else return 0;
        }
    };
    
    this.ts2iso = function(date, mode) {
        if (mode === undefined) mode = 1;
        if (date === 0 || date == '0' || date === undefined) return '';
        else {
            if (mode == 1) return $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',date));
            else if (mode == 2) return $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',date)) + ' 00:00';
            else if (mode == 3) return $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',date)) + ' 23:59';
            else return '';
        }
    };
    
    this.changeFromTill = function(which, timestamp) {
        var output = true;
        if (timestamp === '') timestamp = 0;
        else timestamp = parseInt(timestamp, 10);
        
        if (which == 'from') {
            if (timestamp > this.till && timestamp !== 0) {
                this.till = (timestamp + 86399000);
            }
            else if (timestamp === 0) {
                timestamp = (this.till - 86399000);
                output = false;
            }
            this.from = timestamp;
        }
        else if (which == 'till') {
            if (((timestamp+86399000) < this.from || this.from === 0) && timestamp !== 0) {
                this.from = timestamp;
            }
            else if (timestamp === 0) {
                timestamp = this.till;
                output = false;
            }
            this.till = (timestamp+86399000);
        }
        return output;
    };
    // Dates handling - Finish
    
    this.addPortNumber = function(url, port) {
        url = url.replace('//','^^');
        if (url.search('/') != -1) {
            url = url.replace('/',':'+port+'/');
        } else {
            url = url+':'+port;
        }
        url = url.replace('^^','//');
        return url;
    };
    
    this.requestErrorDialog = function(xhrName, textStatus, errorThrown) {
        if (_Settings.Application.debugMode) {
            var html = '';
            html += 'Please check your settings file for any url misspells and your server.<br />----------<br />';
            html += 'Test Status: '+textStatus+'<br />----------<br />';
            html += 'Error: '+errorThrown;
            $('#dialog-content').html(html);
            $('#dialog-message').dialog({ 
                title: 'Error during ajax request (xhrName: '+xhrName+')',
                modal: true,
                width: 700,
			    buttons: {
				    Ok: function() {
					    $( this ).dialog( "close" );
					    window.history.back();
				    }
			    } 
	        });
            $('#dialog-message').dialog('open');
        }
        else {
            window.history.back();
        }
    };
    
    // Get job subs from server
    this.ajax_getData = function(xhrName, url, params, fSuccess, fFailure) {
        var i, currentUrl, portIndex, port, isNumber, index, urlChar, paramsString, key, data;
        var thisRef = this;
        
        currentUrl = window.location.toString();
        portIndex = currentUrl.indexOf('?port=');
        if (portIndex > -1) {
            
            port = '';
            isNumber = true;    
            index = portIndex + 6;
        
            while(isNumber){
                urlChar = currentUrl[index];
                if(urlChar == '0' || urlChar == '1' || urlChar =='2' ||
                   urlChar == '3' || urlChar == '4' || urlChar =='5' ||
                   urlChar == '6' || urlChar == '7' || urlChar =='8' || urlChar =='9'){
                    port = port + currentUrl[index];
                    index++;
                }
                else{
                    isNumber = false;
                }
                
            }

            url = this.addPortNumber(url, port);            
        }

        
        paramsString = '';
        for (i in params) {
            if (params.hasOwnProperty(i)) {
                paramsString += i+'='+params[i]+'&';
            }
        }
        key = $.base64Encode(xhrName+'^'+url+'#'+paramsString);
        
        data = _Cache.get(key);
        if (data) {
            fSuccess(data);
        } else if (url) {
            ajaxAnimation.addClass(xhrName).fadeIn(200);
            if (this.xmlhttprequest) this.xmlhttprequest.abort();
            this.xmlhttprequest = $.ajax({
                type: "GET",
                url: url,
                data: params,
                dataType: (jsonp ? "jsonp" : "json"),/*
                jsonp: (jsonp ? "jsonp_callback" : false),
                jsonpCallback: 'callbackName',*/
                success: function(data, textStatus, jqXHR) {
                    _Cache.add(key, data);
                    fSuccess(data);
                    ajaxAnimation.removeClass(xhrName);
                    if (!ajaxAnimation.attr('class')) ajaxAnimation.fadeOut(400);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    ajaxAnimation.removeClass(xhrName);
                    if (!ajaxAnimation.attr('class')) ajaxAnimation.fadeOut(400);
                    fFailure();
                    thisRef.requestErrorDialog(xhrName, textStatus, errorThrown);
                    //window.history.back();
                }
            });
            this.xmlhttprequest = null;
        }
    };
    
    // Get job subs from server
    this.ajax_getData_sync = function(xhrName, url, params, fSuccess, fFailure, obj) {
        var i, currentUrl, portIndex, port, isNumber, index, urlChar, paramsString, key, data;
        if ( obj === undefined ) {
            obj = '';
        }
        var thisRef = this;
        
        currentUrl = window.location.toString();
        portIndex = currentUrl.indexOf('?port=');
        if (portIndex > -1) {
            
            port = '';
            isNumber = true;    
            index = portIndex + 6;
        
            while(isNumber){
                urlChar = currentUrl[index];
                if(urlChar == '0' || urlChar == '1' || urlChar =='2' ||
                   urlChar == '3' || urlChar == '4' || urlChar =='5' ||
                   urlChar == '6' || urlChar == '7' || urlChar =='8' || urlChar =='9'){
                    port = port + currentUrl[index];
                    index++;
                }
                else{
                    isNumber = false;
                }
                
            }

            url = this.addPortNumber(url, port);            
        }
        
        paramsString = '';
        for (i in params) {
            if (params.hasOwnProperty(i)) {
                paramsString += i+'='+params[i]+'&';
            }
        }
        key = $.base64Encode(xhrName+'^'+url+'#'+paramsString);

        //ajaxAnimation.addClass(xhrName).show();
        data = _Cache.get(key);
        if (data) {
            fSuccess(data, obj);
        } else if (url) {
            $.ajax({
                type: "GET",
                url: url,
                async: false,
                timeout: 15000,
                data: params,
                dataType: (jsonp ? "jsonp" : "json"),
                //jsonp: "jsonp_callback",
                success: function(data, textStatus, jqXHR) {
                    _Cache.add(key, data);
                    fSuccess(data, obj);
                    //ajaxAnimation.removeClass(xhrName);
                    //if (!ajaxAnimation.attr('class')) ajaxAnimation.hide();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    ajaxAnimation.removeClass(xhrName);
                    //if (!ajaxAnimation.attr('class')) ajaxAnimation.hide();
                    //fFailure(obj);
                }
            });
        }
    };
}
