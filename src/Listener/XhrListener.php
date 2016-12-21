<?php

namespace IseApi\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Mvc\MvcEvent;

class XhrListener implements ListenerAggregateInterface
{

    /**
     * @var array
     */
    protected $listeners = [];

    /**
     * {@inheritDoc}
     */
    public function attach(EventManagerInterface $eventManager)
    {
        $this->listeners[] = $eventManager->attach(MvcEvent::EVENT_DISPATCH, [$this, 'setXhrRequest'], -100);
    }

    /**
     * {@inheritDoc}
     */
    public function detach(EventManagerInterface $eventManager)
    {
        foreach ($this->listeners as $index => $listener) {
            if ($eventManager->detach($listener)) {
                unset($this->listeners[$index]);
            }
        }
    }

    /**
     * Check for XmlHttpRequest
     *
     * @param EventInterface $event
     */
    public function check(EventInterface $event)
    {
        if ($event->getResult() instanceof ViewModel) {
            if ($event->getRequest()->isXmlHttpRequest()) {
                $event->getResult()->setTerminal(true);
                $event->setViewModel($event->getResult());
            }
        }
    }
}
