// This file is part of the hBrowse software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
// 19.09.2011 version 2.0.0 release
//

/*JSHINT*/
/*global _Cache: false*/

/*
   Class: Data
   This class is responsible for storing data and providing it to a system
*/
function Data(ajaxAnimation, _Settings) {

// ============================================================================
// Data object initialization - START
// ============================================================================

    var settings = _Settings.Application.modelDefaults();
    
    var jsonp = _Settings.Application.jsonp;
    
    // Ajax xmlhttprequest object used to store table data requests handlers
    var xmlhttprequest = null;
    
    // general values
    var State = {
        user: settings.user,
        refresh: settings.refresh,
        table: settings.table,
        p: settings.p,
        records: 25,
        sorting: settings.sorting,
        or: settings.or, // opened table rows
        uparam: settings.uparam, // user defined params (for params that cannot be shared between use cases)
        activemenu: 0,
        
        noreload: false,
        
        filters: {},
        breadcrumbs: [],
        
        // Stored Data
        mem: {
            users: [],
            table: {
                user: '',
                timestamp: 0,
                data: [],
                json:{}
            },
            filters:{}
        }
    };
    
    // Setting up user defined filters
    if (State.table != '') {
        if (_Settings[State.table].filters !== undefined) {
            for (var i=0;i<_Settings[State.table].filters.length;i++) {
                State.filters[_Settings[State.table].filters[i].urlVariable] = copyVal(_Settings[State.table].filters[i].value);
            }
        }
    }
    
// ============================================================================
// Data object initialization - FINISH
// ============================================================================

// ============================================================================
// Private utility functions - START
// ============================================================================

// Copy variable --------------------------------------------------------------
    
    /*
        Function: copyVal
        Copy val instead create reference
        
        Parameters:
            variable - any variable (int, string)
        
        Returns:
            Any variable (int, string)
    */
    var copyVal = function(variable) {
        return variable;
    };

// ----------------------------------------------------------------------------

// Get table rows count -------------------------------------------------------
    
    /*
        Function: getDisplayLength
        Determine how many tabe rows should bw shown
        
        Returns:
            Number of rows for the table (int)
    */
    var getDisplayLength = function() {
        if (State.table == '') {
            return _Settings.Application.modelDefaults().initialTable;
        } else {
            return _Settings[State.table].iDisplayLength;
        }
    };
    
// ----------------------------------------------------------------------------

// Port string generation -----------------------------------------------------
    
    /*
        Function: addPortNumber
        Build a url port string
        
        Parameters:
            url - url
            port - port number
        
        Returns:
            Url with port number (string)
    */
    var addPortNumber = function(url, port) {
        url = url.replace('//','^^');
        if (url.search('/') != -1) {
            url = url.replace('/',':'+port+'/');
        } else {
            url = url+':'+port;
        }
        url = url.replace('^^','//');
        return url;
    };
    
// ----------------------------------------------------------------------------

// Display error dialog -------------------------------------------------------
    
    /*
        Function: requestErrorDialog
        Display error dialog on ajax connection error
        
        Parameters:
            xhrName - Request name
            textStatus - Text status of the exception
            errorThrown - Error string
    */
    var requestErrorDialog = function(xhrName, textStatus, errorThrown) {
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
    
// ----------------------------------------------------------------------------
    
// ============================================================================
// Private utility functions - FINISH
// ============================================================================

// ============================================================================
// Public data control and access functions - START
// ============================================================================

// Get/Set the state on the model ---------------------------------------------
    
    /*
        Function: state
        The gateway function for accessing model state (State variable).
        Allows to get or set the modelt values, accessing saved variables and
        objects
        
        Parameters:
            key - (optional) Variable key
            value - (optional) variable new value
            
        Returns:
            Boolean 'true' when value of the variable was changed. If only key
            is defined it will return variable value. If no parameters are
            provided it will return _State_ object
    */
    this.state = function(key, value) {
        if (value !== undefined) {
            State[key] = value;
            return true;
        } else {
            if (key !== undefined) {
                return State[key];
            } else {
                return State;
            }
        }
    };
    
// ----------------------------------------------------------------------------

// Setup State values ---------------------------------------------------------

    /*
        Function: quickSetup
        Setups model state values based on url variable values
        
        Parameters:
            params - params object storing all of the url hash parameters
    */
    this.quickSetup = function(params) {
        var i, filter;
        var settings = _Settings.Application.modelDefaults();
        
        State.user = (params.user || settings.user);
        State.refresh = (parseInt(params.refresh, 10) || settings.refresh);
        State.table = (params.table || settings.table);
        State.p = (parseInt(params.p, 10) || settings.p);
        State.records = (parseInt(params.records, 10) || this.copyVal(getDisplayLength()));
        State.or = (params.or || settings.or);
        State.sorting = (params.sorting || []);
        State.uparam = (params.uparam || settings.uparam);
        State.activemenu = (parseInt(params.activemenu, 10) || 0);
        
        // make this.or an array of ints
        for (i=0;i<State.or.length;i++) {
            State.or[i] = parseInt(State.or[i], 10);
        }
        
        // Setting up user defined filters
        if (State.table != '') {
            if (_Settings[State.table].filters !== undefined) {
                for (i=0;i<_Settings[State.table].filters.length;i++) {
                    filter = _Settings[State.table].filters[i];
                    State.filters[filter.urlVariable] = ((params[filter.urlVariable] === undefined 
                        || params[filter.urlVariable] == 'undefined') ? copyVal(filter.value) : params[filter.urlVariable]);
                }
            }
        }
    };
    
// ----------------------------------------------------------------------------

// Get ajax data --------------------------------------------------------------
    
    /*
        Function: ajax_getData
        Get ajax data for data tables
        
        Parameters:
            xhrName - Custom name of the request
            url - base url for the request (without hash or query parameters)
            params - request url params
            fSuccess - function to run on success
            fFailure - function to run on failure
    */
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

            url = addPortNumber(url, port);            
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
            if (xmlhttprequest) xmlhttprequest.abort();
            xmlhttprequest = $.ajax({
                type: "GET",
                url: url,
                data: params,
                dataType: (jsonp ? "jsonp" : "json"),
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
                    requestErrorDialog(xhrName, textStatus, errorThrown);
                    //window.history.back();
                }
            });
            xmlhttprequest = null;
        }
    };
    
// ----------------------------------------------------------------------------
    
// Get ajax data --------------------------------------------------------------
    
    /*
        Function: ajax_getData
        Get ajax data for charts or filters (async)
        
        Parameters:
            xhrName - Custom name of the request
            url - Base url for the request (without hash or query parameters)
            params - Request url params
            fSuccess - Function to run on success
            fFailure - Function to run on failure
            obj - Additional object to use with fSuccess of fFailure functions
    */
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

            url = addPortNumber(url, port);            
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

// ----------------------------------------------------------------------------
    
// ============================================================================
// Public data control and access functions - FINISH
// ============================================================================
    
}
