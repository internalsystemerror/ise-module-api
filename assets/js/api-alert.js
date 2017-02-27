(function ($, document, window, undefined) {

    'use strict';

    var $document = $(document), $window = $(window), defaults = {
        type: 'default',
        dismissable: true,
        icon: false,
        message: ''
    };
    
    /**
     * Create an alert
     */
    function createAlert (options) {
        var $element = $('<div></div>'), settings = $.extend(true, defaults, options);
        
        $element.addClass('alert').addClass('alert-' + settings.type);
        if (settings.dismissable) {
            $element.addClass('alert-dismissable');
        }

        var icon = '';
        if (settings.icon) {
            icon = '<span class="glyphicon glyphicon-warning-sign"></span>';
        }

        $element.html(icon + settings.message);
        return $element;
    };

    // Prevent multiple instantiations
    $.alert = createAlert;

})(jQuery, document, window);