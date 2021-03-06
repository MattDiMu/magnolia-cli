# Magnolia Light Development CLI tool #

[![license](https://img.shields.io/badge/license-GPL%203.0-blue.svg)](https://www.gnu.org/licenses/gpl.html)
[![Build Status](https://jenkins.magnolia-cms.com/job/build_npm-cli/badge/icon)](https://jenkins.magnolia-cms.com/job/build_npm-cli/)

An npm package providing a CLI tool to setup and facilitate [Light development with Magnolia](https://documentation.magnolia-cms.com/display/DOCS/Light+development+in+Magnolia).   
For a complete reference of the npm-cli, please have a look at [Magnolia npm-cli documentation](https://documentation.magnolia-cms.com/display/DOCS/Magnolia+CLI).


## Installation ##
Before installation make sure you have [Node.js](https://nodejs.org) installed (recommended v 4.4.7+)

Install the package **globally**

#### Magnolia CLI 1.0 is out and available on npm public repository ####

`npm install @magnolia/cli -g`


Alternatively you can checkout the latest code and simply install it from source with

`npm install -g`



## Commands ##
To invoke a command, execute `mgnl <command> [options]` on your shell.      

To see what commands are available simply enter  `mgnl -h` (or `mgnl --help`)

```
jumpstart             download and prepare Magnolia CMS for light dev.
start                 start up a Magnolia CMS instance. To stop it, enter CTRL+C.
add-availability      add component availability.
build                 scan a node_modules folder for npm packages with the keyword "magnolia-light-module" (in package.json) and extract them to a directory of choice.
create-component      create a component and optionally add availability for it.
create-light-module   create a light module.
create-page           create a page template.
setup                 extract "mgnl-cli-prototypes" folder and "mgnl-cli.json" file to have a custom configuration.
help [cmd]            display help for [cmd]
```

To get help for any of the subcommands, simply enter `mgnl <subcommand> -h`.   

E.g. `mgnl create-light-module -h` will output:   

```
  Usage: mgnl-create-light-module <moduleName> [options]

  Creates a light module. Light modules are created under a 'root' folder which is observed by Magnolia for changes. The path to such folder is the value of 'magnolia.resources.dir' property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --path <path>  The path to the light modules root folder. If no path is provided, then the current directory is assumed to be the light modules root folder and the module will be created here.   
```


## Bash autocompletion ##
The package provides a basic autocompletion feature for Bash shells. To enable it, add the following line to your ```.profile ``` (this may vary according to your OS and Node.js settings):   

Mac OS X
```
source /usr/local/lib/node_modules/@magnolia/cli/extra/mgnl-autocompletion.sh
```
Ubuntu
```
source /usr/lib/node_modules/@magnolia/cli/extra/mgnl-autocompletion.sh
```
