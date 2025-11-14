# Tests

This directory contains all tests for the miniflow project.

## Structure

```
tests/
├── unit/              # Unit tests for individual functions/components
├── integration/       # Integration tests for API endpoints and services
├── e2e/              # End-to-end tests (future)
└── chrome-extension/ # Chrome extension specific tests
```

## Running Tests

### Integration Tests (API)
```bash
# Test production API
node tests/integration/prod-api.test.js

# Test local API
node tests/integration/api.test.js

# Test rephrase flow
node tests/integration/rephrase-flow.test.js

# Test OpenAI key
node tests/integration/openai-key.test.js
```

### Chrome Extension Tests
Chrome extension tests are located in `tests/chrome-extension/` and are still maintained in the original location (`chrome-extension/src/`) for development workflow.

## Test Files

### Integration Tests
- `integration/api.test.js` - Tests local API endpoints
- `integration/prod-api.test.js` - Tests production API endpoints
- `integration/rephrase-flow.test.js` - Tests the rephrase feature flow
- `integration/openai-key.test.js` - Tests OpenAI API key configuration

### Chrome Extension Tests
- `chrome-extension/NativeHighlightTooltip.test.ts` - Tests native tooltip component
- `chrome-extension/__tests__/setup.ts` - Test setup and configuration

## Adding New Tests

### Unit Tests
Place in `tests/unit/` directory with naming: `[feature].test.{ts,js}`

### Integration Tests
Place in `tests/integration/` directory with naming: `[feature].test.{ts,js}`

### E2E Tests
Place in `tests/e2e/` directory (to be implemented)
