<?php
/**
 * @copyright 2018 Internalsystemerror Limited
 */
declare(strict_types=1);

namespace Ise\Api;

use Zend\EventManager\EventInterface;
use Zend\ModuleManager\Feature\BootstrapListenerInterface;
use Zend\ModuleManager\Feature\ConfigProviderInterface;
use Zend\Mvc\Application;

class Module implements BootstrapListenerInterface, ConfigProviderInterface
{

    /**
     * {@inheritDoc}
     */
    public function onBootstrap(EventInterface $event): void
    {
        // Get event manager
        $application = $event->getTarget();
        if (!$application instanceof Application) {
            return;
        }

        $xhrListener = new Listener\XhrListener;
        $xhrListener->attach($application->getEventManager());
    }

    /**
     * {@inheritDoc}
     */
    public function getConfig(): array
    {
        return require __DIR__ . '/../config/module.config.php';
    }
}
