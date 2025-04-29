import assert from 'node:assert';
import test from 'node:test';
import { AutonomousAgentMesh } from '../dist/agent-mesh.js';

test('AutonomousAgentMesh matches vector memories and executes tools autonomously', async () => {
  const mesh = new AutonomousAgentMesh();
  mesh.addMemory('Vector databases improve agent context recall', [1, 0, 0]);
  mesh.addMemory('Unrelated document', [0, 1, 0]);

  const recalled = mesh.findRelevantMemory([0.9, 0.1, 0], 1);
  assert.ok(recalled[0].includes('Vector databases'));

  mesh.registerTool({
    name: 'calculator',
    description: 'math compute tool',
    execute: async (inp) => ({ answer: 42 })
  });

  const res = await mesh.runGoal('Solve equation');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.steps.length, 2);
});
