#!/usr/bin/env node

/**
 * Executable that parses a MIB and outputs OID definitions as JSON format.
 * USAGE:
 *
 *     mib2json path/to/MY-DEFS.MIB [MY-DEFS-MIB]
 *
 * Outputs pretty-formatted json to stdout.  If the MIB could not be found
 * or parsed, this will exit with a `1` status code.
 */

var path = require('path');
var Mib = require('./lib/mib');

var mib = Mib();

/* this is necessary because type & macro definitions are almost certainly
 * being used from Smiv2, etc
 */
mib.LoadMIBs();
var defaultMibs = Object.keys(mib.Modules);

module.exports = mib;

/**
 * NOTE: no idea why but the original author requires the path + filename
 * to use
 */
function main(args) {
  if ( ! args.length > 1 ) {
    console.warn("USAGE: mib2json path/to/MY-DEFS.MIB [MY-DEFS-MIB]");
    process.exit(1);
  }

  var filePath = args[2];
  // for some reason the original author wanted the path/file to be separated by
  // *two* slashes...  So we will take a valid path and 'fix' it.
  var pathname = path.dirname(filePath);
  var filename = path.basename(filePath);
  filePath = [pathname, filename].join('//');

  // import and parse the new MIB definition:
  mib.Import(filePath);
  mib.Serialize();

  var newMib = args[3];
  if ( ! newMib )  { // attempt to guess MIB defs name if it wasn't given
    var newMibs = inferNewMIB(mib);

    if ( newMibs.length < 1 ) {
      console.error('No new MIB definition found!');
      process.exit(1);
    }

    if (newMibs.length > 1 ) {
      console.error('Multiple MIB definitions found!  Please specify MIB name as second arg:')
      for ( var i in newMibs )
        console.warn('   ', newMibs[i]);
      process.exit(1);
    }

    newMib = newMibs[0];
  }

  var module = mib.Modules[newMib];

  if ( ! module ) {
    console.error("Couldn't find module named %s after parsing MIB!", newMib);
    process.exit(1);
  }

  process.stdout.write(
    JSON.stringify(module, null, 2));
}

function inferNewMIB(mib) {
  // find the new MIB by removing all of the default ones:
  for ( var i in defaultMibs ) {
    delete mib.Modules[defaultMibs[i]]
  }

  return Object.keys(mib.Modules);
}


if ( require.main === module ) {
  main(process.argv);
  process.exit(0);
}


