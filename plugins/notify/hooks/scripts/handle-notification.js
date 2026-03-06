#!/usr/bin/env node

const HookHandler = require('../../lib/hook-handler');

async function main() {
  const handler = new HookHandler();
  await handler.initialize();

  const hookData = await handler.readStdin();
  const sessionId = hookData.session_id || 'default';

  if (hookData.notification_type === 'permission_prompt') {
    handler.sendNotification('question', sessionId, '需要你的授权');
  }
}

main();
