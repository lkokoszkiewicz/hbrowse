// This file is part of the hBrowse software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// History:
// 19.09.2011 Created
//

// Load all required libraries
$LAB
// Load libs
.script('media/lib/jquery-1.6.2.min.js')
.script('media/lib/jquery.dataTables-1.8.0.min.js')
.script('media/lib/Scroller.min.js')
.script('media/lib/highcharts.js')
.script('media/lib/exporting.js')
.script('media/lib/quicksilver.js')
.script('media/lib/jquery.livesearch.js')
.script('media/lib/jquery.json-2.1.min.js')
.script('media/lib/jquery.ba-bbq.min.js')
.script('media/lib/cache.js')
.script('media/lib/jquery.base64.js')
.script('media/lib/jquery-ui-1.8.16.custom.min.js')
.script('media/lib/jquery-ui-timepicker-addon.js')
.script('media/lib/jquery.multiselect.min.js')
.script('media/lib/jquery.dataTables.pagination.input.js')

// Load framework
.script('media/scripts/api.js')
.script('media/scripts/controlsupdate.js')
.script('media/scripts/events.js')
.script('media/scripts/controller.js')
.script('media/scripts/data.js')
.script('media/scripts/components/lkfw.searchable.list.js')
.script('media/scripts/components/lkfw.datatable.js')
.script('media/scripts/components/idfn.datatable.sorting.js')
.script('media/scripts/components/lkfw.tooltip.js')

// Load Settings
.script('media/scripts/settings.js').wait(function(){
    $(document).ready( function() {
        var _cache_max_entries = 10;
        var _cache_lifetime = 60;
        _Cache = new Cache(_cache_max_entries, _cache_lifetime);
        Controller = new Controller();
        Controller.Init();
    } );
});
