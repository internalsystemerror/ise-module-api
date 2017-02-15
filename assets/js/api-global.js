(function ($, document, window, undefined) {
    
    'use strict';
    
    var $document = $(document), $window = $(window);
    
    /**
     * Initialise
     */
    function initialise() {
        $document.ready(documentReady).on('ise:ready', iseReady);
    }
    
    /**
     * One time window load event
     */
    function documentReady() {
        $document.ajaxify();
    }
    
    /**
     * Custom ready event
     */
    function iseReady() {
    }
    
    // Initialise
    initialise();
    
})(jQuery, document, window);