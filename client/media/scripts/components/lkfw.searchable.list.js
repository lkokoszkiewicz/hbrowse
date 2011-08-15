// This file is part of the jTaskMonitoring software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// Requirements:
// - jquery.livesearch.js
// - quicksilver.js
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
//

(function($) {
    $.fn.lkfw_searchableList = function(settings) {
        var _config = {
            'listId': 'srchList',
            'srchFieldId': 'srchField',
            'items': [],
            'srchFldLbl': 'Search'
        };
        
        var elCnt = 0;
        
        var _buildList = function(elCnt) {
            var i, sFieldDiv, sFieldForm, sFieldInput, sList, sLi;
        
            sFieldDiv = $('<div></div>').addClass(_config.srchFieldId+'_div');
            sFieldForm = $('<form></form>').attr('method','get');
            sFieldInput = $('<input />').attr({
                type: 'text',
                value: '',
                name: _config.srchFieldId+'_'+elCnt,
                id: _config.srchFieldId+'_'+elCnt
            });
            
            sFieldDiv.append(sFieldForm.append(_config.srchFldLbl).append(sFieldInput));
            
            sList = $('<ul></ul>').attr('id', _config.listId+'_'+elCnt);
            
            for (i=0;i<_config.items.length;i++) {
                sLi = $('<li></li>').text(_config.items[i]);
                sList.append(sLi);
            }
            
            var output = sFieldDiv.after(sList);
            
            return output;
        };
 
        if (settings) $.extend(_config, settings);
        this.each(function() {
            // element-specific code here
            $(this).empty().append(_buildList(elCnt));
            $('#srchField_'+elCnt).liveUpdate(_config.listId+'_'+elCnt);
            elCnt++;
        });

        return this;
    };
})(jQuery);
