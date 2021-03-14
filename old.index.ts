/* eslint-disable @typescript-eslint/no-explicit-any, no-control-regex */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import readline from 'readline'
import centra from 'centra'

/*
 * * CONSTANTS
 */

const rlInterface = readline.createInterface({ input: process.stdin, output: process.stdout }),
    asyncQuestion = (question: string): Promise<string> => new Promise(resolve => rlInterface.question(question, resolve)),
    makeRequest = (url: string): Promise<Record<string, any> | null> => centra(url).header('authorization', DATA.token).send().then(res => res.statusCode === 200 ? res.json() : null).catch(() => null),
    emojiURL = (id: string, animated: boolean) => `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`,
    basePath = `${__dirname}/emojis`

const LANGUAGES = {
    STEP_1: `Enter your user token or your bot's token prefixed with "Bot ". By using your user token, you risk your account to be disabled.\n`,
    STEP_2: `\nChoose a mode:\n[1]: Fetch from all available guilds. (default)\n[2]: Fetch from a specific guild.\n`,
    STEP_3: `\nProvide the guild ID you wish to download its emojis from. It can be either a public guild or a guild that you or the bot has access to.\n`,
    ERR_NO_GUILD: (name: string) => `Couldn't fetch emojis from ${name}. Ensure that the ID is correct and you have access to it or the guild is public.`,
    ERR_NO_GUILDS: `Couldn't fetch guilds. Ensure that your token is valid.`,
}

const DATA = {
    guildID: '',
    token: '',
    mode: NaN,
}

/*
 * * FUNCTIONS
 */

function decancerName(str: string) {
    //From https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
    return str.replace(/[/\\:!<>"|?*\u0000-\u001F\n]+|(?:(COM|LPT)[1-9])+|CON|PRN|AUX|NUL|[\s.]+$/g, '').trim()
        || `No name${Array.from({ length: 5 }, () => Math.floor(Math.random() * 9)).join('') /* Random "ID" in case there are any duplicates */}`
}

function deleteLine() {
    process.stdout?.clearLine(0)
    process.stdout?.cursorTo(0)
}

async function getGuilds() {
    const res = await makeRequest(`https://discord.com/api/users/@me/guilds`)
    if (!res) {
        console.error(LANGUAGES['ERR_NO_GUILDS'])
        process.exit(0)
    }
    return res as Record<string, any>[]
}

async function getGuildEmojis(ID: string, name?: string) {
    let res = await makeRequest(`https://discord.com/api/guilds/${ID}/emojis`)
    if (!res) res = (await makeRequest(`https://discord.com/api/guilds/${ID}/preview`))?.emojis
    if (!res) console.error(LANGUAGES['ERR_NO_GUILD'](name || ID))
    return res as Record<string, any>[]
}

async function makeEmoji(name: string, ID: string, animated: boolean, folderName: string) {
    folderName = decancerName(folderName)
    name = decancerName(name)

    const dir = `${basePath}/${folderName}`,
        format = animated ? 'gif' : 'png',
        filename = `${name}.${format}`

    if (!existsSync(dir)) mkdirSync(dir)
    const buf = await centra(emojiURL(ID, animated)).send().then(res => res.statusCode === 200 ? res.body : null)
    if (!buf?.length) return false

    let filepath = `${dir}/${filename}`,
        counter = 0
    while (existsSync(filepath)) filepath = `${dir}/${counter++}-${filename}`

    writeFileSync(filepath, buf)
    return true
}

//* Main function

(async function () {
    if (!existsSync(basePath)) mkdirSync(basePath)

    //Get the required data
    if (!DATA.token) DATA.token = (await asyncQuestion(LANGUAGES['STEP_1'])).trim()
    if (isNaN(DATA.mode)) DATA.mode = parseInt(await asyncQuestion(LANGUAGES['STEP_2']))
    if (isNaN(DATA.mode) || DATA.mode > 2 || DATA.mode < 1) DATA.mode = 1
    if (!DATA.guildID && DATA.mode === 2) DATA.guildID = (await asyncQuestion(LANGUAGES['STEP_3'])).trim()

    rlInterface.close()

    if (DATA.mode === 1) {
        const guilds = await getGuilds()
        for (const { id: guildID, name: guildName } of guilds) {
            const guildEmojis = await getGuildEmojis(guildID, guildName)
            if (!guildEmojis) continue

            let totalEmojis = guildEmojis.length
            console.info(`Found ${totalEmojis} emojis from ${guildName}`)

            for (const { animated, name, id } of guildEmojis) {
                const res = await makeEmoji(name, id, animated, guildName)
                if (!res) console.info(`\t❌  Couldn't download "${name}"`)
                else {
                    deleteLine()
                    process.stdout.write(`\t✅  Downloaded ${name}  •  ${totalEmojis-- - 1} left${!totalEmojis ? '\n' : ''}`)
                }
            }
        }
    } else {
        const guildEmojis = await getGuildEmojis(DATA.guildID)
        if (!guildEmojis) process.exit(0)

        let totalEmojis = guildEmojis.length
        console.info(`Found ${totalEmojis} emojis from ${DATA.guildID}`)

        for (const { animated, name, id } of guildEmojis) {
            const res = await makeEmoji(name, id, animated, DATA.guildID)
            if (!res) console.info(`\t❌  Couldn't download "${name}"`)
            else {
                deleteLine()
                process.stdout.write(`\t✅  Downloaded ${name}  •  ${totalEmojis-- - 1} left${!totalEmojis ? '\n' : ''}`)
            }
        }
    }
})()