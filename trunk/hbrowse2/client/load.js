// This file is part of the hBrowse software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 19.09.2011 Created
//

var loadedNumber = 0;
var totalNumberOfScripts = 24;
var chLoadingBar = function() {
    loadedNumber++;
    var width = Math.ceil((loadedNumber/totalNumberOfScripts)*100);
    document.getElementById('sLoadBar').style.width=width+"%";
}

// Load all required libraries
$LAB
// Load libs
.script('media/lib/jquery-1.6.2.min.js').wait(chLoadingBar)
.script('media/lib/jquery.dataTables-1.8.0.min.js').wait(chLoadingBar)
.script('media/lib/Scroller.min.js').wait(chLoadingBar)
.script('media/lib/highcharts.js').wait(chLoadingBar)
.script('media/lib/exporting.js').wait(chLoadingBar)
.script('media/lib/quicksilver.js').wait(chLoadingBar)
.script('media/lib/jquery.livesearch.js').wait(chLoadingBar)
.script('media/lib/jquery.json-2.1.min.js').wait(chLoadingBar)
.script('media/lib/jquery.ba-bbq.min.js').wait(chLoadingBar)
.script('media/lib/cache.js').wait(chLoadingBar)
.script('media/lib/jquery.base64.js').wait(chLoadingBar)
.script('media/lib/jquery-ui-1.8.16.custom.min.js').wait(chLoadingBar)
.script('media/lib/jquery-ui-timepicker-addon.js').wait(chLoadingBar)
.script('media/lib/jquery.multiselect.min.js').wait(chLoadingBar)
.script('media/lib/jquery.dataTables.pagination.input.js').wait(chLoadingBar)

// Load framework
.script('media/scripts/api.js').wait(chLoadingBar)
.script('media/scripts/controlsupdate.js').wait(chLoadingBar)
.script('media/scripts/events.js').wait(chLoadingBar)
.script('media/scripts/controller.js').wait(chLoadingBar)
.script('media/scripts/data.js').wait(chLoadingBar)
.script('media/scripts/components/lkfw.searchable.list.js').wait(chLoadingBar)
.script('media/scripts/components/lkfw.datatable.js').wait(chLoadingBar)
.script('media/scripts/components/idfn.datatable.sorting.js').wait(chLoadingBar)
.script('media/scripts/components/lkfw.tooltip.js').wait(chLoadingBar)

// Load Settings
.script('settings.js')

// Initialize hbrowse application
.wait(function(){
    $(document).ready( function() {
        var _cache_max_entries = 10;
        var _cache_lifetime = 60;
        _Cache = new Cache(_cache_max_entries, _cache_lifetime);
        Controller = new Controller();
        Controller.Init();
    } );
})
.wait(function(){
    $('#systemLoading').hide();
    $('#container').show();
});
