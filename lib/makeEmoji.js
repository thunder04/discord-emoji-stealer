const { existsSync, mkdirSync, writeFileSync } = require( "fs" ),
    decancerName = require( "./decancerName" ),
    basePath = `${__dirname}/../emojis`,
    centra = require( "centra" ),
    emojiURL = ( id, animated ) => `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;

/**
 * @param {string} name 
 * @param {string} ID 
 * @param {boolean} animated 
 * @param {string} folderName
 * @returns {boolean}
 */
module.exports = function makeEmoji( name, ID, animated, folderName ) {
    folderName = decancerName( folderName )
    name = decancerName( name )

    const dir = `${basePath}/${folderName}`,
        format = animated ? 'gif' : 'png',
        filename = `${name}.${format}`

    if ( !existsSync( dir ) ) mkdirSync( dir )
    const buf = await centra( emojiURL( ID, animated ) ).send().then( res => res.statusCode === 200 ? res.body : null )
    if ( !buf || !buf.length ) return false

    let filepath = `${dir}/${filename}`,
        counter = 0
    while ( existsSync( filepath ) ) filepath = `${dir}/${counter++}-${filename}`

    writeFileSync( filepath, buf )
    return true
}