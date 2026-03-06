#!/usr/bin/env node

const HookHandler = require('../../lib/hook-handler');

async function main() {
  const handler = new HookHandler();
  await handler.initialize();
  const hookData = await handler.readStdin();
  const toolName = hookData.tool_use?.name;
  const sessionId = hookData.session_id || 'default';

  if (toolName === 'ExitPlanMode') {
    handler.sendNotification('plan_ready', sessionId);
  } else if (toolName === 'AskUserQuestion') {
    handler.sendNotification('question', sessionId);
  }
}

main();
