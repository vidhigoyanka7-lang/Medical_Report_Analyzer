// Tiny logger that adds a module prefix like [DB], [AUTH], [REPORT] so
// it is easy to see which part of the app produced a message.
// Never pass passwords, tokens or API keys to these functions.
const make = (level) => (tag, message, extra) => {
  const line = `[${tag}] ${message}`
  if (extra !== undefined) console[level](line, extra)
  else console[level](line)
}

module.exports = {
  info:  make('log'),
  warn:  make('warn'),
  error: make('error'),
}
