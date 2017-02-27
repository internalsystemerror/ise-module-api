<?php

namespace Ise\Api;

use Zend\EventManager\EventInterface;
use Zend\ModuleManager\Feature\BootstrapListenerInterface;
use Zend\ModuleManager\Feature\ConfigProviderInterface;

class Module implements BootstrapListenerInterface, ConfigProviderInterface
{

    /**
     * {@inheritDoc}
     */
    public function onBootstrap(EventInterface $event)
    {
        // Get event manager
        $target       = $event->getTarget();
        $eventManager = $target->getEventManager();

        $eventManager->attachAggregate(new Listener\XhrListener);
    }

    /**
     * {@inheritDoc}
     */
    public function getConfig()
    {
        return include realpath(__DIR__ . '/../config/module.config.php');
    }
}
