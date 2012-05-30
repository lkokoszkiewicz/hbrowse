jQuery.fn.dataTableExt.oSort['numeric-float-asc']  = function(a,b) {
    var x, y;
    
    x = a.substring(a.indexOf(".") + 1, a.length);
    y = b.substring(b.indexOf(".") + 1, b.length);
    x = parseInt( x, 10 );
    y = parseInt( y, 10 );
    
    return ((x < y) ? -1 : ((x > y) ?  1 : 0));
};

jQuery.fn.dataTableExt.oSort['numeric-float-desc'] = function(a,b) {
    var x, y;
    
    x = a.substring(a.indexOf(".") + 1, a.length);
    y = b.substring(b.indexOf(".") + 1, b.length);
    x = parseInt( x, 10 );
    y = parseInt( y, 10 );

    return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};

jQuery.fn.dataTableExt.oSort['integer-in-tag-asc']  = function(a,b) {
    var x, y, startIndexA, endIndexA, startIndexB, endIndexB;
    
    x = 0;
    y = 0;
    
    if(a.indexOf('>') > -1)
    {
        startIndexA = a.indexOf('>') + 1;
        endIndexA = a.indexOf('</');
        x = a.substring(startIndexA, endIndexA);
        x = parseInt(x, 10);
    }
    else
    {
        x = parseInt(a, 10);
    }

    if(b.indexOf('>') > -1)
    {
        startIndexB = b.indexOf('>') + 1;
        endIndexB = b.indexOf('</');
        y = b.substring(startIndexB, endIndexB);
        y = parseInt(y, 10);
    }
    else
    {
        y = parseInt(b, 10);
    }
    
    return ((x < y) ? -1 : ((x > y) ?  1 : 0));
};

jQuery.fn.dataTableExt.oSort['integer-in-tag-desc'] = function(a,b) {
    var x, y, startIndexA, endIndexA, startIndexB, endIndexB;
    
    x = 0;
    y = 0;
    
    if(a.indexOf('>') > -1)
    {
        startIndexA = a.indexOf('>') + 1;
        endIndexA = a.indexOf('</');
        x = a.substring(startIndexA, endIndexA);
        x = parseInt(x, 10);
    }
    else
    {
        x = parseInt(a, 10);
    }

    if(b.indexOf('>') > -1)
    {
        startIndexB = b.indexOf('>') + 1;
        endIndexB = b.indexOf('</');
        y = b.substring(startIndexB, endIndexB);
        y = parseInt(y, 10);
    }
    else
    {
        y = parseInt(b, 10);
    }

    return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};
