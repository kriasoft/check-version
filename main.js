/**
 * Check Version Action for GitHub
 * https://github.com/marketplace/actions/check-version
 */

const path = require("path");

// Set the action output values (name, version, release)
console.log(`::set-output name=name::${path}`);
