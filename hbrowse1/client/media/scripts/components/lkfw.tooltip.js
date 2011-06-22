(function( $ ){
    $.fn.lkfw_tooltip = function(settings) {
        var _config = {
            'content': {},
            'take':'none', // id | class | html | none
            'delay':1000,
            'fadeIn':200,
            'fadeOut':100,
            'place':'top',
            'clickable':false,
            'posShift':[0,0],
            'css':{}
        };
        
        var overTooltip = false;
        var clockTimeoutID;
        
        var _drawTooltip = function(el) {
            try {
                var scroll = $(document).scrollTop();
                var offset = $(el).offset();
                var height = $(el).height();
                
                // Choosing right content for the tip
                if (_config.take == 'none') var tTipConfig = {};
                else if (_config.take == 'html') var tTipConfig = _config.content[$(el).html()];
                else var tTipConfig = _config.content[$(el).attr(_config.take)];
                
                var mainDiv = $('<div></div>').css({
                    'display':'none',
                    'position':'fixed',
                    'top':(offset.top-scroll)+'px',
                    'left':offset.left+'px',
                    'z-index':'15000'
                }).addClass('lkfw_tooltip').attr('id','lkfw_tooltip');
                
                if (tTipConfig.css !== undefined) {
                    mainDiv.css(tTipConfig.css);
                } else {
                    mainDiv.css(_config.css);
                }
                
                if (tTipConfig.html !== undefined) {
                    mainDiv.html(tTipConfig.html);
                } else {
                    mainDiv.html($(el).attr('title'));
                }
                
                $('body').append(mainDiv);
                
                var top = parseInt(mainDiv.css('top').replace('px',''));
                var left = parseInt(mainDiv.css('left').replace('px',''))
                var posShift = {'top':0,'left':0};
                if (tTipConfig.posShift !== undefined) {
                    posShift.top = tTipConfig.posShift[0];
                    posShift.left = tTipConfig.posShift[1];
                } else {
                    posShift.top = _config.posShift[0];
                    posShift.left = _config.posShift[1];
                }
                
                if (_config.place == 'bottom') {
                    top = (top+parseInt($(el).height())+8) + posShift.top;
                    left = left+posShift.left;
                    
                } else {
                    top = (top-parseInt(mainDiv.height())-13) + posShift.top;
                    left = left+posShift.left;
                }
                
                mainDiv.css({
                    'top':top+'px',
                    'left':left+'px'
                });
                
                mainDiv.delay(_config.delay).fadeIn(_config.fadeIn);
                
                if (_config.clickable) {
                    mainDiv.hover(function(){overTooltip = true;},function(){
                        if (overTooltip == true) {
                            $('.lkfw_tooltip').fadeOut(_config.fadeOut,function(){$('.lkfw_tooltip').detach();});
                        }
                        overTooltip = false;
                    });
                }
            } catch(err) {  }
        };
        
        if (settings) $.extend(_config, settings);
        
        this.each(function() {
            $(this).hover(function(){
                clearTimeout(clockTimeoutID);
                _drawTooltip(this);
            },function(){
                var timeout = 0;
                if (_config.clickable) timeout = 800;
                clockTimeoutID = setTimeout(function(){
                    if (overTooltip == false) {
                        $('.lkfw_tooltip').fadeOut(_config.fadeOut,function(){$('.lkfw_tooltip').detach();});
                    }
                }, timeout);
            });
        });
    };
})( jQuery );
