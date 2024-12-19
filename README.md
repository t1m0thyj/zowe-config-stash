# Zowe Config Stash

Wrapper for `git stash` to backup and restore Zowe config files

## Installation

1. Clone this repo
2. Install dependencies: `npm install`
3. Install globally: `npm install -g .`

## Basic Usage

**Warning:** This tool manages config files in `~/.zowe` and the current directory, as well as secure credentials. When applying a stash, these will be overwritten.

1. (optional) Change directory to project containing `zowe.config.json`
2. To backup, run `zc-stash push`
3. To restore, run `zc-stash pop`

## Advanced Usage

**Note:** The `zc-stash` script supports the same syntax as the `git stash` command.

To manage multiple stashes of Zowe config:

1. Backup config with name: `zc-stash push -m "<stash name>"`
2. List all stashes: `zc-stash list`
3. Restore config with index: `zc-stash apply <stash index>`
