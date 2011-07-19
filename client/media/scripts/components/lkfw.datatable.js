// This file is part of the jTaskMonitoring software
// Copyright (c) CERN 2010
//
// Author: Lukasz Kokoszkiewicz [lukasz@kokoszkiewicz.com , lukasz.kokoszkiewicz@cern.ch]
//
// Requirements:
// - jquery.dataTables.min.js
// - jquery.ba-bbq.min.js
//
// History:
// 18.05.2010 Created
// 17.01.2011 First production release (v1.0.0)
//

(function($) {
    var methods = {
        init : function ( settings ) {  
            var _config = {
                'dTable': [],
                'tableId': 'srchList',
                'items': [],
                'tblLabels': [],
                'useScrollerPlugin': false,
                'dataTable': {},
                'expandableRows': false,
                'multipleER': false,   // Multiple expandable rows
                'rowsToExpand': [],
                'sorting': [0,'desc'],
                'fnERContent': function ( dataID, onlyData ){ return {'properties':[['error','Data provider function not set up!']],'table':false,'html':false}; },
                'fnERContentPostProcess': function( expandedID ){},
                'fnContentChange': function ( el ){ alert('Please define a proper function to handle "fnContentChange"!'); },
                'fnERClose': function ( dataID ){ alert('Please define a proper function to handle "fnERClose"!'); },
                'fnTableSorting': function ( el ){  }
            };
            
            var _tablePlus = 'media/images/table_plus.png';
            var _tableMinus = 'media/images/table_minus.png';
            
            var _isSimpleHeaders = function() {
                return $.isArray(_config.tblLabels);
            };
            
            var _headerRow = function(contentArr) {
                var i, j, colHeadersTr, index, sum, colHeader;
                colHeadersTr = $('<tr></tr>');
                for (i=0;i<contentArr.length;i++) {
                    if (contentArr[i][0] == '=SUM') {
                        index = parseInt(i, 10);
                        if (contentArr[i][3] !== undefined && contentArr[i][3] !== false) index = contentArr[i][3];
                        sum = 0;
                        for (j=0;j<_config.items.length;j++) {
                            sum = (sum + parseInt(_config.items[j][index], 10));
                        }
                        colHeader = $('<th></th>').text(sum);
                        if (contentArr[i][4] !== undefined) colHeader.css(contentArr[i][4]);
                    } else {
                        colHeader = $('<th></th>').text(contentArr[i][0]);
                        if (contentArr[i][4] !== undefined) colHeader.css(contentArr[i][4]);
                    }
                    if (contentArr[i][1] > 0) colHeader.attr('rowspan',contentArr[i][1]);
                    if (contentArr[i][2] > 0) colHeader.attr('colspan',contentArr[i][2]);
                    if (!_config.expandableRows || i!==0) colHeader.addClass('tblSort');
                    colHeadersTr.append(colHeader);
                }
                return colHeadersTr;
            };
            
            var _countTableColumns = function() {
                var i, colCount;
                if (_isSimpleHeaders()) {
                    return _config.tblLabels.length;
                } else {
                    colCount = 0;
                    if (_config.tblLabels.header.groups !== undefined) {
                        for (i=0;i<_config.tblLabels.header.groups.length;i++) {
                            if (_config.tblLabels.header.groups[i][2] === 0) colCount++;
                        }
                    }
                    if (_config.tblLabels.header.labels !== undefined) {
                        for (i=0;i<_config.tblLabels.header.labels.length;i++) {
                            if (_config.tblLabels.header.labels[i][2] === 0) colCount++;
                        }
                    }
                    return colCount;
                }
            };
            
            var _buildTable = function(elCnt) {
                var i, table, colHeaders, colHeader, colFooters, tblHead, tblFoot, colHeaderGroups, colFooterGroups;
                
                table = $('<table></table>').attr({
                    id: 'dataTable_'+elCnt,
                    cellpadding: '0',
                    cellspacing: '1'
                }).addClass('display');
                if (_isSimpleHeaders()) {
                    colHeaders = $('<tr></tr>');
                    for (i=0; i<_config.tblLabels.length; i++) {
                        colHeader = $('<th></th>').text(_config.tblLabels[i]);
                        if (!_config.expandableRows || i!==0) colHeader.addClass('tblSort');
                        colHeaders.append(colHeader);
                    }
                    colFooters = colHeaders.clone();
                    tblHead = $('<thead></thead>').append(colHeaders);
                    tblFoot = $('<tfoot></tfoot>').append(colFooters);
                    
                    table.append(tblHead);
                    table.append(tblFoot);
                } else {
                    if (_config.tblLabels.header !== undefined) {
                        tblHead = $('<thead></thead>');
                        
                        if (_config.tblLabels.header.groups !== undefined) {
                            colHeaderGroups = _headerRow(_config.tblLabels.header.groups);
                            tblHead.append(colHeaderGroups);
                        }
                        
                        if (_config.tblLabels.header.labels !== undefined) {
                            colHeaders = _headerRow(_config.tblLabels.header.labels);
                            tblHead.append(colHeaders);
                        }
                        
                        table.append(tblHead);
                    }
                    
                    if (_config.tblLabels.footer !== undefined) {
                        tblFoot = $('<tfoot></tfoot>');
                        
                        if (_config.tblLabels.footer.labels !== undefined) {
                            colFooters = _headerRow(_config.tblLabels.footer.labels);
                            tblFoot.append(colFooters);
                        }
                        
                        if (_config.tblLabels.footer.groups !== undefined) {
                            colFooterGroups = _headerRow(_config.tblLabels.footer.groups);
                            tblFoot.append(colFooterGroups);
                        }
                        
                        table.append(tblFoot);
                    }
                }
                
                return table;
            };
            
            var _buildExpandedRow = function(trID, trClass, inputObj) {
                var i, j, tr, td, tdKEY, tdVAL, mainTR, mainTD, properties, propertiesTable, table, dataTable, colHeaders, colHeader, tblHead, tblBody, evenOdd, evenOddClass;
                
                mainTR = $('<tr></tr>').attr({
                    'id': 'expand_'+trID[0]
                }).addClass('expand').addClass(trClass);
                mainTD = $('<td></td>').attr({
                    'colspan': _countTableColumns()
                }).addClass('sorting_1');
                
                for (j=0;j<inputObj.length;j++) {
                    // Building properties table - start
                    if (inputObj[j][0] == 'properties' && inputObj[j][1]) {
                        properties = inputObj[j][1];
                        propertiesTable = $('<table></table>').attr({
                            cellpadding: '0',
                            cellspacing: '1'
                        }).addClass('expTable');
                        
                        for (i=0;i<properties.length;i++) {
                            tr = $('<tr></tr>');
                            tdKEY = $('<td></td>').addClass('orKEYS').html(properties[i][0]);
                            tdVAL = $('<td></td>').addClass('orVALS').html(properties[i][1]);
                            tr.append(tdKEY).append(tdVAL);
                            propertiesTable.append(tr);
                        }
                        mainTD.append(propertiesTable);
                    }
                    // Building properties table - finish
                    
                    // Adding custom html
                    else if (inputObj[j][0] == 'html' && inputObj[j][1]) mainTD.append(inputObj[j][1]);
                    
                    // Building data table - start
                    else if (inputObj[j][0] == 'table' && inputObj[j][1]) {
                        table = inputObj[j][1];
                        dataTable = $('<table></table>').attr({
                            id: 'expandDataTable_'+trID[0],
                            cellpadding: '0',
                            cellspacing: '1'
                        }).addClass('display').addClass('expandDataTable').css('margin-bottom','10px');
                        colHeaders = $('<tr></tr>');
                        for (i=0;i<table.tblLabels.length;i++) {
                            colHeader = $('<th></th>').html(table.tblLabels[i]);
                            colHeaders.append(colHeader);
                        }
                        //var colFooters = colHeaders.clone();
                        tblHead = $('<thead></thead>').append(colHeaders);
                        tblBody = $('<tbody></tbody>');
                        
                        evenOdd = 3;
                        for (i=0;i<table.tblData.length;i++) {
                            if ((evenOdd % 2) == 1) evenOddClass = 'odd';
                            else evenOddClass = 'even';
                            tr = $('<tr></tr>').addClass(evenOddClass).addClass('gradeU');
                            for (j=0;j<table.tblData[i].length;j++) {
                                tr.append($('<td></td>').addClass('expDataTableTd').html(table.tblData[i][j]));
                            }
                            tblBody.append(tr);
                            evenOdd++;
                        }
                        
                        dataTable.append(tblHead);
                        dataTable.append(tblBody);
                        
                        mainTD.append(dataTable);
                    }
                    // Building data table - finish
                    
                    // Setting up charts div - start
                    else if (inputObj[j][0] == 'charts' && inputObj[j][1]) {
                        mainTD.append($('<div></div>').css('width','100%').attr('id','chartExpandSlot_'+trID[0]));
                    }
                    // Setting up charts div - finish
                }
                
                mainTR.append(mainTD);
                
                return mainTR;
            };
            
            var _givPlus = function(iteration) {
                return '<img id="tablePlus_'+iteration+'" class="tablePlus" src="'+_tablePlus+'" />';
            };
            
            var _expandClick = function(dTable) {
                var trID, inputObj, isNotCurrent;
                
                $('.rExpand').unbind();
                $('.rExpand').click(function(){
                    trID = dTable.fnGetPosition( this );
                    if (_config.multipleER) {
                        if ($('#expand_'+trID[0]).length === 0) {
                            $('#tablePlus_'+trID[0]).attr('src', _tableMinus);
                            // Create row
                            inputObj = _config.fnERContent(trID[0]);
                            $(this).parent().after(_buildExpandedRow(trID, $(this).parent().attr('class'), inputObj));
                            _config.fnERContentPostProcess(trID[0], inputObj);
                        }
                        else {
                            _config.fnERClose(trID[0]);
                            $('#tablePlus_'+trID[0]).attr('src', _tablePlus);
                            $('#expand_'+trID[0]).remove();
                        }
                    }
                    else {
                        // Close other
                        isNotCurrent = ($('#expand_'+trID[0]).length === 0);
                        $('.expand').remove();
                        $('.tablePlus').attr('src', _tablePlus);
                        
                        // Open current
                        if (isNotCurrent) {
                            $(this).children('.tablePlus').attr('src', _tableMinus);
                            inputObj = _config.fnERContent(trID[0]);
                            $(this).parent().after(_buildExpandedRow(trID, $(this).parent().attr('class'), inputObj));
                            _config.fnERContentPostProcess(trID[0], inputObj);
                        }
                        else {
                            _config.fnERClose(trID[0]);
                        }
                    }
                });
            };
            
            var _calculateTableHeight = function() {
                return $(window).height()-370;
            };
            
            var _updateTableFooterSums = function(elCnt) {
                var i, j, labelsSums, th, sum;
            
                labelsSums = [];
                
                for (i=0; i<_config.tblLabels.footer.labels.length;i++) {
                    if (_config.tblLabels.footer.labels[i][0] == '=SUM') {
                        if (_config.tblLabels.footer.labels[i][3] === undefined || _config.tblLabels.footer.labels[i][3] === false) {
                            labelsSums.push([i,i]);
                        } else {
                            labelsSums.push([i,_config.tblLabels.footer.labels[i][3]]);
                        }
                    }
                }
                
                for (i=0;i<labelsSums.length;i++) {
                    th = $('#dataTable_'+elCnt+' tfoot tr').first().children().eq(labelsSums[i][0]);
                    sum = 0;
                    for (j=0;j<_config.items.length;j++) {
                        sum = (sum + parseInt(_config.items[j][labelsSums[i][1]], 10));
                    }
                    th.text(sum);
                }
            };
            
            var _addPlusRowEmptyLabel = function() {
                if (_isSimpleHeaders()) {
                    _config.tblLabels = $.merge([''], _config.tblLabels);
                } else {
                    // Add empty label to header
                    if (_config.tblLabels.header.groups !== undefined) {
                        _config.tblLabels.header.groups = $.merge([['',2,0]],_config.tblLabels.header.groups);
                    } else {
                        _config.tblLabels.header.labels = $.merge([['',0,0]],_config.tblLabels.header.labels);
                    }
                    
                    // Add empty label to footer
                    if (_config.tblLabels.footer.labels !== undefined) {
                        _config.tblLabels.footer.labels = $.merge([['',2,0]],_config.tblLabels.footer.labels);
                    } else {
                        _config.tblLabels.footer.groups = $.merge([['',0,0]],_config.tblLabels.footer.groups);
                    }
                }
            };
            
            var i, tableColumnsCount, elCnt, dTable, dTablesArr, dTableOptions, bSort, aaSorting;
            
            if (settings) $.extend(_config, settings);
            if (!_isSimpleHeaders()) _config.tblLabels = settings.tblLabels();
            
            if (_config.expandableRows) {
                // Adding first column with + sign
                // Setting up column settings if they are not exists
                if (!_config.dataTable.aoColumns) {
                    _config.dataTable.aoColumns = [];
                    tableColumnsCount = _countTableColumns();
                    for (i=0;i<tableColumnsCount;i++) {
                        _config.dataTable.aoColumns.push(null);
                    }
                }
                // Adding empty column label
                _addPlusRowEmptyLabel();
                //alert( _config.tblLabels.header.groups + "\n" + _config.tblLabels.footer.labels );
                
                // Adding PLUS image to every row
                for (i=0; i<_config.items.length; i++) {
                    _config.items[i] = $.merge([_givPlus(i)], _config.items[i]);
                }
                
                // Setting up PLUS column
                _config.dataTable.aoColumns = $.merge([{ 
                    sWidth:'10px',
                    bSortable:false, 
                    sClass:'rExpand'
                }],_config.dataTable.aoColumns);
            }
            
            elCnt = 0;
            dTablesArr = [];
            this.each(function() {
		        dTable = _config.dTable[elCnt];
                if (!dTable) {
                    bSort = true;
                    if (_config.sorting === false) {
                        aaSorting = [[0,'asc']];
                        bSort = false;
                    }
                    else aaSorting = [[_config.sorting[0],_config.sorting[1]]];
                    $(this).empty().append(_buildTable(elCnt));
                    
                    dTableOptions = {
					        "bJQueryUI": false,
					        "sPaginationType": "full_numbers",
					        "bAutoWidth":false,
					        "bSortClasses": true,
					        "bDeferRender": true,
					        "bSort": bSort,
					        "aaSorting": aaSorting
		            };
                    
                    dTable = $('#dataTable_'+elCnt).dataTable( $.extend(dTableOptions,_config.dataTable));
		        }
		        else {
		            if (!_isSimpleHeaders()) _updateTableFooterSums(elCnt);
		            dTable.fnClearTable();
		        }
		        dTable.fnAddData(_config.items);
		        dTablesArr.push(dTable);
		        
		        // Setting up table events
		        if (_config.dataTable.sPaginationType) {
                    $('#dataTable_'+elCnt+' thead tr,#dataTable_'+elCnt+'_next,#dataTable_'+elCnt+'_previous,#dataTable_'+elCnt+'_first,#dataTable_'+elCnt+'_last').click( function() { _config.fnContentChange(this); if (_config.expandableRows) _expandClick(dTable); } );
                    $('#dataTable_'+elCnt+'_paginate input,#dataTable_'+elCnt+'_filter input').keyup( function() { _config.fnContentChange(this); if (_config.expandableRows) _expandClick(dTable); } );
                    $('#dataTable_'+elCnt+'_length select').change( function() { _config.fnContentChange(this); if (_config.expandableRows) _expandClick(dTable); } );
                }
                if (_config.expandableRows) _expandClick(dTable);
                $('.tblSort').click( function() { _config.fnTableSorting(this); } );
                
                elCnt++;
            });
            
            return dTablesArr;
        }
    };
    
    $.fn.lkfw_dataTable = function( method ) {
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.lkfw.datatables' );
        }   
    };
})(jQuery);
