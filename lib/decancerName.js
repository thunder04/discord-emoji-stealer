/**
 * 
 * @param {string} str 
 * @returns {string}
 */
module.exports = function decancerName( str ) {
    //From https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
    // eslint-disable-next-line no-control-regex
    return str.replace( /[/\\:!<>"|?*\u0000-\u001F\n]+|(?:(COM|LPT)[1-9])+|CON|PRN|AUX|NUL|[\s.]+$/g, '' ).trim()
        // Random "ID" in case there are any duplicates
        || `No name${Array.from( { length: 5 }, () => Math.floor( Math.random() * 9 ) ).join( '' )}`
}