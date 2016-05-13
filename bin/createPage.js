var path = require('path')
var fs = require('fs')
var util = require('util')

var createFromPrototype = require('./createFromPrototype')
var helper = require('./helper.js')
var MgnlCliError = helper.MgnlCliError
var packageJson = require('../package.json')

var createPage = function (params) {
  var templatePath = path.join(params.pathToLightModule, packageJson.lightDevFoldersInModule.templates_pages, params.newPageName)
  var templateDefinitionFile = templatePath + '.yaml'
  var templateScriptFile = templatePath + '.ftl'

  var dialogDefinitionFile = path.join(params.pathToLightModule, packageJson.lightDevFoldersInModule.dialogs_pages, params.newPageName + '.yaml')
  var dialogDefinitionId = params.moduleName + ':' + packageJson.lightDevFoldersInModule.dialogs_pages.replace('/dialogs/', '') + '/' + params.newPageName

  // page definition
  if (fs.existsSync(templateDefinitionFile)) {
    throw new MgnlCliError(util.format("'%s' page template already exists at %s", params.newPageName, templateDefinitionFile))
  } else {
    createFromPrototype.createFromPrototype('/page/definition.yaml', templateDefinitionFile, {
      '__name__': params.newPageName,
      '__templateScript__': templateScriptFile.replace(params.pathToLightModule, '/' + params.moduleName),
      '__dialog__': dialogDefinitionId
    })
  }

  // template script
  if (!fs.existsSync(templateScriptFile)) {
    createFromPrototype.createFromPrototype('/page/template.ftl', templateScriptFile, {
      '__name__': params.newPageName,
      '__lightDevModuleFolder__': '/' + params.moduleName
    })
  } else {
    console.log("'%s' templateScript already exists", templateScriptFile)
  }

  // dialog
  if (!fs.existsSync(dialogDefinitionFile)) {
    createFromPrototype.createFromPrototype('/page/dialog.yaml', dialogDefinitionFile, {
      '__name__': params.newPageName
    })
  } else {
    console.log("'%s' dialog already exists", dialogDefinitionFile)
  }
  helper.printSuccess('Page template created')
}

var validateAndResolveArgs = function (program) {
  if (program.args.length !== 1) {
    throw new MgnlCliError('Expected one argument', true)
  }
  var moduleName
  var newPageName = program.args[0]
  if (newPageName.indexOf(path.sep) !== -1) {
    throw new MgnlCliError(util.format('%s is not valid page name. It should contain no slash character', newPageName), true)
  }

  // assume the current dir is a light module.
  if (typeof program.path === 'undefined') {
    console.log('No path option provided, page template will be created in the current folder.')
    moduleName = path.basename(process.cwd())
  } else {
    // clever trick with filter to get rid of unwanted separators found on http://stackoverflow.com/a/19888749 of course
    var splitPath = program.path.split(path.sep).filter(Boolean)
    newPageName = program.args[0]

    if (splitPath.length === 1) {
      moduleName = splitPath[0]
    } else {
      // assume last part is module name
      moduleName = splitPath[splitPath.length - 1]
    }
  }
  var pathToModule = program.path || process.cwd()

  helper.ensureIsAValidLightModuleFolder(pathToModule)

  return {
    'pathToLightModule': pathToModule.endsWith(path.sep) ? pathToModule.slice(0, -1) : pathToModule,
    'moduleName': moduleName,
    'newPageName': newPageName
  }
}

exports.create = createPage
exports.validateAndResolveArgs = validateAndResolveArgs
