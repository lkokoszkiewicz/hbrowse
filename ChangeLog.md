# Change Log #
## v2.2.10 ##
  * Added _disableCache_ filter option (see documentation).

## v2.2.9 ##
  * =AVG and =SUM options of the table column headers and footers are not experimental any more.
  * Added _ajax\_getData\_custom_ function that can be used by a developers to get additional data. It gives little more flexibility to a programmer, for example it's possible to set a POST type connection.

## v2.2.8 ##
  * Some code refactoring
  * Default _settings.js_ file comments improved
  * Documentation updates

## v2.2.7 ##
  * Stopped support for loading scripts animation, anyone interested in the provious behavior will have to add _#container { display:none }_ to his global.css file
  * Added rows highlighting on mouseover
  * Upgraded dataTables plugin to v1.9.0

## v2.2.6 ##
  * Fixed bug where _datetime_ filters where not updated properly

## v2.2.5 ##
  * Added new functions to the hbrowseAPI class:
    * _secondsToDuration_ - Calculates duration numbers from seconds (days, hours, minutes, and seconds)
    * _ts2UTC_ - Converts timestamp to UTC time in iso format
    * _addLeadingZero_ - Adds leading zeros to the number if lesser then 10

## v2.2.4 ##
  * Fixed bug where 'Help' link was not setup with the proper url from the settings file. The _index.html_ file was modified to comply with the changes done to the framework so from now on _Application.supportLnk_ property will be attached to element with id="supportLink"

## v2.2.3 ##
  * Fixed bug with not showing 'There is no data to draw a chart' message when chart _translateData_ function returns _false_

## v2.2.2 ##
  * Added filtersPreSubmit function allowing any presubmit filters actions, including form checking
  * Added drilldown capabilities to chart tables. Now, if you put a.drilldown tag to a tables chart, after clicking it will run corresponding drillDownHandler function

## v2.2.1 ##
  * Fixed bug where onDemand charts did not appear in the right slots

## v2.2.0 ##
  * Added scripts loading animation
  * Filters panel is hidden when the only filters are hidden ones
  * Filters summary now avaliable 'on click'
  * Added autocomplete filter type
  * Added the option to disable filters when certain ones are beeing selected
  * Added charts table number of columns sellection
  * Added the possibility to display charts tab as default for each separate table

## v2.0.0 ##
  * Improved UI
  * There is no data depth level limitation
  * Filters grouping
  * Charts tab charts grouping
  * Everything is loaded asynchronously
  * Added select filters co-dependencies (it is possible to disable some filter options when selecting a certain option from another filter)

## v1.6.2 ##
  * Fixed bug where system checks all of the multiple select items at once
  * Update highcharts library

## v1.6.1 ##
  * Fixed bug with tooltip library when showing filters summary tooltip even after mouse through the filters label
  * Fixed bug when filters summary tooltip showed multiselect fields info incorrectly

## v1.6.0 ##
  * Fixed bug with the missing CSS file responsible for multiselect filter styling
  * Version number sync with other project

## v1.5.3 ##
  * Added multiselect filter type
  * General refactoring of the code

## v1.5.2 ##
  * Fixed bug when first open a page `filter_change` function generated en error

## v1.5.1 ##
  * Added a possibility to select number of records user wants to see on one page

## v1.5.0 ##
  * Added advanced headers (experimental option)
    * Added possibility to add sum of entire column values to the specific colum footer
  * Added filters summary (after hovering a mouse over filters frame label the selected filters summary is displayed)

## v1.4.2 ##
  * Added proper ID to the filters span elements

## v1.4.1 ##
  * Added `Application.initEvent` function allowing running additional actions on application initialization

## v1.4.0 ##
  * Added `tableActivityEvent` functions to the `Settings.Mains` and `Settings.Subs` to allow users to react on table actions such ordering change or p$
  * Added `hashChange` function to the `Settings.Application` allowing users to react ton hashchange event
  * Moved to jQuery v1.6.1 (from v1.5.1)
  * Moved to jQuery.datatables v1.8.0 (from v1.7.4)
    * Loading of table performance was increased by new bDeferRender option of datatables plug-in
  * Number of minor bug-fixes

## v1.3.0 ##
  * Fixed the bug where the user could not modify time ranges drop down list
  * Added possibility to add small tables along with charts
    * Added chart type: _table_
  * full hbrowse app download is now working application
    * created a starting point example settings to start with