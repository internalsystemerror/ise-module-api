(function ($, document, window, undefined) {
    
    'use strict';
    
    var $document = $(document), $window = $(window), notifications = {
        show: {
            duration: 'slow',
            delay: 500
        },
        hide: {
            duration: 'slow',
            delay: 5000
        }
    }, eventNames = {
        ready: 'ise:ready',
        load: 'ise:load'
    }, selectors = {
        modal: '.modal',
        alert: '.alert-notifications .alert'
    };
    
    /**
     * Initialise
     */
    function initialise() {
        $document.on(eventNames.ready, iseReady);
    }
    
    /**
     * Custom ready event
     */
    function iseReady() {
        $(selectors.modal).on('hidden.bs.modal', hideModal);
        $(selectors.alert).notification();
    }
    
    /**
     * Hide modal
     */
    function hideModal() {
        var href = $(selectors.cancel, this).attr('data-href');
        if (href) {
            window.location.href;
        }
    }
    
    // Initialise
    initialise();
    
})(jQuery, document, window);