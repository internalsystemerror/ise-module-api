(function ($, document, window, undefined) {

    'use strict';

    var instance = null, $document = $(document), $window = $(window), defaults = {
        classes: {
            active: 'active'
        },
        templates: {
            loadingIcon: '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>',
            loadingText: '... loading ...'
        },
        selectors: {
            wrapper: 'body > .container-fluid',
            container: 'main',
            links: '[href^="/"]',
            navbar: '#isebootstrap-navbar',
            dropdown: '[data-toggle="dropdown"]',
            modal: '.modal'
        }
    };

    /**
     * Plugin constructor
     */
    function Ajaxify(options) {
        this._defaults = defaults;
        this.options = $.extend(true, {}, defaults, options);

        this.init();
    }

    /**
     * Plugin body
     */
    Ajaxify.prototype = {
        /**
         * Initialise the plugin
         */
        init: function () {
            var that = this;

            this.$navbar = $document.find(this.options.selectors.navbar);
            this.$container = $document.find(this.options.selectors.container);
            $document.on('click', this.options.selectors.links, function (event) {
                that.linkClicked(event, $(this));
            });
            $window.on('popstate', function (event) {
                if (event.originalEvent.state !== null) {
                    that.goBackToUrl(window.location.href);
                }
            });
            $(this.options.selectors.modal).on('hide.bs.modal', function () {
                that.hideModal($(this));
            });
        },
        /**
         * A link has been clicked
         */
        linkClicked: function (event, $link) {
            var url = $link.prop('href');

            if (window.location.href !== url) {
                this.setLinkLoading($link);
                this.navigateToNewUrl(url, $link);
            }
            event.preventDefault();
        },
        /**
         * Show modal
         */
        showModal: function ($data, $link) {
            var that = this;
            $data.modal().on('hide.bs.modal', function () {
                that.hideModal($(this));
            });
            if ($link !== undefined) {
                this.setLinkLoaded($link);
            }
            this.$container.append($data);
            return;
        },
        /**
         * Hide modal
         */
        hideModal: function ($modal)
        {
            // Get cancel button
            var $cancel = $modal.find('[data-href][data-dismiss="modal"]'), a = $('<a>');

            // Get url
            a.attr('href', $cancel.attr('data-href'));
            $cancel.attr('data-href', '');
            var url = a.prop('href');

            if (url === window.location.href) {
                $modal.on('hidden.bs.modal', function () {
                    $modal.remove();
                });
                return;
            }

            this.navigateToNewUrl(url);
        },
        /**
         * Navigate to a new URL
         */
        navigateToNewUrl: function (url, $link) {
            var that = this;
            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'html'
            }).done(function (data) {
                var $data = $(data);
                if ($data.hasClass('modal')) {
                    that.showModal($data, $link);
                    return;
                }
                window.history.pushState({}, '', url);
                that.urlLoaded(data, $link);
                that.updateActiveLinks(url);
            }).fail(function (xhr, status, error) {
                that.urlFailed(error);
                that.setLinkLoaded($link);
            });
        },
        /**
         * Go back to a previous URL
         */
        goBackToUrl: function (url) {
            var that = this;
            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'html'
            }).done(function (data) {
                that.urlLoaded(data);
                that.updateActiveLinks(url);
            }).fail(function (xhr, status, error) {
                that.urlFailed(error);
                that.setLinkLoaded($link);
            });
        },
        /**
         * URL has loaded
         */
        urlLoaded: function (data, $link) {
            var that = this, $toFade = $(this.options.selectors.wrapper);

            $toFade.fadeOut('fast', function () {
                that.$container.html(data);
                $document.trigger('ise:ready');
                $window.trigger('ise:load');
                $toFade.fadeIn('fast');
                if ($link !== undefined) {
                    that.setLinkLoaded($link);
                }
            });
        },
        /**
         * Update active status of links
         */
        updateActiveLinks: function (url) {
            var that = this;
            if (this.$navbar.length < 1) {
                return;
            }
            this.$navbar.find(this.options.selectors.links).each(function () {
                var $this = $(this), li = $this.parent('li');
                if ($this.prop('href') === url) {
                    li.addClass(that.options.classes.active);
                } else if (li.hasClass(that.options.classes.active)) {
                    li.removeClass(that.options.classes.active);
                }
            });
        },
        /**
         * Set loading status on link
         */
        setLinkLoading: function ($link) {
            $link.data('originalTitle', $link.html());

            // Buttons in tables
            if ($link.closest('.data-table').length > 0) {
                $link.html(this.options.templates.loadingIcon);
                return;
            }

            // Other buttons / navbar links
            if ($link.hasClass('btn') || (this.$navbar.length > 0 && this.$navbar.has($link))) {
                $link.html([
                    this.options.templates.loadingIcon,
                    this.options.templates.loadingText
                ].join(' '));
                return;
            }

            // Normal links
            $link.html(this.options.templates.loadingText);
        },
        /**
         * Clear loading status on link
         */
        setLinkLoaded: function ($link) {
            var data = $link.data('originalTitle');
            if (data) {
                $link.html(data);
            }
        }
    };

    // Prevent multiple instantiations
    $.fn.ajaxify = function (options) {
        if (instance === null) {
            instance = new Ajaxify(options);
        }
        return instance;
    };

})(jQuery, document, window);