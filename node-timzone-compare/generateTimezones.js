const fs = require('fs');
const _ = require('lodash');
const { table } = require('table');
const {
    parseGoogleTimezone, 
    parseLMTimezone, 
    parseAllTimezone, 
    parseDuplication, 
    parseTimezoneOffsets,
    parseLMInUsingTimezones,
    parseUniqLMInUsingTimezones,
    parseAbbrs
} = require('./utils/contentParser')

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

function nameOrDefault(content, d = '') {
    return _.isUndefined(content) ? d : content.name;
}

function csv(rows) {
    console.log(rows);
    return rows.map(row => row.map(s => s.includes(' ') ? `"${s}"` : s).join(',')).join('\r\n');
}

function compare(all, lm, g, matchedOnly = true, useCsv = true) {
    const result = [
        ['id', 'logicmonitor', 'google']
    ];
    for (let item of [...all]) {
        const lmItem = _.find(lm, t => t.id === item.id);
        const gItem = _.find(g, t => t.id === item.id);
        if (matchedOnly && _.isUndefined(lmItem) && _.isUndefined(gItem)) {
            continue;
        }
        result.push([item.id, nameOrDefault(lmItem), nameOrDefault(gItem)]);
    }

    let filename = matchedOnly ? 'compare_matched' : 'compare_all';
    if (useCsv) filename += '_csv';

    const output = useCsv ? csv(result) : table(result);
    return writeTableDataToFile(filename, output)
}

function findGoogleItem(googleTimezones, id) {
    return _.find(googleTimezones, t => t.id === id);
}

function findLMItem(lmTimezones, id) {
    return _.find(lmTimezones, t => t.id === id);
}

function findAbbrs(abbrs, id) {
    const abbr = _.find(abbrs, t => t.id === id);
    if(_.isUndefined(abbr)) {
        return {id: id, sdt: '', dst: '', useDst: 'unknown'}
    } else return abbr;
}

function compareAndSort(all, lm, g, useCsv) {
    const result = [];
    const duplications = getTimezones('duplicated_timezone', parseDuplication);

    for (let item of [...all]) {
        const lmItem = _.find(lm, t => t.id === item.id);
        const gItem = findGoogleItem(g, item.id);
        if (_.isUndefined(lmItem) && _.isUndefined(gItem)) {
            continue;
        }

        const lmName = nameOrDefault(lmItem);
        let gName = nameOrDefault(gItem);

        if (gName === '') {
            const duplicationRow = duplications.find(d => d.includes(item.id));
            if (!_.isNil(duplicationRow)) {
                gName = _.first(_.compact(duplicationRow.map(d => {
                    const t = findGoogleItem(g, d);
                    return t ? t.name : '';
                })).filter(n => n !== ''));
            }
        }

        gName = gName || '';

        const mergedName = gName || lmName;
        result.push([item.id, lmName, gName, mergedName]);
    }

    result.sort((a, b) => {
        const t1 = getUTC(a[3]) || getGMT(a[3]);
        const t2 = getUTC(b[3]) || getGMT(b[3]);
        if (_.isNil(t1) && _.isNil(t2)) return 0;
        if (_.isNil(t1) && !_.isNil(t2)) return -1;
        if (!_.isNil(t1) && _.isNil(t2)) return 1;
        return +(t1.replace(':', '')) - +(t2.replace(':', ''));
    });

    result.forEach(row => {
        const timezone = row[3];
        const utc = getUTCExpr(timezone);
        if (!_.isNull(utc)) {
            row[3] = row[3].replace(utc, `(${utc})`);
            row[3] = row[3].replace('UTC', 'GMT');
        }
    });

    let filename = 'compare_matched_sort';
    if (useCsv) filename += '_csv';

    const output = useCsv ? csv(result) : table(result);
    return writeTableDataToFile(filename, output)
}

function getUTC(str) {
    if (str == 'GMT') str = 'UTC-00:00 ';
    const matches = str.match(/(?<=UTC)[\-|\+\d|:]+(?= )/g);
    return matches === null ? null : matches[0];
}

function getUTCExpr(str) {
    if (str == 'GMT') str = 'UTC-00:00';
    const matches = str.match(/UTC[\-|\+\d|:]+(?= )/g);
    return matches === null ? null : matches[0];
}

function getGMT(str) {
    if (str == 'UTC') str = '(GMT+00:00)';
    const matches = str.match(/(?<=GMT)[\+|\-|\d|:]+(?=\))/g);
    return matches === null ? null : matches[0];
}

function formattedTimeZoneName(item) {
    return `${item.id} (${item.name})`;
}

