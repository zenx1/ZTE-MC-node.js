import { createHash } from 'crypto';
import { DateTime } from 'luxon';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { normalizeSync } from 'normalize-diacritics';
import gsmCodePoints from './gsm-code-points.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildFullPath = (fileName) => path.join(__dirname, fileName);

const utils = {
    sha256: str => createHash('sha256').update(str).digest('hex').toUpperCase(),

    md5: (str) => createHash('md5').update(str.toString('utf8')).digest('hex'),

    get currentDateTimeEncoded() {
        return DateTime.now().toFormat('yy;MM;dd;HH;mm;ss;+2');
    },

    decodeDateTime: (dateTimeString) => DateTime.fromFormat(dateTimeString.split(',').slice(0, -1).join(','), 'yy,MM,dd,HH,mm,ss').toJSDate(),

    encodeMessage: (message) => normalizeSync(message).split('').map(char => {        
        if (!gsmCodePoints.has(char.codePointAt(0))) {
            char = ' ';
        }
        return char.codePointAt(0).toString(16).padStart(4, '0');
    }).join(''),

    decodeMessage: (message) => message.match(/.{1,4}/g).map(codePoint =>
        String.fromCodePoint(parseInt(codePoint, 16))
    ).join(''),

    encodeArrayParameters: (arr) => encodeURIComponent(arr.join(',')),

    saveToJSONFile: (fileName, fileContent) => fs.writeFileSync(buildFullPath(fileName), JSON.stringify(fileContent, null, '\t'), 'utf8'),

    loadJSONFile: (fileName) => {
        try {
            return JSON.parse(fs.readFileSync(buildFullPath(fileName), { encoding: 'utf8', flag: 'r' }));
        } catch (ex) {
            console.log(ex);
        }
    }
};

export default utils;