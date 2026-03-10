# Gitavale CLI Test Plan & Results

## 1. Test Inventory Plan

- `test_core.py`: 6 unit tests planned
- `test_full_e2e.py`: 3 E2E tests planned

## 2. Unit Test Plan (`test_core.py`)

### Module: `core.config`

- `test_config_read_write`: Test that saving to and reading from `~/.gitavale/config.json` works and handles missing files/keys correctly.

### Module: `core.api`

- `test_get_headers`: Verify `Authorization` header is generated correctly when key is present.
- `test_analyze_repository_success`: Mock the `requests.post` call to return a valid 200 response and check data parsing.
- `test_analyze_repository_unauthorized`: Mock a 401 response to verify `GitavaleAPIError` is raised.
- `test_list_projects_success`: Mock a valid `requests.get` call to check parsing of historical projects.

## 3. E2E Test Plan (`test_full_e2e.py`)

- Real integration tests against the live `https://gitaval.vercel.app` endpoint (or localhost if testing backend separately).
- `test_help_command`: Verify `cli-anything-gitavale --help` returns 0.
- `test_auth_flow`: Mock interaction to save a dummy API key.
- `test_analyze_json`: Use `cli-anything-gitavale --json analyze https://github.com/octocat/Hello-World` and check JSON schema.

## 4. Realistic Workflow Scenarios

### Workflow 1: Generate Codebase Digest

- **Simulates**: A developer pulling a digest of a foreign codebase.
- **Operations chained**: `cli-anything-gitavale auth login --key <API_KEY>` -> `cli-anything-gitavale analyze https://github.com/owner/repo -o digest.txt`.
- **Verified**: Ensure `digest.txt` is created, has size > 0, and contains markdown headers.

---

## Test Results

*(Results will be appended here after execution)*

```
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.0.2, pluggy-1.6.0
cachedir: .pytest_cache
rootdir: D:\gitavale-1\cli-anything-gitavale
plugins: anyio-4.12.1
collecting ... collected 8 items

cli_anything/gitavale/tests/test_core.py::test_config_read_write PASSED  [ 12%]
cli_anything/gitavale/tests/test_core.py::test_get_headers PASSED        [ 25%]
cli_anything/gitavale/tests/test_core.py::test_analyze_repository_success PASSED [ 37%]
cli_anything/gitavale/tests/test_core.py::test_analyze_repository_unauthorized PASSED [ 50%]
cli_anything/gitavale/tests/test_core.py::test_list_projects_success PASSED [ 62%]
cli_anything/gitavale/tests/test_full_e2e.py::TestCLISubprocess::test_help_command PASSED [ 75%]
cli_anything/gitavale/tests/test_full_e2e.py::TestCLISubprocess::test_auth_login_json PASSED [ 87%]
cli_anything/gitavale/tests/test_full_e2e.py::TestCLISubprocess::test_analyze_integration SKIPPED [100%]

======================== 7 passed, 1 skipped in 6.35s =========================
```