function findLMAlt(lmtzs, id, dups) {
    const dupRow = _.find(dups, r => r.includes(id));
    if (_.isUndefined(dupRow)) return [];

    const lmItems = _.filter(lmtzs, lmr => dupRow.includes(lmr.id));
    return lmItems || [];
}

function findOffset(id, timezoneOffsets) {
    if(id === 'GMT+2') return 2;

    const tzOffset = timezoneOffsets.find(offset => offset.id === id);
    if(_.isUndefined(tzOffset))
        console.log(id);

    return Number(tzOffset.offset);
}

function compareBasedOnGoogle(filename, gtzs, lmtzs, dups, tzoffsets) {
    const result = [
        ["ID", "Google Name", "LogicMonitor Name", "Offset"]
    ];
    for (let gtz of gtzs) {
        const tzOffset = findOffset(gtz.id, tzoffsets);
        let lmItems = findLMAlt(lmtzs, gtz.id, dups);
        let lmName = lmItems.map(i => formattedTimeZoneName(i)).join(', ');
        _.remove(lmtzs, i => lmItems.includes(i));

        const gtzName = gtz.name.includes(' ') ? `"${gtz.name}"` : gtz.name;
        result.push([gtz.id, gtz.name, lmName, tzOffset.toString()]);
    }

    const notMatchedResult = [...lmtzs.map(item => [item.id, item.name, findOffset(item.id, tzoffsets).toString()])];

    const output = csv(result);
    const output_notMatched = csv(notMatchedResult);
    writeTableDataToFile(filename, output);
    writeTableDataToFile(filename + '_not_matched', output_notMatched);
}

function compareCommonUsed(commonTimezones, googleTimezones, lmTimezones, tzoffsets, duplications, abbrs) {
    const result = [['ID', 'Google Name', 'LM Name', 'Account Count', 'Offset','Standard Time Abbr', 'Daylight Saving Abbr', 'Use Dst']];
    commonTimezones.map(tz => {
        const items = _.entries(tz);
        const id = items[0][0];
        const count = items[0][1].toString();
        let gtz = findGoogleItem(googleTimezones, id);
        
        if(!gtz) {
            const duplicationItems = duplications.find(row => row.includes(id));
            if(duplicationItems) {
                gtz = duplicationItems.map(di => findGoogleItem(googleTimezones, di)).find(item => !_.isUndefined(item));
            }
        }

        // console.log(gtz, !gtz, _.isUndefined(gtz));
        const gname = (gtz ? gtz.name : '');
        const lmtz = findLMItem(lmTimezones, id);
        const lmname = lmtz ? lmtz.name : '';
        const offset = findOffset(id, tzoffsets).toString();
        const abbr = findAbbrs(abbrs, id);

        const r = [id, gname, lmname, count, offset, abbr.sdt, abbr.dst, abbr.useDst]; 

        return r;
    }).forEach(tz => result.push(tz));

    result.sort((t1, t2) => Number(t1[4]) - Number(t2[4]));
    return result;
}

/** generate formatted timezones */
// generateTimezones('gtimezones', parseGoogleTimezone);
// generateTimezones('lmtimezones', parseLMTimezone);
// generateTimezones('alltimezones', parseAllTimezone);

const lmTimezones = getTimezones('lmtimezones', parseLMTimezone);
const gTimezones = getTimezones('gtimezones', parseGoogleTimezone);
const allTimezones = getTimezones('alltimezones', parseAllTimezone);
const duplications = getTimezones('duplicated_timezone', parseDuplication);
const timezoneOffsets = getTimezones('timezone_offsets', parseTimezoneOffsets);
const timezonesInUsing = getTimezones('lm_timezones_in_use', parseLMInUsingTimezones);
const timezoneAbbrs = getTimezones('timezone_abbrs', parseAbbrs);

//compare(allTimezones, lmTimezones, gTimezones, true, true);
//compareAndSort(allTimezones, lmTimezones, gTimezones, true);
// compareBasedOnGoogle('timezones-google-based', gTimezones, lmTimezones, duplications, timezoneOffsets);

// const list = compareCommonUsed(timezonesInUsing, gTimezones, lmTimezones, timezoneOffsets, duplications, timezoneAbbrs);
// const output = csv(list);
// writeTableDataToFile('common_used_timezones', output);

const gtzids = gTimezones.map(tz => {
    const id = tz.id;
    let name = tz.name;
    const nameStart = name.indexOf(') ')
    if(nameStart >= 0) {
        name = name.substr(nameStart + 2);
    }
    return {id, name};
});
const output = JSON.stringify(gtzids);
writeTableDataToFile('google_timezone_ids', output);