// Node's server-render tests need class-name mappings, not a browser stylesheet.
// Next.js still compiles the real CSS for builds and browser verification.
const { readFileSync } = require('node:fs')

require.extensions['.css'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8')
  const names = [...source.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((match) => match[1])
  module.exports = Object.fromEntries(names.map((name) => [name, name]))
}
