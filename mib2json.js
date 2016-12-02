#!/usr/bin/env node

/**
 * Executable to convert
 *
 *
 *
 */

Mib = require('./lib/mib');

mib = Mib();
module.exports = mib;

mib.LoadMIBs();

function main(args) {
  if ( ! args.length > 1 ) {
    console.warn("USAGE: mib2json path/to//MY-MIB [MY-DEFS-MIB]");
    process.exit(1);
  }

  var filePath = args[2];

  mib.Import(filePath);
  mib.Serialize();

  var mibName = args[3] || filePath.split('//')[1].replace('.','-');
  var module = mib.Modules[mibName];
  if ( ! module ) {
    console.error("Couldn't find module named %s, specify as second arg", mibName);
    process.exit(1);
  }

  process.stdout.write(
    JSON.stringify(module, null, 2));
}

if ( require.main === module ) {
  main(process.argv);
  process.exit(0);
}


