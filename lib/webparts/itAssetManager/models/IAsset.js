var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Valid next states from each state
export var ASSET_STATUS_TRANSITIONS = {
    Procured: ['Stock'],
    Stock: ['Active', 'Scrapped'],
    Active: ['Repair', 'Gifted', 'Lost', 'Stolen'],
    Repair: ['Active', 'Scrapped'],
    Gifted: [],
    Lost: ['Active'],
    Stolen: ['Active'],
    Scrapped: ['Disposed'],
    Disposed: [],
};
// States that require a mandatory note
export var STATUS_REQUIRES_NOTE = ['Lost', 'Stolen', 'Gifted', 'Disposed'];
export var ASSET_TYPE_LABELS = {
    // Current codes
    MAC: 'MacBook',
    LAP: 'Laptop',
    DSK: 'Desktop',
    TAB: 'Tablet',
    PHN: 'Mobile Phone',
    MON: 'Monitor',
    KBD: 'Keyboard',
    MOS: 'Mouse',
    CAM: 'Webcam / Camera',
    AVC: 'Audio/Video Conferencing Device',
    LND: 'Landline / IP Phone',
    HST: 'Headset',
    TVD: 'TV / Large-format Display',
    PRJ: 'Projector',
    SWT: 'Network Switch',
    FWL: 'Firewall',
    WAP: 'Wireless Access Point',
    RTR: 'Router',
    SRV: 'Server',
    UPS: 'UPS / Power Device',
    OTH: 'Other IT Hardware',
    // Legacy codes (backward compat — for assets created before ZRX naming convention)
    DTP: 'Desktop',
    DOC: 'Docking Station',
    MOB: 'Mobile Phone',
    NET: 'Network Device',
    ACC: 'Accessory',
};
// New asset type codes (excludes legacy codes — used in add/edit dropdowns)
export var NEW_ASSET_TYPES = [
    'MAC', 'LAP', 'DSK', 'TAB', 'PHN', 'MON', 'KBD', 'MOS', 'CAM',
    'AVC', 'LND', 'HST', 'TVD', 'PRJ', 'SWT', 'FWL', 'WAP', 'RTR',
    'SRV', 'UPS', 'OTH',
];
// All known asset type codes (new + legacy — used in filter dropdowns)
export var ALL_ASSET_TYPES = __spreadArray(__spreadArray([], NEW_ASSET_TYPES, true), [
    'DTP', 'DOC', 'MOB', 'NET', 'ACC',
], false);
// Country options
export var COUNTRY_OPTIONS = [
    { key: 'IN', text: 'India (IN)' },
    { key: 'US', text: 'United States (US)' },
];
// Site / Office Code options per country
export var OFFICE_OPTIONS = {
    IN: [
        { key: 'GIC', text: 'GIC — Global Infocity, Chennai' },
        { key: 'UWB', text: 'UWB — UrbanWrk — Baani The Statement, Gurgaon' },
        { key: 'UWK', text: 'UWK — UrbanWrk — Konkord Towers, Pune' },
    ],
    US: [
        { key: 'NYC', text: 'NYC — US — New York Office' },
        { key: 'BOS', text: 'BOS — US — Boston Office' },
    ],
};
export var STATUS_BADGE_COLORS = {
    Procured: { bg: '#deecf9', text: '#004578' },
    Stock: { bg: '#dff6dd', text: '#107c10' },
    Active: { bg: '#e2f0d9', text: '#375623' },
    Repair: { bg: '#fce8d2', text: '#8a3b00' },
    Gifted: { bg: '#d2f4f4', text: '#005b5b' },
    Lost: { bg: '#fde7e9', text: '#a4262c' },
    Stolen: { bg: '#fce4d6', text: '#8e3a00' },
    Scrapped: { bg: '#ebebeb', text: '#605e5c' },
    Disposed: { bg: '#e1dfdd', text: '#3b3a39' },
};
export var DEPT_OPTIONS = [
    'Engineering', 'Product', 'Design', 'Data Science', 'Sales', 'Marketing',
    'HR', 'Finance', 'Operations', 'Legal', 'IT', 'Management', 'Customer Success',
];
export var LOCATION_OPTIONS = [
    'Chennai - Nungambakkam',
    'Chennai - WFH',
    'Remote',
    'Warehouse',
    'Other',
];
//# sourceMappingURL=IAsset.js.map