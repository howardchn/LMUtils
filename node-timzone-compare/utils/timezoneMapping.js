let timeZoneMappingToGoogle = {
    'ACT': 'Australia/Darwin',
    'AGT': 'America/Argentina/Buenos_Aires',
    'AST': 'America/Anchorage',
    'Asia/Kathmandu': 'Asia/Katmandu',
    'Asia/Rangoon': 'Asia/Yangon',
    'Australia/ACT': 'Australia/Sydney',
    'Australia/North': 'Australia/Darwin',
    'Australia/Queensland': 'Australia/Brisbane',
    'Australia/South': 'Australia/Adelaide',
    'Australia/West': 'Australia/Perth',
    'BST': 'Asia/Dhaka',
    'CNT': 'America/St_Johns',
    'CST': 'America/Chicago',
    'Canada/Atlantic': 'America/Halifax',
    'Canada/Central': 'America/Winnipeg',
    'Canada/East-Saskatchewan': 'America/Regina',
    'Canada/Eastern': 'America/Toronto',
    'Canada/Mountain': 'America/Edmonton',
    'Canada/Newfoundland': 'America/St_Johns',
    'Canada/Pacific': 'America/Vancouver',
    'Canada/Saskatchewan': 'America/Regina',
    'Canada/Yukon': 'America/Whitehorse',
    'EAT': 'Africa/Nairobi',
    'ECT': 'Europe/Paris',
    'Etc/GMT+2': 'Atlantic/South_Georgia',
    'Etc/GMT-10': 'Pacific/Port_Moresby',
    'Europe/Belfast': 'Europe/London',
    'GMT': 'Etc/GMT',
    'IST': 'Asia/Calcutta',
    'Israel': 'Asia/Jerusalem',
    'JST': 'Asia/Tokyo',
    'NET': 'Asia/Yerevan',
    'NST': 'Pacific/Auckland',
    'PLT': 'Asia/Karachi',
    'PRC': 'Asia/Shanghai',
    'PRT': 'America/Puerto_Rico',
    'PST': 'America/Los_Angeles',
    'Pacific/Samoa': 'Pacific/Pago_Pago',
    'SST': 'Pacific/Guadalcanal',
    'US/Arizona': 'America/Phoenix',
    'PNT': 'America/Phoenix',
    'US/Hawaii': 'Pacific/Honolulu',
    'VST': 'Asia/Saigon'
};
let missingTimezoneInGoogle = {
    'Australia/Eucla': {
        timezone: 'Australia/Eucla',
        displayText: 'Australia/Eucla',
        dst:'ACWDT',
        st:'ACWST'
    },
    'EST': {
        timezone: 'EST',
        displayText: 'Bogota',
        dst:'EDT',
        st:'EST'
    },
    'GMT+2': {
        timezone: 'GMT+2',
        displayText: 'Helsinki',
        dst:'EEST',
        st:'EET'
    },
    'HST': {
        timezone: 'HST',
        displayText: 'Hawaii',
        dst:'HDT',
        st:'HST'
    },
    'MST': {
        timezone: 'MST',
        displayText: 'Arizona',
        dst:'MDT',
        st:'MST'
    }
};

module.exports = {
    timeZoneMappingToGoogle,
    missingTimezoneInGoogle
}