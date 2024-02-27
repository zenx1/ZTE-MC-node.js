import cookie from 'cookie';
import utils from './utils.js';
import Client from './client.js';
const infoRequestParameters = utils.loadJSONFile('./info-request-parameters.json');

class Router {
    #host
    #password
    #client

    constructor(host, password) {
        this.#host = host;
        this.#password = password;
        this.#client = new Client(host);
    }

    #getLD = async () => (
        await this.#client.get({
            cmd: 'LD'
        }).json()
    ).LD;

    #getRD = async () => (
        await this.#client.get({
            cmd: 'RD'
        }).json()
    ).RD;

    #getAD = async () => {
        const wa_inner_version = await this.getVersion();

        if (!wa_inner_version) {
            return;
        }

        const is_mc888 = wa_inner_version.includes('MC888');
        const is_mc889 = wa_inner_version.includes('MC889');

        const hash_function = (is_mc888 || is_mc889) ? utils.sha256 : utils.md5;

        const result = hash_function(hash_function(wa_inner_version) + await this.#getRD());

        return result;
    }

    #getCookie = async () => cookie.parse(
        (
            await this.#client.post({
                goformId: 'LOGIN',
                password: utils.sha256(utils.sha256(this.#password) + await this.#getLD())
            }).headers()
        ).getSetCookie()[0]
    ).stok;

    getVersion = async () => (
        await this.#client.get({
            cmd: 'wa_inner_version'
        }).json()
    ).wa_inner_version;

    getInfo = async () => this.#client.get({
        cmd: utils.encodeArrayParameters(infoRequestParameters.zteInfo),
        multi_data: 1
    }, {
        Host: this.#host,
        Referer: `${this.#client.baseURL}index.html`,
        Cookie: await this.#getCookie()
    }).json();

    getInfo2 = async () => this.#client.get({
        sms_received_flag_flag: 0,
        sts_received_flag_flag: 0,
        multi_data: 1,
        cmd: utils.encodeArrayParameters(infoRequestParameters.zteInfo2)
    }, {
        Host: this.#host,
        Referer: `${this.#client.baseURL}index.html`,
        Cookie: await this.#getCookie()
    }).json();

    reboot = async () => this.#client.post({
        goformId: 'REBOOT_DEVICE',
        AD: await this.#getAD()
    }, {
        Cookie: await this.#getCookie()
    }).json();

    sms = {
        getInfo: async () => this.#client.get({
            cmd: 'sms_capacity_info'
        }, {
            Host: this.#host,
            Referer: `${this.#client.baseURL}index.html`,
            Cookie: await this.#getCookie()
        }).json(),

        getMessages: async () => await this.#client.get({
            cmd: 'sms_data_total',
            page: 0,
            data_per_page: 5000,
            mem_store: 1,
            tags: 10,
            order_by: 'order+by+id+desc'
        }, {
            Cookie: await this.#getCookie()
        }).text().then(responseBody =>
            JSON.parse(
                // local operator sends 'DEVICE CONTROL ONE' character as a part of their phone number, which breaks json parsing so it needs to be removed 
                responseBody.split(String.fromCodePoint(17)).join(' ')
            ).messages.map(message => ({
                ...message,
                content: utils.decodeMessage(message.content),
                date: utils.decodeDateTime(message.date)
            }))
        ),

        sendMessage: async (phoneNumber, message) => await this.#client.post({
            goformId: 'SEND_SMS',
            notCallback: true,
            Number: phoneNumber,
            sms_time: utils.currentDateTimeEncoded,
            MessageBody: utils.encodeMessage(message),
            ID: -1,
            encode_type: 'GSM7_default',
            AD: await this.#getAD()
        }, {
            Cookie: await this.#getCookie()
        }).json(),

        deleteMessage: async (msg_id) => this.#client.post({
            goformId: 'DELETE_SMS',
            AD: await this.#getAD(),
            msg_id
        }, {
            Cookie: await this.#getCookie()
        }).json()
    }
}

export default Router;