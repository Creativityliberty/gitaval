import os
import sys
import json
import shutil
import pytest
import subprocess

from cli_anything.gitavale.core import config, api

def _resolve_cli(name):
    """Resolve installed CLI command; falls back to python -m for dev.

    Set env CLI_ANYTHING_FORCE_INSTALLED=1 to require the installed command.
    """
    force = os.environ.get("CLI_ANYTHING_FORCE_INSTALLED", "").strip() == "1"
    path = shutil.which(name)
    if path:
        print(f"[_resolve_cli] Using installed command: {path}")
        return [path]
    if force:
        raise RuntimeError(f"{name} not found in PATH. Install with: pip install -e .")
    module = name.replace("cli-anything-", "cli_anything.") + "." + name.split("-")[-1] + "_cli"
    print(f"[_resolve_cli] Falling back to: {sys.executable} -m {module}")
    return [sys.executable, "-m", module]

class TestCLISubprocess:
    CLI_BASE = _resolve_cli("cli-anything-gitavale")

    def _run(self, args, check=True):
        return subprocess.run(
            self.CLI_BASE + args,
            capture_output=True, text=True,
            check=check,
        )

    def test_help_command(self):
        result = self._run(["--help"])
        assert result.returncode == 0
        assert "Gitavale" in result.stdout

    def test_auth_login_json(self, tmp_path, monkeypatch):
        test_config_path = tmp_path / "test_config.json"
        
        # Override the CONFIG_FILE in config.py
        import cli_anything.gitavale.core.config as config_mod
        monkeypatch.setattr(config_mod, 'CONFIG_FILE', test_config_path)
        monkeypatch.setattr(config_mod, 'CONFIG_DIR', tmp_path)
        
        # Run subprocess (it won't share memory, so we pass fake endpoint/key directly)
        result = self._run(["--json", "auth", "login", "--key", "fake_key_123", "--endpoint", "http://localhost:3000"])
        assert result.returncode == 0
        
        data = json.loads(result.stdout)
        assert data.get("success") is True

    @pytest.mark.skip(reason="Requires a live backend for real E2E analysis, mocking for CI")
    def test_analyze_integration(self, tmp_path):
        """
        In a real scenario, this tests against the LIVE backend.
        We skip it by default to avoid spamming the backend during dev tests.
        """
        output_file = tmp_path / "digest.txt"
        
        result = self._run(["analyze", "https://github.com/octocat/Hello-World", "-o", str(output_file)])
        
        assert result.returncode == 0
        assert os.path.exists(output_file)
        assert os.path.getsize(output_file) > 0
