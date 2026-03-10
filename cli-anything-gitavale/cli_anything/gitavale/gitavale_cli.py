import os
import sys
import json
import click
import traceback

from cli_anything.gitavale.utils.repl_skin import ReplSkin
from cli_anything.gitavale.core import config, api

skin = ReplSkin("gitavale", version="1.0.0")

def is_json_mode():
    return "--json" in sys.argv

@click.group(invoke_without_command=True)
@click.option("--json", is_flag=True, help="Output purely in JSON format for agents")
@click.pass_context
def cli(ctx, json):
    """Gitavale: Turn any Git repo into an LLM-ready digest."""
    if ctx.invoked_subcommand is None:
        if json:
            click.echo(json.dumps({"error": "REPL mode does not support JSON output"}))
            sys.exit(1)
        ctx.invoke(repl)

@cli.group()
def auth():
    """Authentication and API Keys."""
    pass

@auth.command("login")
@click.option("--key", help="Gitavale API Key")
@click.option("--endpoint", help="Gitavale API Endpoint Override")
def auth_login(key, endpoint):
    """Authenticate with the Gitavale API."""
    if endpoint:
        config.update_endpoint(endpoint)
        
    if not key:
        import questionary
        key = questionary.password("Enter your Gitavale API Key:").ask()
        
    if not key:
        return skin.error("No API key provided.")
        
    config.update_api_key(key)
    
    if is_json_mode():
        click.echo(json.dumps({"success": True, "message": "Authenticated"}))
    else:
        skin.success("Successfully authenticated with Gitavale.")

@cli.command()
@click.argument("url")
@click.option("-o", "--output", help="Save the full digest to a specific text file")
@click.pass_context
def analyze(ctx, url, output):
    """Analyze a GitHub repository."""
    if not is_json_mode():
        skin.info(f"Analyzing {url}...")
        
    try:
        data = api.analyze_repository(url)
        
        if output:
            with open(output, "w") as f:
                f.write(data.get("content", ""))
                
        if is_json_mode():
            click.echo(json.dumps(data))
        else:
            skin.success("Analysis complete.")
            summary = data.get("summary", {})
            skin.status("Owner", summary.get("owner"))
            skin.status("Repo", summary.get("repo"))
            skin.status("Files Analyzed", summary.get("filesAnalyzed"))
            skin.status("Estimated Tokens", summary.get("estimatedTokens"))
            
            if output:
                skin.success(f"Full digest saved to {output}")
            
    except api.GitavaleAPIError as e:
        if is_json_mode():
            click.echo(json.dumps({"error": str(e)}))
        else:
            skin.error(str(e))
        sys.exit(1)

@cli.group()
def projects():
    """Manage analyzed projects history."""
    pass

@projects.command("list")
def projects_list():
    """List previously analyzed projects."""
    try:
        projects_data = api.list_projects()
        
        if is_json_mode():
            click.echo(json.dumps({"projects": projects_data}))
            return
            
        if not projects_data:
            skin.info("No projects found in history.")
            return
            
        headers = ["Repo", "Owner", "URL"]
        rows = [[p.get("repoName"), p.get("owner"), p.get("repoUrl")] for p in projects_data]
        skin.table(headers, rows)
        
    except api.GitavaleAPIError as e:
        if is_json_mode():
            click.echo(json.dumps({"error": str(e)}))
        else:
            skin.error(str(e))
        sys.exit(1)

@cli.command(hidden=True)
@click.pass_context
def repl(ctx):
    """Start the interactive Gitavale REPL."""
    skin.print_banner()
    pt_session = skin.create_prompt_session()
    
    commands_dict = {
        "auth login": "Authenticate with your API key",
        "analyze <url>": "Analyze a repository",
        "projects list": "List historical projects",
        "help": "Show this message",
        "exit": "Exit the REPL"
    }
    
    while True:
        try:
            line = skin.get_input(pt_session, project_name="Gitavale", modified=False)
            
            if not line:
                continue
                
            parts = [p for p in line.split() if p]
            cmd = parts[0]
            
            if cmd == "exit" or cmd == "quit":
                break
            elif cmd == "help":
                skin.help(commands_dict)
                continue
                
            # Delegate to click by mocking sys.argv
            sys.argv = ["cli-anything-gitavale"] + parts
            try:
                cli(standalone_mode=False)
            except click.exceptions.Exit:
                pass
            except click.exceptions.UsageError as e:
                skin.error(str(e))
            except click.exceptions.NoSuchOption as e:
                skin.error(str(e))
            except Exception as e:
                skin.error(f"Command error: {str(e)}")
                
        except KeyboardInterrupt:
            continue
        except EOFError:
            break
            
    skin.print_goodbye()

def main():
    cli()

if __name__ == "__main__":
    main()
