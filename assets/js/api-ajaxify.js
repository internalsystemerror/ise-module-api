(function ($, document, window, undefined) {

    'use strict';

    var instance = null, $document = $(document), $window = $(window), eventNames = {
        ready: 'ise:ready',
        load: 'ise:load'
    }, defaults = {
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
            form: 'form',
            submit: '[type="submit"]',
            navbar: '#isebootstrap-navbar',
            dropdown: '[data-toggle="dropdown"]',
            modal: '.modal',
            modalDismiss: '[data-href][data-dismiss="modal"]',
            modalBackdrop: '.modal-backdrop'
        }
    };

    /**
     * Plugin constructor
     */
    function Ajaxify(options) {
        this._defaults = defaults;
        this.options = $.extend(true, {}, defaults, options);
        this.currentXhr = null;
        this.currentLink = null;

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
            $document.on(eventNames.ready, function () {
                $document.find(that.options.selectors.form).on('submit', function (event) {
                    that.formSubmitted(event, $(this));
                });
                $(that.options.selectors.modal).modal().on({
                    'hide.bs.modal': function () {
                        that.hideModal($(this));
                    },
                    'hidden.bs.modal': function () {
                        that.hiddenModal($(this));
                    }
                });
            });
            $window.on('popstate', function (event) {
                if (event.originalEvent.state !== null) {
                    that.abort();
                    that.goBackToUrl(window.location.href);
                }
            });
        },
        abort: function () {
            if (this.currentXhr) {
                this.currentXhr.abort();
            }
            if (this.currentLink) {
                this.setLinkLoaded(this.currentLink);
            }
        },
        /**
         * A link has been clicked
         */
        linkClicked: function (event, $link) {
            this.abort();
            
            var url = $link.prop('href');

            if (window.location.href !== url) {
                this.setLinkLoading($link);
                this.navigateToNewUrl(url, $link);
            }
            event.preventDefault();
        },
        /**
         * A form has been submitted
         */
        formSubmitted: function (event, $form) {
            this.abort();
            event.preventDefault();
            
            var that = this, url = $form.prop('action'), $link = $form.find(this.options.selectors.submit), data = $form.serialize();
            this.setLinkLoading($link);
            this.currentXhr = this.ajaxRequest(url, 'POST', data).done(function (data, status, xhr) {
                if (status !== 'success') {
                    return;
                }
                
                var path = xhr.getResponseHeader('X-Path'), $modal = $link.closest('.modal');
                if (path) {
                    url = that.cleanUrl(path);
                }
                if ($modal.length > 0) {
                    that.hiddenModal($modal);
                }
                
                window.history.pushState({}, '', url);
                that.urlLoaded(url, data, $link);
            });
        },
        /**
         * Show modal
         */
        showModal: function ($data, $link) {
            if ($link !== undefined) {
                this.setLinkLoaded($link);
            }
            this.$container.append($data);
            $document.trigger(eventNames.ready);
            $window.trigger(eventNames.load);
            return;
        },
        /**
         * Clean URL
         */
        cleanUrl: function (url) {
            var a = $('<a>');

            // Get url
            a.attr('href', url);
            return a.prop('href');
        },
        /**
         * Hide modal
         */
        hideModal: function ($modal) {
            // Get cancel button
            var $cancel = $modal.find(this.options.selectors.modalDismiss);

            // Get url
            var url = this.cleanUrl($cancel.attr('data-href'));
            $cancel.attr('data-href', '');
            if (url === window.location.href) {
                return;
            }

            this.navigateToNewUrl(url);
        },
        /**
         * Hidden modal
         */
        hiddenModal: function ($modal) {
            $modal.remove();
            $document.find(this.options.selectors.modalBackdrop).remove();
        },
        /**
         * Navigate to a new URL
         */
        navigateToNewUrl: function (url, $link) {
            var that = this;
            this.currentXhr = this.ajaxRequest(url, 'GET').done(function (data, status, xhr) {
                if (status !== 'success') {
                    return;
                }
                var path = xhr.getResponseHeader('X-Path');
                if (path) {
                    url = that.cleanUrl(path);
                }
                window.history.pushState({}, '', url);
                that.urlLoaded(url, data, $link);
            });
        },
        /**
         * Go back to a previous URL
         */
        goBackToUrl: function (url) {
            var that = this;
            this.currentXhr = this.ajaxRequest(url, 'GET').done(function (data, status, xhr) {
                if (status !== 'success') {
                    return;
                }
                var path = xhr.getResponseHeader('X-Path');
                if (path) {
                    url = that.cleanUrl(path);
                    window.history.pushState({}, '', url);
                }
                that.urlLoaded(url, data);
            });
        },
        /**
         * Ajax request
         */
        ajaxRequest: function (url, method, data) {
            var that = this;
            return $.ajax({
                url: url,
                method: method,
                data: data,
                dataType: 'html'
            }).fail(function (xhr, status, error) {
                if (status === 'abort') {
                    return;
                }
                if (that.currentLink) {
                    that.setLinkLoaded(that.currentLink);
                }
                that.urlFailed(error);
            }).always(function(data, status, xhr) {
                this.currentXhr = null;
            });
        },
        /**
         * URL has loaded
         */
        urlLoaded: function (url, data, $link) {
            var that = this, $toFade = $(this.options.selectors.wrapper), $data = $(data);
            if ($data.is(this.options.selectors.modal)) {
                that.showModal($data, $link);
                return;
            }
            $toFade.fadeOut('fast', function () {
                that.$container.html(data);
                $document.trigger(eventNames.ready);
                $window.trigger(eventNames.load);
                $document.find(that.options.selectors.modalBackdrop).fadeOut('fast', function () {
                    $(this).remove();
                });
                $toFade.fadeIn('fast');
                if ($link !== undefined) {
                    that.updateActiveLinks(url);
                    that.setLinkLoaded($link);
                }
            });
        },
        urlFailed: function (error) {
            var $alert = $.alert({
                type: 'danger',
                icon: 'warning-sign',
                message: 'Unable to retrieve that page. The error given was "' + error + '".'
            }), $notifications = this.$container.find('.alert-notifications');
            
            if ($notifications.length < 1) {
                $notifications = $('<div class="alert-notifications"><div class="container-fluid"></div></div>');
                this.$container.prepend($notifications);
            }
            
            $alert.addClass('col-sm-3 col-sm-offset-9 col-lg-2 col-lg-offset-10');
            $notifications.find('.container-fluid').prepend($alert);
            $alert.notification();
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
            this.currentLink = $link;
            
            if ($link.is(this.options.selectors.submit)) {
                $link.data('originalTitle', $link.val());
                $link.val(this.options.templates.loadingText);
                return;
            }
            
            $link.data('originalTitle', $link.html());
            $link.html(this.getLinkLoadingText($link));
        },
        /**
         * Get link loading text
         */
        getLinkLoadingText: function ($link) {
            // Buttons in tables
            if ($link.closest('.data-table').length > 0) {
                return this.options.templates.loadingIcon;
            }

            // Other buttons / navbar links
            if ($link.hasClass('btn') || (this.$navbar.length > 0 && this.$navbar.has($link))) {
                return [
                    this.options.templates.loadingIcon,
                    this.options.templates.loadingText
                ].join(' ');
            }

            // Normal links
            return this.options.templates.loadingText;
        },
        /**
         * Clear loading status on link
         */
        setLinkLoaded: function ($link) {
            this.currentLink = null;
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