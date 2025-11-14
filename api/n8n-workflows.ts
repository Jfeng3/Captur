import type { VercelRequest, VercelResponse } from '@vercel/node';

interface N8nNode {
  type: string;
  name: string;
  position: [number, number];
  parameters?: Record<string, any>;
}

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  nodes?: N8nNode[];
  triggerType?: 'webhook' | 'chat' | 'manual' | 'schedule' | 'email' | 'form' | 'other';
  triggerName?: string;
}

/**
 * n8n Workflows API
 * Lists workflows and executes them
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { method } = req;

  try {
    if (method === 'GET') {
      // List all workflows
      const workflows = await listWorkflows();
      return res.status(200).json({ workflows });
    }

    if (method === 'POST') {
      // Execute a workflow
      const { workflowId } = req.body;

      if (!workflowId) {
        return res.status(400).json({ error: 'workflowId is required' });
      }

      const result = await executeWorkflow(workflowId);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('n8n API error:', error);
    return res.status(500).json({
      error: 'Failed to communicate with n8n',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * List all workflows from n8n instance
 */
async function listWorkflows(): Promise<N8nWorkflow[]> {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;

  if (!apiKey) {
    throw new Error('N8N_API_KEY environment variable is required');
  }

  const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list workflows: ${response.status} ${error}`);
  }

  const data = await response.json();
  const workflows = data.data || [];

  // Fetch details for each workflow to get trigger information
  const workflowsWithTriggers = await Promise.all(
    workflows.map(async (workflow: N8nWorkflow) => {
      try {
        const details = await getWorkflowDetails(workflow.id);
        const triggerInfo = identifyTriggerType(details.nodes || []);
        return {
          ...workflow,
          nodes: details.nodes,
          triggerType: triggerInfo.type,
          triggerName: triggerInfo.name,
        };
      } catch (error) {
        console.error(`Failed to get details for workflow ${workflow.id}:`, error);
        return workflow;
      }
    })
  );

  return workflowsWithTriggers;
}

/**
 * Get detailed workflow information including nodes
 */
async function getWorkflowDetails(workflowId: string) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;

  if (!apiKey) {
    throw new Error('N8N_API_KEY environment variable is required');
  }

  const response = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get workflow details: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Identify the trigger type based on workflow nodes
 */
function identifyTriggerType(nodes: N8nNode[]): { type: N8nWorkflow['triggerType'], name: string } {
  if (!nodes || nodes.length === 0) {
    return { type: 'other', name: 'Unknown' };
  }

  // Find trigger nodes (nodes that typically start workflows)
  const triggerNode = nodes.find(node => {
    const type = node.type.toLowerCase();

    // Webhook triggers
    if (type.includes('webhook')) {
      return true;
    }

    // Chat/messaging triggers
    if (type.includes('chat') || type.includes('telegram') || type.includes('slack') ||
        type.includes('discord') || type.includes('whatsapp')) {
      return true;
    }

    // Schedule triggers
    if (type.includes('schedule') || type.includes('cron') || type.includes('interval')) {
      return true;
    }

    // Email triggers
    if (type.includes('emailtrigger') || type.includes('imap')) {
      return true;
    }

    // Form triggers
    if (type.includes('form')) {
      return true;
    }

    // Manual trigger
    if (type.includes('manual') || type === 'n8n-nodes-base.manualtrigger') {
      return true;
    }

    return false;
  });

  if (!triggerNode) {
    return { type: 'other', name: 'Unknown' };
  }

  const nodeType = triggerNode.type.toLowerCase();

  // Categorize trigger type
  if (nodeType.includes('webhook')) {
    return { type: 'webhook', name: triggerNode.name };
  }

  if (nodeType.includes('chat') || nodeType.includes('telegram') ||
      nodeType.includes('slack') || nodeType.includes('discord') ||
      nodeType.includes('whatsapp')) {
    return { type: 'chat', name: triggerNode.name };
  }

  if (nodeType.includes('schedule') || nodeType.includes('cron') || nodeType.includes('interval')) {
    return { type: 'schedule', name: triggerNode.name };
  }

  if (nodeType.includes('emailtrigger') || nodeType.includes('imap')) {
    return { type: 'email', name: triggerNode.name };
  }

  if (nodeType.includes('form')) {
    return { type: 'form', name: triggerNode.name };
  }

  if (nodeType.includes('manual')) {
    return { type: 'manual', name: triggerNode.name };
  }

  return { type: 'other', name: triggerNode.name };
}

/**
 * Execute a workflow by ID
 */
async function executeWorkflow(workflowId: string) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;

  if (!apiKey) {
    throw new Error('N8N_API_KEY environment variable is required');
  }

  const response = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}/execute`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to execute workflow: ${response.status} ${error}`);
  }

  return await response.json();
}
