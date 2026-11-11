'use strict';

let callCount = 0;
const processedEvents = [];

async function handleEvent(event) {
  callCount++;
  processedEvents.push(event.id);
  console.log(`[handleEvent] processing event ${event.id} (type: ${event.type})`);
}

function getCallCount() { return callCount; }
function getProcessedEvents() { return [...processedEvents]; }
function resetCallCount() { callCount = 0; processedEvents.length = 0; }

module.exports = { handleEvent, getCallCount, getProcessedEvents, resetCallCount };
