import { createInterface } from 'readline'
import { writeFile } from 'fs/promises';
import * as i18n from './i18n'
import req from 'petitio'

const $Interface = createInterface(process.stdin, process.stdout);
const askQuestion = (question: string) => new Promise<string>(resolve => $Interface.question(question + '\n', resolve))
    , checkCancel = (answer: string) => answer.toLowerCase() === 'cancel' ? process.exit(0) : void 0
    , isInvalidRequest = (code: number | null) => !code ? true : `${code}`[0] !== '2' || code === 204;

(async function () {
    console.log(`Type "cancel" to exit anytime.`)

    const token = await askQuestion(i18n.STEP_1).then((answer) => answer.trim().replace(/^['"]+|['"]+$/g, ''))
    checkCancel(token)

    const testRes = await req(`https://discord.com/api/v9/users/@me`, 'GET').header('authorization', token).send().then(res => !isInvalidRequest(res.statusCode)).catch(() => false)
    if (!testRes) {
        console.log(i18n.INVALID_TOKEN)
        process.exit(0)
    }

    const modeString = await askQuestion(i18n.STEP_2)
    checkCancel(modeString)

    var mode = parseInt(modeString)
    if (isNaN(mode) || mode < 1 || mode > 3) mode = 1
    if (mode === 3) process.exit(0)

    var guilds: PartialGuild[]

    if (mode === 1) {
        const fetched = await fetchGuilds(token)
        if (!fetched) return i18n.THROW_REQUEST_ERROR()
        guilds = fetched
    } else {
        const guildIDsString = await askQuestion(i18n.STEP_3)
        checkCancel(guildIDsString)

        const parsed = guildIDsString.match(/\d{16,}/g)
        if (!parsed) return i18n.THROW_GUILD_PARSE_ERROR()
        guilds = parsed.map(id => ({ id }))
    }

    $Interface.close()
    for (const { id, name } of guilds) {
        const guild = await fetchGuildEmojis(id, token)
        if (!guild) {
            console.warn(i18n.NO_ACCESS(name || id))
            continue
        } else if (!guild.emojis.length) continue

        await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1000)),
            Promise.all(guild.emojis.map(processEmoji)),
        ])
    }

    process.exit(0)
})();

interface PartialGuild {
    name?: string
    id: string
}

interface PartialEmoji {
    animated?: boolean
    name?: string
    id: string
}


async function fetchGuildEmojis(guildID: string, token: string) {
    const res = await req(`https://discord.com/api/v9/guilds/${guildID}/preview`, 'GET').header('authorization', token).send()
    if (isInvalidRequest(res.statusCode)) return null
    return res.json<PartialGuild & { emojis: PartialEmoji[] }>()
}

//TODO: Add pagination (https://discord.com/developers/docs/resources/user#get-current-user-guilds)
async function fetchGuilds(token: string) {
    const res = await req(`https://discord.com/api/v9/users/@me/guilds`, 'GET').header('authorization', token).send()
    if (isInvalidRequest(res.statusCode)) return null
    return res.json<PartialGuild[]>()
}

async function processEmoji({ name, id, animated }: PartialEmoji) {
    console.log(name, id, animated)
}