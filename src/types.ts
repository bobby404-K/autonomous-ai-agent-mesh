export interface AgentTool {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
}

export interface AgentStep {
  step: number;
  thought: string;
  action: string;
  actionInput: any;
  observation?: any;
}

export interface AgentExecutionResult {
  taskId: string;
  goal: string;
  steps: AgentStep[];
  finalOutput: string;
  success: boolean;
}
