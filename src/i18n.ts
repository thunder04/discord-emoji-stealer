export const STEP_1 = [
    `Enter your user token or your bot's token prefixed with "Bot ".`,
    `By using your user token, you risk your account to be disabled.`,
].join('\n\t')

export const STEP_2 = [
    `Choose a mode:`,
    `[1]: Fetch from all the available servers. (default)`,
    `[2]: Fetch from specific servers.`,
    `[3]: I reconsidered my life choices, forget it.`,
].join('\n\t')

export const STEP_3 = [
    `Provide the servers IDs you wish to downloads its emojis from separated by a comma (,). A server can be either one:`,
    `You or the bot has access to`,
    `A public server`
].join('\n\t • ')

export const THROW_REQUEST_ERROR = () => {
    console.error([
        `I couldn't fetch data from the API.`,
        `Make sure your token is valid.`
    ].join('\n\t'))
    process.exit(0)
}

export const THROW_GUILD_PARSE_ERROR = () => {
    console.error([
        `I couldn't parse any of the guilds you provided.`,
        `Try to mention some next time.`
    ].join('\n\t'))
    process.exit(0)
}