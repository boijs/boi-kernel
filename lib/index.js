'use strict';

const Config  = require('./config');
const Plugins = require('./plugin');
const Build   = require('./build');
const Server  = require('./server');
const Deploy  = require('./deploy');

module.exports = {
  spec           : Config.spec,
  runBuild       : Build.run,
  plugins        : Plugins.plugins,
  use            : Plugins.use,
  resolvePlugins : Plugins.resolvePlugins,
  PluginClass    : Plugins.classes,
  runServe       : Server.run,
  serve          : Server.config,
  mock           : Server.mock,
  deploy         : Deploy.config,
  runDeploy      : Deploy.run
};
