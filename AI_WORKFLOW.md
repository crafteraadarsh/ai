# AI Workflow

A structured pipeline for building, running, and chaining AI tasks using Claude and other models.

## Overview

This workflow covers the end-to-end lifecycle of an AI-powered feature:

```
Input → Preprocess → LLM Call → Postprocess → Output
          ↑                           ↓
       Retry / Fallback ←── Validation
```

## Stages

### 1. Input Collection
- Gather raw user input or structured data
- Validate schema and sanitize before passing to the model

### 2. Prompt Construction
- Build a system prompt with role + context
- Inject dynamic data (user info, retrieved docs, tool results)
- Keep prompts versioned in `prompts/`

### 3. LLM Execution
- Call Claude (or another model) with the constructed prompt
- Handle streaming vs. single-shot based on use case
- Log token usage and latency

### 4. Output Validation
- Parse and validate the model's response
- Retry with a refined prompt if the output fails schema checks
- Cap retries at 3 to avoid infinite loops

### 5. Post-processing
- Transform the raw output into the required format
- Trigger side effects (DB write, notification, next workflow step)

## Example: Claude API Call

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function runWorkflow(userInput) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: userInput }
    ],
  });

  return message.content[0].text;
}
```

## Multi-Step Chaining

```
Step 1: Extract intent     → structured JSON
Step 2: Fetch relevant data → RAG / tool call
Step 3: Generate response   → final output
```

Each step's output becomes the next step's input. Keep steps small and independently testable.

## Error Handling

| Error | Action |
|---|---|
| Rate limit (429) | Exponential backoff, max 3 retries |
| Invalid output schema | Re-prompt with correction instruction |
| Timeout | Fall back to cached/default response |
| Model unavailable | Switch to fallback model |

## File Structure

```
ai/
├── prompts/          # Versioned prompt templates
├── workflows/        # Workflow definitions
├── tools/            # Tool/function definitions for tool-use
├── validators/       # Output schema validators
└── AI_WORKFLOW.md    # This file
```
