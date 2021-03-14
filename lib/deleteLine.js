/**
 * @returns {void}
 */
module.exports = function deleteLine() {
    process.stdout?.clearLine( 0 )
    process.stdout?.cursorTo( 0 )
}