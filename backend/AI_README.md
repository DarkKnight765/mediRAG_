# AI integration notes

Environment variables

- `LOCAL_MODEL_URL` — optional. When set, `aiService` will call this URL's `/generate` and `/chat` endpoints for development and CI.
- `GEMINI_API_KEY` — optional. When set, the Gemini client will be initialized and used as a fallback for generation and multimodal calls.
- `MOCK_MODEL_PORT` — port for the local mock model server (default `8000`).
- `OLLAMA_BASE_URL` — optional. When set with `OLLAMA_MODEL`, `mock_model_server.js` will proxy `/generate` and `/chat` to a local Ollama instance.
- `OLLAMA_MODEL` — optional. Ollama model name to use, for example `llama3.1` or `qwen2.5`.

If you do not want to install Ollama yet, leave `OLLAMA_BASE_URL` and `OLLAMA_MODEL` empty. The app will continue using Gemini directly, and the local adapter will fall back to deterministic mock responses if you run it without Ollama.

Behavior

- If `LOCAL_MODEL_URL` is set and reachable, `aiService` prefers it for text generation and chat. Calls use a retry/backoff strategy to handle transient failures.
- If `LOCAL_MODEL_URL` is not set or not reachable, `aiService` will attempt to use Gemini if `GEMINI_API_KEY` is configured.
- If you run `npm run mock-model` with `OLLAMA_BASE_URL` and `OLLAMA_MODEL` set, the mock server will forward requests to Ollama and fall back to deterministic responses if Ollama is unavailable.

Health checks

- A lightweight health endpoint is available at `/model/health` which reports reachability of the local mock model and whether the Gemini client is configured.

CI

- The repository includes an integration test (`backend/test/run_ai_integration_test.js`) which exercises the chat flow using the mock model.
