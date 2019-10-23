const glob = require("glob");
const path = require("path");
const fs = require('fs');

function walkUpToFindNodeModulesPath (context) {
  const tempPath = path.resolve(context, 'node_modules');
  const upDirPath = path.resolve(context, '../');

  if (fs.existsSync(tempPath) && fs.lstatSync(tempPath).isDirectory()) {
    return tempPath;
  } else if (upDirPath === context) {
    return undefined;
  } else {
    return walkUpToFindNodeModulesPath(upDirPath);
  }
}

function isNodeModule (str) {
  return !str.match(/^\./);
}

module.exports = function (source) {
  this.cacheable && this.cacheable(true);

  const self = this;
  const regex = /@?import + ?((\w+) +from )?([\'\"])(.*?);?\3/gm;
  const importModules = /import +(\w+) +from +([\'\"])(.*?)\2/gm;
  const importFiles = /import +([\'\"])(.*?)\1/gm;
  const importSass = /@import +([\'\"])(.*?)\1/gm;
  const resourceDir = path.dirname(this.resourcePath);

  const nodeModulesPath = walkUpToFindNodeModulesPath(resourceDir);

  function replacer (match, fromStatement, obj, quote, filename) {
    const modules = [];

    if (!filename.match(/\*/)) return match;

    const globRelativePath = filename.match(/!?([^!]*)$/)[1];
    const prefix = filename.replace(globRelativePath, '');
    let cwdPath;

    if (isNodeModule(globRelativePath)) {
      if (!nodeModulesPath) {
        self.emitError(new Error("Cannot find node_modules directory."));
        return match;
      }

      cwdPath = nodeModulesPath;
    } else {
      cwdPath = resourceDir;
    }

    let result = glob
      .sync(globRelativePath, {
        cwd: cwdPath
      })
      .map((file, index) => {
        const fileName = quote + prefix + file + quote;

        if (match.match(importSass)) {
          return `@import ${fileName}`;

        } else if (match.match(importModules)) {
          const moduleName = obj + index;
          modules.push(`{fileName: ${fileName}, module: ${moduleName}}`);
          return `import * as ${moduleName} from ${fileName}`;

        } else if (match.match(importFiles)) {
          return `import ${fileName}`;

        } else {
          self.emitWarning(`Unknown import: "${match}"`);
        }
      })
      .join('; ');

    if (result && modules.length) {
      result += `; const ${obj} = [${modules.join(', ')}]`;
    }

    if (!result) {
      self.emitWarning(`Empty results for "${match}"`);
    }

    return result;
  }

  return source.replace(regex, replacer);
};
