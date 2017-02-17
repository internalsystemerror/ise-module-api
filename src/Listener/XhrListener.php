<?php

namespace Ise\Api\Listener;

use Zend\EventManager\EventInterface;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Http\Request;
use Zend\Mvc\MvcEvent;
use Zend\View\Model\ViewModel;

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
        $this->listeners[] = $eventManager->attach(MvcEvent::EVENT_DISPATCH, [$this, 'check']);
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
        $result  = $event->getResult();
        $request = $event->getRequest();
        if (!$result instanceof ViewModel
            || !$request instanceof Request
            || !$request->isXmlHttpRequest()) {
            return;
        }
        
        // Create wrapper
        $messages = new ViewModel();
        $messages->setTerminal(true);
        $messages->setTemplate('partial/messages');
        $messages->addChild($result, 'content');
        
        // Override defaults
        $event->setResult($messages);
        $event->setViewModel($messages);
        $event->getResponse()->getHeaders()->addHeaderLine('X-Path', $request->getRequestUri());
    }
}
