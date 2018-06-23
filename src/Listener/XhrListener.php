<?php
/**
 * @copyright 2018 Internalsystemerror Limited
 */
declare(strict_types=1);

namespace Ise\Api\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Http\Request;
use Zend\Http\Response;
use Zend\Mvc\MvcEvent;
use Zend\View\Model\JsonModel;
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
    public function attach(EventManagerInterface $events, $priority = 1): void
    {
        $this->listeners[] = $events->attach(MvcEvent::EVENT_DISPATCH, [$this, 'check'], $priority);
    }

    /**
     * {@inheritDoc}
     */
    public function detach(EventManagerInterface $events): void
    {
        foreach ($this->listeners as $index => $listener) {
            $events->detach($listener);
            unset($this->listeners[$index]);
        }
    }

    /**
     * Check for XmlHttpRequest
     *
     * @param MvcEvent $event
     */
    public function check(MvcEvent $event): void
    {
        $result   = $event->getResult();
        $request  = $event->getRequest();
        $response = $event->getResponse();
        if (!$result instanceof ViewModel
            || !$request instanceof Request
            || !$request->isXmlHttpRequest()
            || $result instanceof JsonModel
            || !$response instanceof Response
        ) {
            return;
        }

        // Create wrapper
        $messages = new ViewModel;
        $messages->setTerminal(true);
        $messages->setTemplate('partial/messages');
        $messages->addChild($result, 'content');

        // Override defaults
        $event->setResult($messages);
        $event->setViewModel($messages);
        $response->getHeaders()->addHeaderLine('X-Path', $request->getUri()->toString());
    }
}
