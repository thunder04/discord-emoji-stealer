const request = require("./request")

/**
 * 
 * @returns {Promise<Record<string, {name: string, id: string}>[]>}
 */
module.exports = async function getGuilds() {
    const res = await request( `https://discord.com/api/users/@me/guilds` )
    if ( !res ) {
        console.error(`Couldn't fetch guilds. Ensure that your token is valid.`)
        process.exit( 0 )
    }
    return res
}