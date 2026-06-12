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
    LAP: 'Laptop',
    MAC: 'MacBook',
    DTP: 'Desktop',
    MON: 'Monitor',
    DOC: 'Docking Station',
    MOB: 'Mobile Phone',
    NET: 'Network Device',
    ACC: 'Accessory',
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