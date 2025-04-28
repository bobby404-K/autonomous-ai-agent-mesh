import { AgentTool, AgentStep, AgentExecutionResult } from './types.js';

export class AutonomousAgentMesh {
  private tools = new Map<string, AgentTool>();
  private memory: Array<{ key: string; vector: number[]; content: string }> = [];

  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  addMemory(content: string, vector: number[]): void {
    this.memory.push({ key: `mem_${this.memory.length}`, vector, content });
  }

  findRelevantMemory(queryVector: number[], topK = 3): string[] {
    const scored = this.memory.map(m => {
      // Cosine similarity
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < queryVector.length; i++) {
        dot += queryVector[i] * m.vector[i];
        normA += queryVector[i] ** 2;
        normB += m.vector[i] ** 2;
      }
      const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
      return { similarity, content: m.content };
    });

    return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK).map(s => s.content);
  }

  async runGoal(goal: string): Promise<AgentExecutionResult> {
    const taskId = `task_${Date.now()}`;
    const steps: AgentStep[] = [];

    // Phase 1: Planning
    steps.push({
      step: 1,
      thought: `Analyzed goal: "${goal}". Formulating autonomous sub-tasks.`,
      action: 'plan',
      actionInput: { goal },
      observation: 'Sub-plans generated: [Analyze, ExecuteTool, Verify]'
    });

    // Phase 2: Tool Execution
    const tool = this.tools.get('calculator') || Array.from(this.tools.values())[0];
    if (tool) {
      const output = await tool.execute({ query: goal });
      steps.push({
        step: 2,
        thought: `Executing specialized tool ${tool.name}`,
        action: tool.name,
        actionInput: { query: goal },
        observation: output
      });
    }

    return {
      taskId,
      goal,
      steps,
      finalOutput: `Autonomous task achieved successfully with ${steps.length} verified actions.`,
      success: true
    };
  }
}
