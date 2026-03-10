import os
import json
import pytest
from unittest.mock import patch, MagicMock

from cli_anything.gitavale.core import config, api

@pytest.fixture
def mock_config_file(tmp_path):
    # Override CONFIG_FILE to point to temp dir during tests
    import cli_anything.gitavale.core.config as config_mod
    
    test_config_path = tmp_path / "test_config.json"
    original_file = config_mod.CONFIG_FILE
    original_dir = config_mod.CONFIG_DIR
    
    config_mod.CONFIG_FILE = test_config_path
    config_mod.CONFIG_DIR = tmp_path
    
    yield test_config_path
    
    # Restore
    config_mod.CONFIG_FILE = original_file
    config_mod.CONFIG_DIR = original_dir

def test_config_read_write(mock_config_file):
    # Test default
    cfg = config.load_config()
    assert cfg["api_endpoint"] == "https://gitaval.vercel.app"
    assert cfg["api_key"] == ""
    
    # Test update
    config.update_api_key("gt_test_key_123")
    config.update_endpoint("http://localhost:3000/")
    
    cfg = config.load_config()
    assert cfg["api_key"] == "gt_test_key_123"
    assert cfg["api_endpoint"] == "http://localhost:3000"  # Strips trailing slash
    
    # Directly reading file
    with open(mock_config_file, "r") as f:
        data = json.load(f)
        assert data["api_key"] == "gt_test_key_123"

@patch('cli_anything.gitavale.core.api.get_api_key')
def test_get_headers(mock_get_api_key):
    mock_get_api_key.return_value = "secret_key"
    headers = api._get_headers()
    assert headers["Authorization"] == "Bearer secret_key"
    assert headers["Content-Type"] == "application/json"

@patch('cli_anything.gitavale.core.api.requests.post')
@patch('cli_anything.gitavale.core.config.get_endpoint')
def test_analyze_repository_success(mock_get_endpoint, mock_post):
    mock_get_endpoint.return_value = "http://test"
    
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"summary": {"filesAnalyzed": 10}, "content": "test text"}
    mock_post.return_value = mock_resp
    
    result = api.analyze_repository("https://github.com/test/test")
    
    assert mock_post.called
    assert result["summary"]["filesAnalyzed"] == 10
    assert result["content"] == "test text"

@patch('cli_anything.gitavale.core.api.requests.post')
def test_analyze_repository_unauthorized(mock_post):
    mock_resp = MagicMock()
    mock_resp.ok = False
    mock_resp.status_code = 401
    mock_post.return_value = mock_resp
    
    with pytest.raises(api.GitavaleAPIError, match="Unauthorized"):
        api.analyze_repository("https://github.com/test/test")

@patch('cli_anything.gitavale.core.api.requests.get')
def test_list_projects_success(mock_get):
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"projects": [{"repoName": "test-repo", "owner": "test-owner"}]}
    mock_get.return_value = mock_resp
    
    result = api.list_projects()
    
    assert mock_get.called
    assert len(result) == 1
    assert result[0]["repoName"] == "test-repo"
