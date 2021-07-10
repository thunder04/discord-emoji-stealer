import { mkdir, writeFile } from 'fs/promises';
import { createInterface } from 'readline'
import { existsSync } from 'fs';
import * as i18n from './i18n';
import req from 'petitio'

const DIRECTORY = process.cwd() + '/emojis'

//From https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
const forbiddenPattern = /[/\\:!<>"|?*\u0000-\u001F\n]+|(?:(COM|LPT)[1-9])+|CON|PRN|AUX|NUL|[\s.]+$/g
const $Interface = createInterface(process.stdin, process.stdout);
const askQuestion = (question: string) => new Promise<string>(resolve => $Interface.question(question + '\n', resolve))
    , checkCancel = (answer: string) => answer.toLowerCase() === 'cancel' ? process.exit(0) : void 0
    , isInvalidRequest = (code: number | null) => !code ? true : `${code}`[0] !== '2' || code === 204;

console.log(`Type "cancel" to exit anytime.`)

const token = await askQuestion(i18n.STEP_1).then((answer) => answer.trim().replace(/^['"]+|['"]+$/g, ''))
checkCancel(token)

const testRes = await req(`https://discord.com/api/v9/users/@me`, 'GET').header('authorization', token).send()
    .then(res => !isInvalidRequest(res.statusCode))
    .catch(() => false)
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
    if (!fetched) i18n.THROW_REQUEST_ERROR()
    guilds = fetched!
} else {
    const guildIDsString = await askQuestion(i18n.STEP_3)
    checkCancel(guildIDsString)

    const parsed = guildIDsString.match(/\d{16,}/g)
    if (!parsed) i18n.THROW_GUILD_PARSE_ERROR()
    guilds = parsed!.map(id => ({ id }))
}

$Interface.close()
for (const { id, name } of guilds) {
    const guild = await fetchGuildEmojis(id, token)
    if (!guild) {
        console.warn(i18n.NO_ACCESS(name || id))
        continue
    } else if (!guild.emojis.length) continue

    console.log(`Found ${guild.emojis.length} emoji${guild.emojis.length !== 1 ? 's' : ''} from ${guild.name ? `${guild.name} (${guild.id})` : guild.id}`)

    await Promise.all([
        new Promise(resolve => setTimeout(resolve, 1000)),
        Promise.all(guild.emojis.map(emoji => processEmoji(emoji, guild.name || id))),
    ]).catch(() => null)
}

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

async function processEmoji({ name, id, animated }: PartialEmoji, foldername: string) {
    const format = animated ? 'gif' : 'png'

    name = `${(name || id).replace(forbiddenPattern, '').trim()}`
    const dir = `${DIRECTORY}/${foldername.replace(forbiddenPattern, '').trim()}`

    const response = await req(`https://cdn.discordapp.com/emojis/${id}.${format}`).send()
    if (isInvalidRequest(response.statusCode)) return

    var filepath = `${dir}/${name}.${format}`, counter = 0
    while (existsSync(filepath)) filepath = `${dir}/${++counter}-${name}.${format}`

    console.log(filepath)
    await mkdir(dir, { recursive: true }).then(() => writeFile(filepath, response.body))
}