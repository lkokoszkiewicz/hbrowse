/*
 lkfw.jquery.tooltip v0.2.0_beta (2011-10-04)

 (c) 2011 Lukasz Kokoszkiewicz

 License: GNU GPL v3 (http://www.gnu.org/licenses/gpl.html)
*/
(function( $ ){
    $.fn.lkfw_tooltip = function(settings) {
        var _config = {
            'content': {},
            'take':'none', // id | class | html | none
            'onClick':false,
            'delay':1000,
            'classDist':'',
            'fadeIn':200,
            'fadeOut':100,
            'place':'top',
            'clickable':false,
            'posShift':[0,0],
            'css':{}
        };
        
        // Flag - Indication if mouse is over sticky tooltip
        var overTooltip = false;
        
        // Timeout containters, used when tooltip appears with a delay
        var offTimeoutID, onTimeoutID;
        
        // Draw a tooltip
        var _drawTooltip = function(el) {
            var scroll, offset, height, top, left, posShift, tTipConfig;
        
            try {
                // Checking the position of the tooltiped element
                scroll = $(document).scrollTop();  // Register scroll amount
                offset = $(el).offset();  // Register element offset
                height = $(el).height();  // Register element height
                
                // Choosing right tip config
                // If `take` is not provided set config to an empty object
                if (_config.take == 'none') tTipConfig = {};
                // If `take` is html use html element content to select the right config
                else if (_config.take == 'html') tTipConfig = _config.content[$(el).html()];
                // Else take enything that was provided
                else tTipConfig = _config.content[$(el).attr(_config.take)];
                
                // Create tooltips <div>
                var mainDiv = $('<div></div>').css({
                    'display':'none',
                    'position':'fixed',
                    'top':(offset.top-scroll)+'px',
                    'left':offset.left+'px',
                    'z-index':'15000'
                }).addClass('lkfw_tooltip'+_config.classDist).attr('id','lkfw_tooltip');
                
                // Load custom css
                if (tTipConfig.css !== undefined) {
                    mainDiv.css(tTipConfig.css);
                } else {
                    mainDiv.css(_config.css);
                }
                
                // Put tips content to its <div>
                if (tTipConfig.html !== undefined) {
                    mainDiv.html(tTipConfig.html);  // Load it from config
                } else {
                    mainDiv.html($(el).data('title'));  // or from `title` attribute
                }
                
                // Add a tooltip div to the page body
                $('#lkfw_tooltip').detach();
                $('body').append(mainDiv);
                
                // Loading current tip position
                top = parseInt(mainDiv.css('top').replace('px',''), 10);
                left = parseInt(mainDiv.css('left').replace('px',''), 10);
                posShift = {'top':0,'left':0};
                
                // Calculating position shift
                if (tTipConfig.posShift !== undefined) {
                    posShift.top = tTipConfig.posShift[0];
                    posShift.left = tTipConfig.posShift[1];
                } else {
                    posShift.top = _config.posShift[0];
                    posShift.left = _config.posShift[1];
                }
                
                // Calculating tip fixed position
                if (_config.place == 'bottom') {
                    top = (top+parseInt($(el).height(), 10)+8) + posShift.top;
                    left = left+posShift.left;
                    
                } else {
                    top = (top-parseInt(mainDiv.height(), 10)-13) + posShift.top;
                    left = left+posShift.left;
                }
                
                // Setting up the tip position
                mainDiv.css({
                    'top':top+'px',
                    'left':left+'px'
                });
                
                return mainDiv;
            } catch(err) { return false; }
        };
        
        // Display a tooltip
        var _displayTooltip = function(mainDiv) {
            // Setting up show deleay if necessary
            if (_config.delay === 0) {
                mainDiv.fadeIn(_config.fadeIn);
            } else if (_config.delay >= 0) {
                onTimeoutID = setTimeout(function(){
                    mainDiv.fadeIn(_config.fadeIn);
                }, _config.delay);
            }
            
            // If tooltip is set to `clickable` setup a short hide dalay
            // to be able to put a mouse over a tip
            if (_config.clickable) {
                mainDiv.hover(function(){overTooltip = true;},function(){
                    if (overTooltip === true) {
                        $('.lkfw_tooltip'+_config.classDist).fadeOut(_config.fadeOut,function(){$('.lkfw_tooltip'+_config.classDist).detach();});
                    }
                    overTooltip = false;
                });
            }
        };
        
        var _showTooltip = function(){
            var mainDiv;
            
            clearTimeout(offTimeoutID);
            
            mainDiv = _drawTooltip(this);
            
            if (mainDiv) _displayTooltip(mainDiv);
        };
        
        var _hideTooltip = function(){
            var timeout = 0;
            
            clearTimeout(onTimeoutID);
            
            if (_config.clickable) timeout = 800;
            
            offTimeoutID = setTimeout(function(){
                if (overTooltip === false) {
                    $('.lkfw_tooltip'+_config.classDist).fadeOut(_config.fadeOut,function(){$('.lkfw_tooltip'+_config.classDist).detach();});
                }
            }, timeout);
        };
        
        if (settings) $.extend(_config, settings);
        
        this.each(function() {
            try {
                // Removing title attribute
                $(this).attr('title', function(i, title) {
                    $(this).data('title', title).removeAttr('title');
                });
            } catch(err) {/*do nothing*/}
                
            if (_config.onClick == false) {
                $(this).unbind('mouseenter mouseleave');
                $(this).hover(_showTooltip,_hideTooltip);
            } else {
                $(this).unbind('click mouseleave');
                $(this).click(_showTooltip);
                $(this).mouseleave(_hideTooltip);
            }
        });
    };
})( jQuery );
