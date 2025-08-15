voltade-cli
=================

Voltade OS CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/voltade-cli.svg)](https://npmjs.org/package/voltade-cli)
[![Downloads/week](https://img.shields.io/npm/dw/voltade-cli.svg)](https://npmjs.org/package/voltade-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g voltade-cli
$ voltade COMMAND
running command...
$ voltade (--version)
voltade-cli/0.0.0 darwin-arm64 node-v22.18.0
$ voltade --help [COMMAND]
USAGE
  $ voltade COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`voltade hello PERSON`](#voltade-hello-person)
* [`voltade hello world`](#voltade-hello-world)
* [`voltade help [COMMAND]`](#voltade-help-command)
* [`voltade plugins`](#voltade-plugins)
* [`voltade plugins add PLUGIN`](#voltade-plugins-add-plugin)
* [`voltade plugins:inspect PLUGIN...`](#voltade-pluginsinspect-plugin)
* [`voltade plugins install PLUGIN`](#voltade-plugins-install-plugin)
* [`voltade plugins link PATH`](#voltade-plugins-link-path)
* [`voltade plugins remove [PLUGIN]`](#voltade-plugins-remove-plugin)
* [`voltade plugins reset`](#voltade-plugins-reset)
* [`voltade plugins uninstall [PLUGIN]`](#voltade-plugins-uninstall-plugin)
* [`voltade plugins unlink [PLUGIN]`](#voltade-plugins-unlink-plugin)
* [`voltade plugins update`](#voltade-plugins-update)

## `voltade hello PERSON`

Say hello

```
USAGE
  $ voltade hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ voltade hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/packages/voltade-os/blob/v0.0.0/src/commands/hello/index.ts)_

## `voltade hello world`

Say hello world

```
USAGE
  $ voltade hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ voltade hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/packages/voltade-os/blob/v0.0.0/src/commands/hello/world.ts)_

## `voltade help [COMMAND]`

Display help for voltade.

```
USAGE
  $ voltade help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for voltade.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `voltade plugins`

List installed plugins.

```
USAGE
  $ voltade plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ voltade plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/index.ts)_

## `voltade plugins add PLUGIN`

Installs a plugin into voltade.

```
USAGE
  $ voltade plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into voltade.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VOLTADE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VOLTADE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ voltade plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ voltade plugins add myplugin

  Install a plugin from a github url.

    $ voltade plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ voltade plugins add someuser/someplugin
```

## `voltade plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ voltade plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ voltade plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/inspect.ts)_

## `voltade plugins install PLUGIN`

Installs a plugin into voltade.

```
USAGE
  $ voltade plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into voltade.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VOLTADE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VOLTADE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ voltade plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ voltade plugins install myplugin

  Install a plugin from a github url.

    $ voltade plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ voltade plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/install.ts)_

## `voltade plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ voltade plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ voltade plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/link.ts)_

## `voltade plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ voltade plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ voltade plugins unlink
  $ voltade plugins remove

EXAMPLES
  $ voltade plugins remove myplugin
```

## `voltade plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ voltade plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/reset.ts)_

## `voltade plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ voltade plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ voltade plugins unlink
  $ voltade plugins remove

EXAMPLES
  $ voltade plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/uninstall.ts)_

## `voltade plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ voltade plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ voltade plugins unlink
  $ voltade plugins remove

EXAMPLES
  $ voltade plugins unlink myplugin
```

## `voltade plugins update`

Update installed plugins.

```
USAGE
  $ voltade plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/update.ts)_
<!-- commandsstop -->
