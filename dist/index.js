"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const i18n = __importStar(require("./i18n"));
const petitio_1 = __importDefault(require("petitio"));
const $Interface = readline_1.createInterface(process.stdin, process.stdout);
const askQuestion = (question) => new Promise(resolve => $Interface.question(question + '\n', resolve)), checkCancel = (answer) => !answer || answer.toLowerCase() === 'cancel' ? process.exit(0) : void 0, isInvalidRequest = (code) => !code ? true : `${code}`[0] !== '2' || code === 204;
(async function () {
    console.log(`Type "cancel" to exit anytime.`);
    const token = await askQuestion(i18n.STEP_1).then((answer) => answer.trim().replace(/^['"]+|['"]+$/g, ''));
    checkCancel(token);
    const modeString = await askQuestion(i18n.STEP_2);
    checkCancel(modeString);
    var mode = parseInt(modeString);
    if (isNaN(mode) || mode < 1 || mode > 3)
        mode = 1;
    if (mode === 3)
        process.exit(0);
    var guilds;
    if (mode === 1) {
        const fetched = await fetchGuilds(token);
        if (!fetched)
            return i18n.THROW_REQUEST_ERROR();
        guilds = fetched;
    }
    else {
        const guildIDsString = await askQuestion(i18n.STEP_3);
        checkCancel(guildIDsString);
        const parsed = guildIDsString.match(/\d{16,}/g);
        if (!parsed)
            return i18n.THROW_GUILD_PARSE_ERROR();
        guilds = parsed.map(id => ({ id }));
    }
    for (const { id, name } of guilds) {
        const guild = await fetchGuildEmojis(id, token);
        if (!guild) {
            console.warn(`I couldn't fetch the server ${`${name} (${id})` || id}. You might have been ratelimitted, you might not have permission to access the server or the token is invalid.`);
            continue;
        }
        //Manage emojis
        console.log((guild.name || guild.id) + `  ${guild.emojis.length}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    process.exit(0);
})();
async function fetchGuildEmojis(guildID, token) {
    const res = await petitio_1.default(`https://discord.com/api/v9/guilds/${guildID}/preview`, 'GET').header('authorization', token).send();
    if (isInvalidRequest(res.statusCode))
        return null;
    return res.json();
}
//TODO: Add pagination (https://discord.com/developers/docs/resources/user#get-current-user-guilds)
async function fetchGuilds(token) {
    const res = await petitio_1.default(`https://discord.com/api/v9/users/@me/guilds`, 'GET').header('authorization', token).send();
    if (isInvalidRequest(res.statusCode))
        return null;
    return res.json();
}
async function parseGuild({ emojis, name, id }) {
}
