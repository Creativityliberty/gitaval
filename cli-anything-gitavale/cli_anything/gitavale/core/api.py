import requests
from typing import Dict, Any, List

from cli_anything.gitavale.core.config import get_endpoint, get_api_key

class GitavaleAPIError(Exception):
    pass

def _get_headers() -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    api_key = get_api_key()
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers

def analyze_repository(url: str) -> Dict[str, Any]:
    """
    Sends a request to analyze a specific github repository.
    Returns the parsed repository data and generated digest.
    """
    endpoint = f"{get_endpoint()}/api/analyze"
    try:
        response = requests.post(
            endpoint,
            headers=_get_headers(),
            json={"url": url},
            timeout=180 # Analysis can take a while
        )
        
        if response.status_code == 401:
            raise GitavaleAPIError("Unauthorized. Please run `cli-anything-gitavale auth login` with a valid API key.")
        
        if not response.ok:
            error_data = response.json() if response.content else {}
            raise GitavaleAPIError(f"Analysis failed ({response.status_code}): {error_data.get('error', response.text)}")
            
        return response.json()
    except requests.RequestException as e:
        raise GitavaleAPIError(f"Connection error: {str(e)}")

def list_projects() -> List[Dict[str, Any]]:
    """
    Retrieves the list of previously analyzed projects for the authenticated user.
    """
    endpoint = f"{get_endpoint()}/api/projects"
    try:
        response = requests.get(
            endpoint,
            headers=_get_headers(),
            timeout=30
        )
        
        if response.status_code == 401:
            raise GitavaleAPIError("Unauthorized. Please run `cli-anything-gitavale auth login` with a valid API key.")
            
        if not response.ok:
            raise GitavaleAPIError(f"Failed to fetch projects ({response.status_code})")
            
        data = response.json()
        return data.get("projects", [])
    except requests.RequestException as e:
        raise GitavaleAPIError(f"Connection error: {str(e)}")
