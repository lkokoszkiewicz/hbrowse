# Introduction #
lkfwTooltip is a jQuery plugin. It was created out of irritation caused by other tooltip plugins that did not provide a proper support for dynamic content and, for example loaded html code only from opposite divs. The following plugin gives You freedom in defining your html content inside the tooltip. Defining multiple tooltips with different settings and content is possible.

# Quick start #
It's very simple to create a simple tooltip:
```
$(/*target elements*/).lkfw_tooltip(/*config object*/);
```
So, for example:

**HTML:**
```
<th class="tblSort sorting_desc" rowspan="1" colspan="1" style="width: 200px; ">SchedulerJobId</th>
```
**Javascript:**
```
$('.tblSort').lkfw_tooltip({
    'content':{
        'SchedulerJobId':{
            'html':'Tooltip html content'
        }
    },
    'take':'html'
});
```
This declaration means: _take all elements with class .tblSort and with html content equal to "SchedulerJobID" and create tooltip for them with the content "Tooltip html content"_.

It's simple as that. That way you can create tooltips for many elements at once assigning a different content to each to them.

You can assign a different additional css to each tooltip:
```
$('.tblSort').lkfw_tooltip({
    'content':{
        'SchedulerJobId':{
            'html':'Tooltip html content',
            'posShift':[-10,0],
            'css':{
                'width':'215px'
            }
        }
    },
    'take':'html'
});
```
that way every tooltip can have different basic settings.

I'm sure you've noticed _take_ property. It tells the script what it should look for inside _content_ dictionary. So it takes (in this case) _html_ of an element and looks for a proper entry inside _content_ dictionary, simple. _Take_ can have 4 settings: **id | class | html | none**. So, for example, if you set it to _id_ it will take element _id_ and look for a _content_ dictionary entry that is equal to element _id_. The same is for _class_.

It is possible to define a tooltips without any parameters:
```
$('.class').lkfw_tooltip();
```
That way, content will be taken from title attribute. In fact, every time script will not find _html_ content for a given element it will look for a content inside _title_ attribute.

# Full config object reference #
## content (default:{}) ##
Here you can define options specific for each element tooltip:
  * **html** - Element tooltip html content
  * **posShift (default:`[0,0]`)** - You can shift an element position according to it's normal position (counted from top-left conner of the browse window).
  * **css** - You can add additional css parameters to each element tooltip.
## take (default:none) ##
It tells the script what it should look for inside _content_ dictionary. Possible values are: **id | class | html | none**
## delay (default:1000) ##
Defines (in miliseconds) how long will wait before tooltip will show up.
## fadeIn (default:200) ##
Fade in effect leangth.
## fadeOut (default:100) ##
Fade out effect leangth.
## classDist (dafault:'') ##
Adds classDist string at the end of the tooltip class name so the user could create a different styles for a different tooltips.
## place (default:top) ##
Tells the script where to place the tooltip, whether it should display at the top or at the bottom of the element. Possible values: **top | bottom**
## clickable (default:false) ##
If set to true it allows the tooltip content to be navigated. It waits about a second with tooltip fading out allowing user to put mouse over the tooltip content and, for example, click a link on it.
## posShift (default:`[0,0]`) ##
You can shift an element position according to it's normal position (counted from top-left conner of the browse window).
## css (default:{}) ##
You can add additional css parameters to all elements tooltips.