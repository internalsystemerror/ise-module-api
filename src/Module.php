<?php

namespace IseApi;

use Zend\EventManager\EventInterface;
use Zend\ModuleManager\Feature\ConfigProviderInterface;

class Module implements ConfigProviderInterface
{

    public function onBootstrap(EventInterface $event)
    {
        // Get event manager
        $target       = $event->getTarget();
        $eventManager = $target->getEventManager();

        $eventManager->attachAggregate(new Listener\XhrListener);
    }

    public function getConfig()
    {
        return include __DIR__ . '/../config/module.config.php';
    }
}
