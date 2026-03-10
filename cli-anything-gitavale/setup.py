from setuptools import setup, find_namespace_packages

setup(
    name="cli-anything-gitavale",
    version="1.0.0",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    install_requires=[
        "click>=8.0.0",
        "prompt-toolkit>=3.0.0",
        "requests>=2.25.1",
        "questionary>=2.0.0"
    ],
    entry_points={
        "console_scripts": [
            "cli-anything-gitavale=cli_anything.gitavale.gitavale_cli:main",
        ],
    },
    python_requires=">=3.10",
)
