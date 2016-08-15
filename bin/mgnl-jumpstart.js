var fs = require('fs-extra')
var path = require('path')
var async = require('async')
var downloadMagnolia = require('./downloadMagnolia.js')
var downloadJars = require('./downloadJars.js')
var extractMagnolia = require('./extractMagnolia.js')
var createLightModule = require('./createLightModule.js')
var editMagnoliaProperties = require('./editMagnoliaProperties.js')
var helper = require('./helper.js')
var configJson = require(helper.resolveMgnlCliJsonPath())
var program = require('commander')
var util = require('util')

var prepareMagnolia = function (args) {
  extractMagnolia.extract(process.cwd(), magnoliaZip)

  if (args.moduleName) {
    createLightModule.create(args)
  }

  editMagnoliaProperties.editProperties()
  downloadJars.download(function () {
    var successMessage = 'Magnolia has been successfully setup for light development!\n' +
      "You can now go to 'apache-tomcat/bin' and start up Magnolia by entering './magnolia_control.sh start' " +
      'Magnolia will be ready after a few seconds at localhost:8080/magnoliaAuthor. Username and password is superuser\n' +
      "To stop Magnolia enter './magnolia_control.sh stop'. On Windows use magnolia_control.bat\n"

    helper.printSuccess(successMessage)
  })
}

var validateAndResolveArgs = function (program) {
  if (typeof program.path === 'undefined') {
    program.path = helper.defaultLightModulesRootName
    helper.printInfo(util.format("No path option provided. Will use the default '%s' in the current directory", program.path))
  }

  if (program.path === '-i' || program.path === '--install-sample-module' ||
    program.path === '-m' || program.path === '--magnolia-version') {
    helper.printError('--path[-p] argument is invalid')
    program.outputHelp()
    process.exit(1)
  }

  if (program.magnoliaVersion) {
    configJson.setupMagnolia.downloadUrl = configJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, program.magnoliaVersion)
  } else {
    // get the latest release.
    configJson.setupMagnolia.downloadUrl = configJson.setupMagnolia.downloadUrl.replace(/\${magnoliaVersion}/g, 'LATEST')
    helper.printInfo('No magnolia-version option provided. Will use the latest Community Edition')
  }
  /*
   * This absolute path will end up in magnolia.properties as the value of magnolia.resources.dir
   * If we're on Windows we need to replace the backslash, else it will cause Magnolia start up to fail.
   * See also top comment in magnolia.properties
   */
  var lightModulesRoot = process.platform === 'win32' ? path.resolve(program.path).replace(/\\/g, '/') : path.resolve(program.path)

  if (!fs.existsSync(lightModulesRoot)) {
    helper.printInfo(util.format("'%s' does not seem to exist. Path will be created automatically.", lightModulesRoot))
    fs.mkdirpSync(lightModulesRoot)
  }
  configJson.setupMagnolia.webapps.magnoliaAuthor['magnolia.resources.dir'] = lightModulesRoot

  var moduleName = null
  if (program.installSampleModule) {
    moduleName = program.installSampleModule
  }

  return {
    'lightModulesRoot': lightModulesRoot,
    'moduleName': moduleName
  }
}

program
  .version(require('../package.json').version)
  .description('Downloads and sets up an instance of Magnolia CE for light development in the current directory.')
  .option('-p, --path <path>', "The path to the light modules root folder which will be observed for changes. If no path is provided, defaults to 'light-modules' in the current folder. Light modules are created under this folder which is observed by Magnolia for changes. The path to such folder is the value of 'magnolia.resources.dir' property at <magnoliaWebapp>/WEB-INF/config/default/magnolia.properties.")
  .option('-m, --magnolia-version <version>', 'If not provided defaults to the latest magnolia-community-demo-bundle.')
  .option('-i, --install-sample-module <name>', 'If provided will create a sample module under the light modules root folder with the given name.')
  .parse(process.argv)

var args = validateAndResolveArgs(program)

var magnoliaZip = 'magnolia.zip'
// start downloading Magnolia, it'll take a while and since Node.js is async
downloadMagnolia.download(process.cwd(), magnoliaZip)
// we need to wait until the zip file is actually there before proceeding
async.until(
  // test function which will be repeated until true
  function () {
    return fs.existsSync(magnoliaZip)
  },
  // Once the condition is true, that is Magnolia has been fully downloaded,
  // the callback function can be invoked
  function (callback) {
    setTimeout(function () {
      callback(null)
    }, 100)
  },
  // callback function handling all operations subsequent to Magnolia download
  function (err) {
    if (err) {
      helper.printError(err.message)
      process.exit(1)
    }
    try {
      prepareMagnolia(args)
    } catch (e) {
      helper.printError(e)
      process.exit(1)
    }
  }
)
