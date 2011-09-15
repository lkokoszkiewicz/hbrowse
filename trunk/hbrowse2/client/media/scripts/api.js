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

var hbrowseAPI = {
    // Dates handling - Start
    iso2ts: function(date, mode) {
        if (mode === undefined) mode = 1;
        if (date === 0 || date == '0' || date === undefined) return 0;
        else {
            if (mode == 1) return $.datepicker.formatDate('@', $.datepicker.parseDate('yy-mm-dd',date));
            else if (mode == 2) return parseInt($.datepicker.formatDate('@', $.datepicker.parseDate('yy-mm-dd',date)), 10) + 86399000;
            else return 0;
        }
    },
    
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
    
    changeFromTill: function(which, timestamp) {
        var output = true;
        if (timestamp === '') timestamp = 0;
        else timestamp = parseInt(timestamp, 10);
        
        if (which == 'from') {
            if (timestamp > State.till && timestamp !== 0) {
                State.till = (timestamp + 86399000);
            }
            else if (timestamp === 0) {
                timestamp = (State.till - 86399000);
                output = false;
            }
            State.from = timestamp;
        }
        else if (which == 'till') {
            if (((timestamp+86399000) < State.from || State.from === 0) && timestamp !== 0) {
                State.from = timestamp;
            }
            else if (timestamp === 0) {
                timestamp = State.till;
                output = false;
            }
            State.till = (timestamp+86399000);
        }
        return output;
    }
    // Dates handling - Finish
};
