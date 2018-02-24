const fs = require('fs');
const { JSDOM } = require('jsdom');
const _ = require('lodash');
const { table } = require('table');

function generateTimezones(sourceFilename, parseTimezone) {
    const data = getTimezones(sourceFilename, parseTimezone);
    const output = table(data.map(d => [d.id, d.name]));
    writeTableDataToFile(sourceFilename, output);
}

function writeTableDataToFile(filename, data) {
    const stream = fs.createWriteStream(`./timezones/${filename}.txt`, 'utf-8');
    stream.write(data);
    stream.close();
}

function getTimezones(sourceFilename, parseTimezone) {
    const content = fs.readFileSync(`./timezones/${sourceFilename}.html`, 'utf-8');
    const data = parseTimezone(content);
    return data;
}

function parseGoogleTimezone(content) {
    const dom = new JSDOM(content);
    return [...dom.window.document.querySelectorAll('div[jsname="wQNmvb"]')].map(div => {
        const id = div.getAttribute('data-value');
        const name = div.querySelector('content').textContent;
        return {id, name};
    });
}

function parseLMTimezone(content) {
    const dom = new JSDOM(content);
    return [...dom.window.document.querySelectorAll('option')].map(div => {
        const id = div.getAttribute('value');
        const name = div.textContent;
        return {id, name};
    });
}

function parseAllTimezone(content) {
    return content.split('\r\n').map(row => { 
        const data = _.compact(row.split('\t'));
        return {id: data[0].trim(), name: data[1].trim()};
    });  
}

function nameOrDefault(content, d = '') {
    return _.isUndefined(content) ? d : content.name;
}

function csv(rows) {
    return rows.map(row => row.map(s => s.includes(' ') ? `"${s}"` : s).join(',')).join('\r\n');
}

function compare(all, lm, g, matchedOnly = true, useCsv=true) {
    const result = [['id', 'logicmonitor', 'google']];
    for(let item of [...all]) {
        const lmItem = _.find(lm, t => t.id === item.id);
        const gItem = _.find(g, t => t.id === item.id);
        if(matchedOnly && _.isUndefined(lmItem) && _.isUndefined(gItem)) {
            continue;
        }
        result.push([item.id, nameOrDefault(lmItem), nameOrDefault(gItem)]);
    }

    let filename = matchedOnly ? 'compare_matched' : 'compare_all';
    if(useCsv) filename += '_csv';

    const output = useCsv ? csv(result) : table(result);
    return writeTableDataToFile(filename, output)
}

function compareAndSort(all, lm, g, useCsv) {
    const result = [];
    for(let item of [...all]) {
        const lmItem = _.find(lm, t => t.id === item.id);
        const gItem = _.find(g, t => t.id === item.id);
        if(_.isUndefined(lmItem) && _.isUndefined(gItem)) {
            continue;
        }

        const lmName = nameOrDefault(lmItem);
        const gName = nameOrDefault(gItem);
        const mergedName = gName || lmName;
        result.push([item.id, lmName, gName, mergedName]);
    }

    result.sort((a, b) => {
        const t1 = getUTC(a[3]) || getGMT(a[3]);
        const t2 = getUTC(b[3]) || getGMT(b[3]);
        if(_.isNil(t1) && _.isNil(t2)) return 0;
        if(_.isNil(t1) && !_.isNil(t2)) return -1;
        if(!_.isNil(t1) && _.isNil(t2)) return 1;
        return +(t1.replace(':', '')) - +(t2.replace(':', ''));
    });

    result.forEach(row => {
        const timezone = row[3];
        const utc = getUTCExpr(timezone);
        if(!_.isNull(utc)) {
            row[3] = row[3].replace(utc, `(${utc})`);
            row[3] = row[3].replace('UTC', 'GMT');
        }
    });

    let filename = 'compare_matched_sort';
    if(useCsv) filename += '_csv';

    const output = useCsv ? csv(result) : table(result);
    return writeTableDataToFile(filename, output)
}

function getUTC(str) {
    if(str == 'GMT') str = 'UTC-00:00 ';
    const matches = str.match(/(?<=UTC)[\-|\+\d|:]+(?= )/g);
    return matches === null ? null : matches[0];
}

function getUTCExpr(str) {
    if(str == 'GMT') str = 'UTC-00:00';
    const matches = str.match(/UTC[\-|\+\d|:]+(?= )/g);
    return matches === null ? null : matches[0];
}

function getGMT(str) {
    if(str == 'UTC') str = '(GMT+00:00)';
    const matches = str.match(/(?<=GMT)[\+|\-|\d|:]+(?=\))/g);
    return matches === null ? null : matches[0];
}

/** generate formatted timezones */
// generateTimezones('gtimezones', parseGoogleTimezone);
// generateTimezones('lmtimezones', parseLMTimezone);
// generateTimezones('alltimezones', parseAllTimezone);

const lmTimezones = getTimezones('lmtimezones', parseLMTimezone);
const gTimezones = getTimezones('gtimezones', parseGoogleTimezone);
const allTimezones = getTimezones('alltimezones', parseAllTimezone);
//compare(allTimezones, lmTimezones, gTimezones, true, true);
compareAndSort(allTimezones, lmTimezones, gTimezones, true);