const centra = require("centra")

/**
 * 
 * @param {string} url 
 * @returns {Promise<Record<string, any> | null>}
 */
module.exports = async function request(url) {
    if (!url) return null
    const req = centra(url)
    if ( 'EMS_TOKEN' in process.env ) req.header( 'authorization', process.env['EMS_TOKEN'] )
    const res = await req.send().catch(() => null)
    return res && res.statusCode === 200 ? await res.json() : null
}