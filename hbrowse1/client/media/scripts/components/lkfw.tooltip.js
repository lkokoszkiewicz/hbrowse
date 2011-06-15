(function( $ ){
    $.fn.lkfw_tooltip = function(settings) {
        var _config = {
            'content': {},
            'take':'id'
        };
        
        var _drawTooltip = function(el) {
            alert(_config.content[$(el).attr(_config.take)].html);
            var tTipConfig = _config.content[$(el).attr(_config.take)];
            var tTipHtml = tTipConfig.html;
            var mainDiv = $('<div></div>').css({
                'position':'absolute',
                'z-index':'1500'
            }).addClass('lkfw_tooltip').attr('id','lkfw_tooltip');
            
            if (tTipConfig.css !== undefined) {
                mainDiv.css(tTipConfig.css);
            }
            
            if (tTipConfig.html !== undefined) {
                mainDiv.html(tTipHtml);
            } else {
                mainDiv.html($(el).attr('title'));
            }
            
            $(el).append(mainDiv);
        };
        
        if (settings) $.extend(_config, settings);
        
        this.each(function() {
            //alert(';)');
            $(this).hover(function(){_drawTooltip(this);},function(){ $('.lkfw_tooltip').detach(); });
        });
    };
})( jQuery );
