(function ($, document, window, undefined) {

    'use strict';
    
    if (window.history.pushState === undefined) {
        return;
    }

    var instance = null, $document = $(document), $window = $(window), eventNames = {
        ready: 'ise:ready',
        load: 'ise:load'
    }, defaults = {
        developerMode: true,
        classes: {
            active: 'active'
        },
        templates: {
            loadingIcon: '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>',
            loadingText: '... loading ...'
        },
        selectors: {
            body: 'body',
            wrapper: 'body > .container-fluid',
            container: 'main',
            links: '[href^="/"]:not(.no-ajax)',
            form: 'form:not(.no-ajax)',
            submit: '[type="submit"]',
            navbar: '#isebootstrap-navbar',
            dropdown: '[data-toggle="dropdown"]',
            modal: '.modal',
            modalDismiss: '[data-href][data-dismiss="modal"]',
            modalBackdrop: '.modal-backdrop',
            table: '.table'
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
        this.skipPop = false;
        this.isModal = false;

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
            
            // Bind click event to links
            $document.on('click', this.options.selectors.links, function (event) {
                that.linkClicked(event, $(this));
            });
            
            // Create ready functionality
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
            
            // Create history functionality
            window.history.replaceState({}, document.title, window.location.href);
            $window.on('popstate', function (event) {
                if (event.originalEvent.state !== null) {
                    that.abort();
                    that.goBackToUrl(window.location.href);
                }
            });
        },
        abort: function () {
            if (this.currentXhr === null) {
                return;
            }
            this.currentXhr.abort();
            this.currentXhr = null;
            this.skipPop = false;
            this.isModal = false;
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
            this.ajaxRequest(url, 'POST', data).done(function (data, status, xhr) {
                if (status !== 'success') {
                    return;
                }
                
                // Check for URL change
                var path = xhr.getResponseHeader('X-Path'), $modal = $link.closest('.modal');
                if (path) {
                    url = that.cleanUrl(path);
                }
                
                // Check for modal
                if ($modal.length > 0) {
                    that.hiddenModal($modal);
                }
                
                // New URL loaded
                that.urlLoaded(url, $(data), $link);
            });
        },
        /**
         * Push a new URL into the history
         */
        pushUrlToHistory: function (url) {
            window.history.pushState({}, document.title, url);
        },
        /**
         * Show modal
         */
        showModal: function ($data, $link) {
            if ($link !== undefined) {
                this.setLinkLoaded($link);
            }
            this.isModal = true;
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
            if (this.isModal && url === window.history.previous) {
                this.skipPop = true;
                window.history.back();
                return;
            }
            
            this.navigateToNewUrl(url);
        },
        /**
         * Hidden modal
         */
        hiddenModal: function ($modal) {
            $modal.remove();
            $document.find(this.options.selectors.body).removeClass('modal-open');
            $document.find(this.options.selectors.modalBackdrop).remove();
        },
        /**
         * Navigate to a new URL
         */
        navigateToNewUrl: function (url, $link) {
            var that = this;
            this.ajaxRequest(url, 'GET').done(function (data, status, xhr) {
                if (status !== 'success') {
                    return;
                }
                
                // Check for path change
                var path = xhr.getResponseHeader('X-Path');
                if (path) {
                    url = that.cleanUrl(path);
                }
                
                // New URL loaded
                that.urlLoaded(url, $(data), $link);
            });
        },
        /**
         * Go back to a previous URL
         */
        goBackToUrl: function (url) {
            // Shall we skip the pop request?
            if (this.skipPop) {
                this.skipPop = false;
                return;
            }
            
            // Make request for a new page
            var that = this;
            this.ajaxRequest(url, 'GET').done(function (data, status, xhr) {
                if (status !== 'success') {
                    return;
                }
                // Check for path change
                var path = xhr.getResponseHeader('X-Path');
                if (path) {
                    url = that.cleanUrl(path);
                }
                
                // New URL loaded
                that.urlLoaded(url, $(data));
            });
        },
        /**
         * Ajax request
         */
        ajaxRequest: function (url, method, data) {
            var that = this;
            this.currentXhr = $.ajax({
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
                that.urlFailed(url, error, xhr);
            }).always(function(data, status, xhr) {
                that.currentXhr = null;
            });
            return this.currentXhr;
        },
        /**
         * URL has loaded
         */
        urlLoaded: function (url, $data, $link) {
            if (url === window.location.href) {
                // No animation
                this.replaceContainerContent(url, $data, $link);
                return;
            }
            
            // Update URL
            this.pushUrlToHistory(url);
            
            // If is modal set new content without animation
            if (this.isModal === true) {
                this.isModal = false;
                this.replaceContainerContent(url, $data, $link);
                return;
            }
            
            // Check for new modal and show
            if ($data.is(this.options.selectors.modal)) {
                this.showModal($data, $link);
                return;
            }
            
            // Begin animating
            var that = this, $toFade = $(this.options.selectors.wrapper);
            $toFade.fadeOut('fast', function () {
                
                // Set new content
                that.replaceContainerContent(url, $data, $link);
                
                // Finish animation
                $toFade.fadeIn('fast');
            });
        },
        /**
         * Set new container content
         */
        replaceContainerContent: function (url, $data, $link) {
            // Remove any old modal backdrops
            $document.find(this.options.selectors.modalBackdrop).fadeOut('fast', function () {
                $(this).remove();
            });
            
            // Emtpy contain and add new content
            this.$container.html($data);
            
            // Trigger load events
            $document.trigger(eventNames.ready);
            $window.trigger(eventNames.load);
            
            // Update links
            if ($link !== undefined) {
                this.updateActiveLinks(url);
                this.setLinkLoaded($link);
            }
        },
        /**
         * URL has failed to load
         */
        urlFailed: function (url, error, xhr) {
            var $alert = $.alert({
                type: 'danger',
                icon: 'warning-sign',
                message: 'Unable to retrieve that page. The error given was "' + error + '".'
            });
            if (this.options.developerMode && xhr.responseText) {
                this.developerBypass(url, xhr);
                return;
            }
            
            $alert.notification();
        },
        /**
         * Developer bypass
         */
        developerBypass: function (url, xhr) {
            var that = this, $response = $(xhr.responseText), $data = $response.find(this.options.selectors.container), $retry = $('<a class="btn btn-primary pull-right" href="#"><span class="glyphicon glyphicon-refresh"></span> Retry</a>'), $wrapper = $('<div></div>');
            if ($data.length < 1) {
                $data = $response;
            }
            $retry.on('click', function (event) {
                that.linkClicked(event, $(this));
            });
            $wrapper.append($retry, $data);
            
            // New URL loaded
            this.urlLoaded(url, $wrapper);
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
            
            if ($link.is('input')) {
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
            if ($link.closest(this.options.selectors.table).length > 0) {
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
            if (!data) {
                return;
            }
            
            if ($link.is(this.options.selectors.submit)) {
                $link.val(data);
                return;
            }
            
            $link.html(data);
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