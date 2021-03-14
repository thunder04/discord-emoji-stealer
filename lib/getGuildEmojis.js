const request = require( "./request" )

/**
 * 
 * @param {string} ID 
 * @param {string=} name 
 * @returns {Promise<({name: string, id: string, data: any[]} | null)>}
 */
module.exports = async function getGuildEmojis( ID, name ) {
    const res = await request( `https://discord.com/api/guilds/${ID}/preview` )
    if ( !res ) return console.error( `Couldn't fetch emojis from ${name || ID}. Ensure that the ID is correct and you have access to it or the guild is public.` )
    return { name: res.name, id: res.id, data: res.emojis }
}