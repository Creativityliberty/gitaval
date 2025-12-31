import { minimatch } from 'minimatch';

const GITHUB_API_BASE = 'https://api.github.com';

export interface FileNode {
    path: string;
    type: 'blob' | 'tree';
    size?: number;
    sha: string;
}

export interface RepoSummary {
    owner: string;
    repo: string;
    filesAnalyzed: number;
    estimatedTokens: number;
}

export interface AnalysisResult {
    summary: RepoSummary;
    tree: string;
    content: string;
}

export interface AnalyzeOptions {
    branch?: string;
    includePatterns?: string[];
    excludePatterns?: string[];
}

export async function analyzeRepo(
    url: string,
    options: AnalyzeOptions = {}
): Promise<AnalysisResult> {
    const { owner, repo } = parseGitHubUrl(url);
    const token = process.env.GITHUB_TOKEN;
    const defaults = {
        branch: options.branch || 'main', // TODO: Fetch default branch if not specified
        includePatterns: options.includePatterns || [],
        excludePatterns: options.excludePatterns || [
            'node_modules/**',
            '*.lock',
            'dist/**',
            'build/**',
            '.git/**',
            '*.png',
            '*.jpg',
            '*.jpeg',
            '*.gif',
            '*.svg',
            '*.ico',
            '*.pdf',
            '*.zip',
            '*.tar.gz'
        ]
    };

    // 1. Fetch Repository Tree
    const treeUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaults.branch}?recursive=1`;
    const treeResponse = await fetch(treeUrl, {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!treeResponse.ok) {
        if (treeResponse.status === 404) {
            // Try 'master' if 'main' fails and branch wasn't explicitly set
            if (!options.branch) {
                const masterUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/master?recursive=1`;
                const masterResponse = await fetch(masterUrl, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        Accept: 'application/vnd.github.v3+json',
                    },
                });
                if (masterResponse.ok) {
                    return processTreeResponse(masterResponse, owner, repo, defaults, token);
                }
            }
            throw new Error(`Repository or branch not found: ${owner}/${repo}`);
        }
        throw new Error(`GitHub API Error: ${treeResponse.statusText}`);
    }

    return processTreeResponse(treeResponse, owner, repo, defaults, token);
}

async function processTreeResponse(response: Response, owner: string, repo: string, options: AnalyzeOptions, token?: string): Promise<AnalysisResult> {
    const data = await response.json();
    if (data.truncated) {
        console.warn('Tree truncated by GitHub API');
    }

    const allFiles: FileNode[] = data.tree;

    // Filter files
    const relevantFiles = allFiles.filter(node => {
        if (node.type !== 'blob') return false;

        // Exclude
        if (options.excludePatterns && options.excludePatterns.some((p: string) => minimatch(node.path, p, { dot: true }))) {
            return false;
        }

        // Include (if specified)
        if (options.includePatterns && options.includePatterns.length > 0) {
            return options.includePatterns.some((p: string) => minimatch(node.path, p, { dot: true }));
        }

        return true;
    });

    // Generate Tree String
    const treeString = generateTreeVisual(relevantFiles.map(f => f.path));

    // Fetch Contents (Parallel with concurrency limit)
    // For now, simple Promise.all (be careful with rate limits)
    // TODO: Implement batching or limit
    const MAX_CONCURRENT = 5;
    const contents: string[] = [];
    let totalTokens = 0;

    // chunking
    for (let i = 0; i < relevantFiles.length; i += MAX_CONCURRENT) {
        const chunk = relevantFiles.slice(i, i + MAX_CONCURRENT);
        const chunkResults = await Promise.all(chunk.map(async (file) => {
            const content = await fetchFileContent(owner, repo, file.path, token);
            return formatFileContent(file.path, content);
        }));
        contents.push(...chunkResults);

        // Simple token estimation: ~4 chars per token
        chunkResults.forEach(c => totalTokens += Math.ceil(c.length / 4));
    }

    return {
        summary: {
            owner,
            repo,
            filesAnalyzed: relevantFiles.length,
            estimatedTokens: totalTokens
        },
        tree: treeString,
        content: contents.join('\n\n')
    };
}


async function fetchFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/vnd.github.v3.raw' // Get raw content
        }
    });

    if (!response.ok) {
        return `Error fetching ${path}: ${response.statusText}`;
    }

    return await response.text();
}

function formatFileContent(path: string, content: string): string {
    return `================================================
FILE: ${path}
================================================
${content}`;
}

function generateTreeVisual(paths: string[]): string {
    // Simple tree generation logic (naive implementation for speed)
    // For a robust one, we'd build a real tree structure.
    // This is a placeholder for the "Directory structure" output.
    // We can use a library or a helper function.

    // Sort paths
    paths.sort();

    // TODO: sophisticated ASCII tree
    return "Directory structure:\n" + paths.map(p => `└── ${p}`).join('\n');
}

function parseGitHubUrl(url: string) {
    // Handle https://github.com/owner/repo
    // Handle owner/repo
    const clean = url.replace('https://github.com/', '').replace('.git', '');
    const parts = clean.split('/');
    if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
    }
    throw new Error('Invalid GitHub URL');
}
