const readline = require( "readline" )
const { existsSync, mkdirSync } = require( "fs" )
const { getGuilds, makeEmoji, deleteLine, getGuildEmojis } = require( "./lib" )
const rlInterface = readline.createInterface( { input: process.stdin, output: process.stdout } )
const asyncQuestion = ( question ) => new Promise( resolve => rlInterface.question( question, resolve ) )

const LANGUAGES = {
    STEP_1: `Enter your user token or your bot's token prefixed with "Bot ". By using your user token, you risk your account to be disabled.\n`,
    STEP_2: `\nChoose a mode:\n[1]: Fetch from all available guilds. (default)\n[2]: Fetch from a specific guild.\n`,
    STEP_3: `\nProvide the guild ID you wish to download its emojis from. It can be either a public guild or a guild that you or the bot has access to.\n`,
}

process.env[ 'EMS_BASEPATH' ] = `${__dirname}/emojis`;

( async function () {
    if ( !existsSync( process.env[ 'EMS_BASEPATH' ] ) ) mkdirSync( process.env[ 'EMS_BASEPATH' ] )
    let mode, guildID

    //Get the required data
    process.env[ 'EMS_TOKEN' ] = ( await asyncQuestion( LANGUAGES[ 'STEP_1' ] ) ).trim().replace(/^('|")+|('|")+$/g, '')
    mode = parseInt( await asyncQuestion( LANGUAGES[ 'STEP_2' ] ) )
    if ( isNaN( mode ) || mode > 2 || mode < 1 ) mode = 1

    if ( mode === 2 ) guildID = ( await asyncQuestion( LANGUAGES[ 'STEP_3' ] ) ).trim()
    rlInterface.close()

    if ( mode === 1 ) {
        for ( const { id: guildID, name: guildName } of await getGuilds() ) {
            let guildEmojis = await getGuildEmojis( guildID, guildName )
            if ( !guildEmojis ) continue

            let totalEmojis = guildEmojis.data.length
            console.info( `Found ${totalEmojis} emojis from ${guildName}` )

            for ( const { animated, name, id } of guildEmojis.data ) {
                const res = await makeEmoji( name, id, animated, guildName )
                if ( !res ) console.info( `\t❌  Couldn't download "${name}"` )
                else {
                    deleteLine()
                    process.stdout.write( `\t✅  Downloaded ${name}  •  ${totalEmojis-- - 1} left${!totalEmojis ? '\n' : ''}` )
                }
            }
        }
    } else {
        const guildEmojis = await getGuildEmojis( guildID )
        if ( !guildEmojis ) process.exit( 0 )

        let totalEmojis = guildEmojis.data.length
        console.info( `Found ${totalEmojis} emojis from ${guildEmojis.name}` )

        for ( const { animated, name, id } of guildEmojis.data ) {
            const res = await makeEmoji( name, id, animated, guildEmojis.name )
            if ( !res ) console.info( `\t❌  Couldn't download "${name}"` )
            else {
                deleteLine()
                process.stdout.write( `\t✅  Downloaded ${name}  •  ${totalEmojis-- - 1} left${!totalEmojis ? '\n' : ''}` )
            }
        }
    }
} )()
