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
        },
        selectors: {
            notifications: '.alert-notifications',
            container: 'main'
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
            var that = this, $notifications = $document.find(this.options.selectors.notifications);
            if ($notifications.length < 1) {
                $notifications = $('<div class="alert-notifications"><div class="container-fluid"></div></div>');
                $document.find(this.options.selectors.container).prepend($notifications);
            }
            if (!$notifications.has(this.$element)) {
                $notifications.find('.container-fluid').prepend(this.$element);
            }
            
            this.$element.addClass('col-sm-3 col-sm-offset-9 col-lg-2 col-lg-offset-10').delay(this.options.show.delay).fadeIn(
                this.options.show.duration,
                function () {
                    that.hide();
                }
            ).hover(function () {
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