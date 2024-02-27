import cookie from 'cookie';

const buildQueryString = (params) => `?${new URLSearchParams(params).toString()}`;

class Client {
    constructor(host) {
        this.host = host;

        this.baseURL = `http://${host}/`;

        this.cmdUrl = {
            get: `${this.baseURL}goform/goform_get_cmd_process`,
            set: `${this.baseURL}goform/goform_set_cmd_process`
        };
    }

    #buildRequestHeaders = (headers) => ({
        Referer: this.baseURL,
        ...headers
    });

    #buildRequestBody = (parameters) => buildQueryString({
        isTest: false,
        ...parameters
    });

    #buildResponse = (request) => ({
        text: () => request.then(response => response.text()),
        json: () => request.then(response => response.json()),
        headers: () => request.then(response => response.headers),
        parseCookies: () => request.then(response =>
            response.headers.getSetCookie().map(cookies =>
                cookie.parse(cookies)
            )
        )
    });

    get(parameters, headers) {
        try {
            return this.#buildResponse(
                fetch(`${this.cmdUrl.get}${this.#buildRequestBody(parameters)}`, {
                    headers: this.#buildRequestHeaders(headers)
                })
            );
        } catch (ex) {
            console.log(ex);
        }
    }

    post(parameters, headers) {
        try {
            return this.#buildResponse(
                fetch(this.cmdUrl.set, {
                    method: 'POST',
                    headers: this.#buildRequestHeaders(headers),
                    body: this.#buildRequestBody(parameters)
                })
            )
        } catch (ex) {
            console.log(ex);
        }
    }
}

export default Client;