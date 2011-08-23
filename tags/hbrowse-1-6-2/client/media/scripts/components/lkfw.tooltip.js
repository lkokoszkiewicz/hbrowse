(function( $ ){
    $.fn.lkfw_tooltip = function(settings) {
        var _config = {
            'content': {},
            'take':'none', // id | class | html | none
            'delay':1000,
            'classDist':'',
            'fadeIn':200,
            'fadeOut':100,
            'place':'top',
            'clickable':false,
            'posShift':[0,0],
            'css':{}
        };
        
        var overTooltip = false;
        var offTimeoutID, onTimeoutID;
        
        var _drawTooltip = function(el) {
            var scroll, offset, height, top, left, posShift, tTipConfig;
        
            try {
                scroll = $(document).scrollTop();
                offset = $(el).offset();
                height = $(el).height();
                
                // Choosing right content for the tip
                if (_config.take == 'none') tTipConfig = {};
                else if (_config.take == 'html') tTipConfig = _config.content[$(el).html()];
                else tTipConfig = _config.content[$(el).attr(_config.take)];
                
                var mainDiv = $('<div></div>').css({
                    'display':'none',
                    'position':'fixed',
                    'top':(offset.top-scroll)+'px',
                    'left':offset.left+'px',
                    'z-index':'15000'
                }).addClass('lkfw_tooltip'+_config.classDist).attr('id','lkfw_tooltip');
                
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
                
                top = parseInt(mainDiv.css('top').replace('px',''), 10);
                left = parseInt(mainDiv.css('left').replace('px',''), 10);
                posShift = {'top':0,'left':0};
                
                if (tTipConfig.posShift !== undefined) {
                    posShift.top = tTipConfig.posShift[0];
                    posShift.left = tTipConfig.posShift[1];
                } else {
                    posShift.top = _config.posShift[0];
                    posShift.left = _config.posShift[1];
                }
                
                if (_config.place == 'bottom') {
                    top = (top+parseInt($(el).height(), 10)+8) + posShift.top;
                    left = left+posShift.left;
                    
                } else {
                    top = (top-parseInt(mainDiv.height(), 10)-13) + posShift.top;
                    left = left+posShift.left;
                }
                
                mainDiv.css({
                    'top':top+'px',
                    'left':left+'px'
                });
                
                return mainDiv;
            } catch(err) {  }
        };
        
        var _displayTooltip = function(mainDiv) {
            //mainDiv.delay(_config.delay).fadeIn(_config.fadeIn);
            if (_config.delay === 0) {
                mainDiv.fadeIn(_config.fadeIn);
            } else if (_config.delay >= 0) {
                onTimeoutID = setTimeout(function(){
                    mainDiv.fadeIn(_config.fadeIn);
                }, _config.delay);
            }
            
            if (_config.clickable) {
                mainDiv.hover(function(){overTooltip = true;},function(){
                    if (overTooltip === true) {
                        $('.lkfw_tooltip'+_config.classDist).fadeOut(_config.fadeOut,function(){$('.lkfw_tooltip'+_config.classDist).detach();});
                    }
                    overTooltip = false;
                });
            }
        };
        
        if (settings) $.extend(_config, settings);
        
        this.each(function() {
            $(this).unbind('mouseenter mouseleave');
            $(this).hover(function(){
                var mainDiv;
                
                clearTimeout(offTimeoutID);
                
                mainDiv = _drawTooltip(this);
                
                _displayTooltip(mainDiv);
            },function(){
                var timeout = 0;
                
                clearTimeout(onTimeoutID);
                
                if (_config.clickable) timeout = 800;
                
                offTimeoutID = setTimeout(function(){
                    if (overTooltip === false) {
                        $('.lkfw_tooltip'+_config.classDist).fadeOut(_config.fadeOut,function(){$('.lkfw_tooltip'+_config.classDist).detach();});
                    }
                }, timeout);
            });
        });
    };
})( jQuery );
