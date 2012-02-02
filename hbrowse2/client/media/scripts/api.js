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

/*
   Class: hbrowseAPI
   This class provides some helper methods.
*/
var hbrowseAPI = {
// secondsToDuration ----------------------------------------------------------
    
    /*
        Function: secondsToDuration
        Calculates duration numbers (days, hours, minutes, and seconds)
        
        Parameters:
            secs - integer, duration in seconds
        
        Returns:
            object - {d:<days>,h:<hours>,m:<minutes>,s:<seconds>}
    */
    secondsToDuration: function(secs) {
        var addLeadingZero = function(num) {
            return (num < 10 ? '0'+num : ''+num);
        };
        var days = Math.floor(secs / 86400);
        
        var divison_for_hours = secs % 86400;
        var hours = Math.floor(divison_for_hours / (60 * 60));
       
        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);
     
        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
       
        var obj = {
            "d": days,
            "h": addLeadingZero(hours),
            "m": addLeadingZero(minutes),
            "s": addLeadingZero(seconds)
        };
        return obj;
    },

// ----------------------------------------------------------------------------

// getUTCTimeDate -------------------------------------------------------------

    /*
        Function: getUTCTimeDate
        Returns current, iso formatted (YYYY-MM-DD hh:mm), UTC time
        
        Parameters:
            minus - number of miliseconds you want to deduct from the output time
        
        Returns:
            iso formatted date
        
        See Also:
            <ts2iso>, <iso2ts>
    */
    getUTCTimeDate: function(minus) {
        if (minus === undefined) minus = false;
        
        var addLeadingZero = function(num) {
            return (num < 10 ? '0'+num : ''+num);
        };
        
        var date = new Date();
        if (minus) {
            var ts = date.getTime();
            ts -= minus;
            var date = new Date(ts);
        }
        
        return addLeadingZero(date.getUTCFullYear())+'-'
            +addLeadingZero((date.getUTCMonth()+1))+'-'
            +addLeadingZero(date.getUTCDate())+' '
            +addLeadingZero(date.getUTCHours())+':'
            +addLeadingZero(date.getUTCMinutes());
    },

// ----------------------------------------------------------------------------

// iso2ts ---------------------------------------------------------------------
    
    /*
        Function: iso2ts
        Converts iso formatted date (YYYY-MM-DD) to a timestamp in miliseconds.
        
        Function accepts 2 modes:
        - 1 - (default) just converts the date (YYYY-MM-DD) to a timestamp 
        - 2 - adds 86399000 (23 hours 59 minutes) to the timestamp value
        
        Parameters:
            date - date in timestamp format
            mode - Integer (1|2|3)
        
        Returns:
            Timestamp
        
        See Also:
            <ts2iso>, <getUTCTimeDate>
    */
    iso2ts: function(date, mode) {
        if (mode === undefined) mode = 1;
        if (date === 0 || date == '0' || date === undefined) return 0;
        else {
            if (mode == 1) return $.datepicker.formatDate('@', $.datepicker.parseDate('yy-mm-dd',date));
            else if (mode == 2) return parseInt($.datepicker.formatDate('@', $.datepicker.parseDate('yy-mm-dd',date)), 10) + 86399000;
            else return 0;
        }
    },

// ----------------------------------------------------------------------------

// ts2iso ---------------------------------------------------------------------
    
    /*
        Function: ts2iso
        Converts timestamp to an iso formatted date (YYYY-MM-DD).
        
        Function accepts 3 modes:
        - 1 - (default) just converts the timestamp to a date (YYYY-MM-DD)
        - 2 - adds 00:00 hour at the end (YYYY-MM-DD 00:00)
        - 3 - adds 23:59 hour at the end (YYYY-MM-DD 23:59)
        
        Parameters:
            date - timestamp in miliseconds
            mode - Integer (1|2|3)
        
        Returns:
            iso formatted date
        
        See Also:
            <iso2ts>, <getUTCTimeDate>
    */
    ts2iso: function(date, mode) {
        if (mode === undefined) mode = 1;
        if (date === 0 || date == '0' || date === undefined) return '';
        else {
            if (mode == 1) return $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',date));
            else if (mode == 2) return $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',date)) + ' 00:00';
            else if (mode == 3) return $.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',date)) + ' 23:59';
            else return '';
        }
    },

// ----------------------------------------------------------------------------

// uniqueArr ------------------------------------------------------------------
    
    /*
        Function: uniqueArr
        Returns array with unique elements
        
        Parameters:
            arrayName - Array to process
        
        Returns:
            Unique array
    */
    uniqueArr: function(arrayName) {
        var newArray=new Array();
        label:for(var i=0; i<arrayName.length;i++ ) {  
            for(var j=0; j<newArray.length;j++ ) {
                if(newArray[j]==arrayName[i]) 
                    continue label;
            }
            newArray[newArray.length] = arrayName[i];
        }
        return newArray;
    },

// ----------------------------------------------------------------------------

// Copy variable --------------------------------------------------------------
    
    /*
        Function: copyVal
        Copy val instead create reference
        
        Parameters:
            variable - any variable (int, string)
        
        Returns:
            Any variable (int, string)
    */
    copyVal: function(variable) {
        return variable;
    }

// ----------------------------------------------------------------------------

};
