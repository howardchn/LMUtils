let fs = require('fs');
let _ = require('lodash');
let moment = require('moment-timezone-all');
let {timeZoneMappingToGoogle, missingTimezoneInGoogle} = require('./utils/timezoneMapping');

let content = fs.readFileSync('./timezones/lm_past_supported.txt', 'utf-8'); 
let tzids = content.split('\n').map(l => l.substr(0, l.indexOf(',')));

let checkNotSupported = function(tzid) {
    let current = moment.tz(tzid).tz();
    return current === undefined;
}

let unsupported_tzids = tzids.filter(checkNotSupported);
unsupported_tzids.forEach(tzid => {
    let newTzid = _.get(timeZoneMappingToGoogle, tzid);
    if(newTzid === undefined) {
        console.error('no matching time zone: ', tzid);
    } else if(checkNotSupported(newTzid)) {
        console.error('no matching time zone: ', tzid);        
    }
});