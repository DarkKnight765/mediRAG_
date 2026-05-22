# AI integration notes

Environment variables

- `LOCAL_MODEL_URL` — optional. When set, `aiService` will call this URL's `/generate` and `/chat` endpoints for development and CI.
- `GEMINI_API_KEY` — optional. When set, the Gemini client will be initialized and used as a fallback for generation and multimodal calls.
- `MOCK_MODEL_PORT` — port for the local mock model server (default `8000`).

Behavior

- If `LOCAL_MODEL_URL` is set and reachable, `aiService` prefers it for text generation and chat. Calls use a retry/backoff strategy to handle transient failures.
- If `LOCAL_MODEL_URL` is not set or not reachable, `aiService` will attempt to use Gemini if `GEMINI_API_KEY` is configured.

Health checks

- A lightweight health endpoint is available at `/model/health` which reports reachability of the local mock model and whether the Gemini client is configured.

CI

- The repository includes an integration test (`backend/test/run_ai_integration_test.js`) which exercises the chat flow using the mock model.
