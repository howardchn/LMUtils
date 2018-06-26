const moment = require('moment-timezone-all');
const tz = moment().tz('Asia/Hovt');
console.log(moment.tz.dataVersion);
console.log(tz.isDST());