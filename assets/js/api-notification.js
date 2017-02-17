(function ($, document, window, undefined) {

    'use strict';

    var $document = $(document), $window = $(window), defaults = {
        show: {
            duration: 'slow',
            delay: 500
        },
        hide: {
            duration: 'slow',
            delay: 5000
        }
    };

    /**
     * Plugin constructor
     */
    function Notification(element, options) {
        this._defaults = defaults;
        
        this.element = element;
        this.options = $.extend(true, {}, defaults, options);

        this.$element = $(element);
        this.init();
    }

    /**
     * Plugin body
     */
    Notification.prototype = {
        /**
         * Initialise the plugin
         */
        init: function () {
            var that = this;
            this.$element.delay(this.options.show.delay).fadeIn(this.options.show.duration, function () {
                that.hide();
            }).hover(function () {
                that.hover();
            }, function () {
                that.hide();
            });
        },

        /**
         * On hover of a notification
         */
        hover: function () {
            this.$element.stop(true).show();
        },

        /**
         * Hide a notification
         */
        hide: function () {
            this.$element.delay(this.options.hide.delay).fadeOut(this.options.hide.duration);
        }
    };

    // Prevent multiple instantiations
    $.fn.notification = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_notification')) {
                $.data(this, 'plugin_notification', new Notification(this, options));
            }
        });
    };

})(jQuery, document, window);