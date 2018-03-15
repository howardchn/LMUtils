const { JSDOM } = require('jsdom');
const _ = require('lodash');

function parseGoogleTimezone(content) {
    const dom = new JSDOM(content);
    return [...dom.window.document.querySelectorAll('div[jsname="wQNmvb"]')].map(div => {
        const id = div.getAttribute('data-value');
        const name = div.querySelector('content').textContent;
        return {
            id,
            name
        };
    });
}

function parseLMTimezone(content) {
    const dom = new JSDOM(content);
    return [...dom.window.document.querySelectorAll('option')].map(div => {
        const id = div.getAttribute('value');
        const name = div.textContent;
        return {
            id,
            name
        };
    });
}

function parseAllTimezone(content) {
    return content.split('\r\n').map(row => {
        const data = _.compact(row.split('\t'));
        return {
            id: data[0].trim(),
            name: data[1].trim()
        };
    });
}

function parseDuplication(content) {
    return [...content.split('\n').map(row => {
        const data = _.compact(row.split(','));
        return data;
    })];
}

function parseTimezoneOffsets(content) {
    return [...content.split('\n').map(row => {
        const data = _.compact(row.split('\t'));
        return {id: data[0], offset: data[1]};
    })];
}

function parseLMInUsingTimezones(content) {
    const tzgp = _.groupBy(content.split('\n').map(s => s.trim()).filter(s => !_.isNil(s) && !_.isEmpty(s) && !s.startsWith('SERVER:')), name => name);
    return _.entries(tzgp).map(i => { 
        return {[i[0]]: i[1].length} 
    });
}

function parseUniqLMInUsingTimezones(content) {
    return _.uniq(content.split('\n').map(s => s.trim()).filter(s => !_.isNil(s) && !_.isEmpty(s) && !s.startsWith('SERVER:')));
}

function parseAbbrs(content) {
    return content.split('\n').map(row => {
        const items = row.split('\t');
        return { id: items[0], dst: items[1], sdt: items[2], useDst: items[3] };
    });
}

module.exports = {
    parseGoogleTimezone, 
    parseLMTimezone, 
    parseAllTimezone, 
    parseDuplication, 
    parseTimezoneOffsets,
    parseLMInUsingTimezones,
    parseUniqLMInUsingTimezones,
    parseAbbrs
}