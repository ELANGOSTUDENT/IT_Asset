import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  DetailsList, DetailsListLayoutMode, SelectionMode, IColumn,
  SearchBox, Dropdown, IDropdownOption,
  Stack, PrimaryButton, DefaultButton, IconButton, CommandBar, ICommandBarItemProps,
  Spinner, SpinnerSize, Text, Icon,
} from '@fluentui/react';
import { IAsset, AssetStatus, AssetType, ASSET_TYPE_LABELS, STATUS_BADGE_COLORS, ALL_ASSET_TYPES, OFFICE_OPTIONS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetTable.module.scss';

interface IAssetTableProps {
  assets: IAsset[];
  loading: boolean;
  onAddNew: () => void;
  onView:   (asset: IAsset) => void;
  onEdit:   (asset: IAsset) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: '', text: 'All Statuses' },
  ...(['Procured','Stock','Active','Repair','Transferred','Gifted','Lost','Stolen','Scrapped','Disposed'] as AssetStatus[])
    .map(s => ({ key: s, text: s })),
];

const TYPE_OPTIONS: IDropdownOption[] = [
  { key: '', text: 'All Types' },
  ...ALL_ASSET_TYPES.map(t => ({ key: t, text: `${t} – ${ASSET_TYPE_LABELS[t]}` })),
];

const COUNTRY_FILTER_OPTIONS: IDropdownOption[] = [
  { key: 'all', text: 'All Countries' },
  { key: 'IN',  text: 'India' },
  { key: 'US',  text: 'United States' },
];

// Compact labels for the filter bar (OFFICE_OPTIONS labels are longer, suited for forms).
const OFFICE_FILTER_LABELS: Record<string, string> = {
  GIC: 'GIC — Chennai',
  UWB: 'UWB — Gurgaon',
  UWK: 'UWK — Pune',
  NYC: 'NYC — New York',
  BOS: 'BOS — Boston',
};

function getOfficeFilterOptions(country: string): IDropdownOption[] {
  if (country === 'IN') {
    return [
      { key: 'all', text: 'All India Offices' },
      ...OFFICE_OPTIONS['IN'].map(o => ({ key: o.key, text: OFFICE_FILTER_LABELS[o.key] || o.text })),
    ];
  }
  if (country === 'US') {
    return [
      { key: 'all', text: 'All US Offices' },
      ...OFFICE_OPTIONS['US'].map(o => ({ key: o.key, text: OFFICE_FILTER_LABELS[o.key] || o.text })),
    ];
  }
  return [];
}

const StatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  const colors = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
  return (
    <span className={styles.statusBadge} style={{ background: colors.bg, color: colors.text }}>
      {status}
    </span>
  );
};

const AssetTable: React.FC<IAssetTableProps> = ({ assets, loading, onAddNew, onView, onEdit, onRefresh }) => {
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState<string>('');
  const [filterType,     setFilterType]     = useState<string>('');
  const [filterDept,     setFilterDept]     = useState<string>('');
  const [countryFilter,  setCountryFilter]  = useState<string>('all');
  const [officeFilter,   setOfficeFilter]   = useState<string>('all');
  const [sortCol,        setSortCol]        = useState<string>('Title');
  const [sortAsc,        setSortAsc]        = useState(true);

  const deptOptions: IDropdownOption[] = useMemo(() => {
    const depts = Array.from(new Set(assets.map(a => a.Department).filter(Boolean))).sort();
    return [{ key: '', text: 'All Departments' }, ...depts.map(d => ({ key: d, text: d }))];
  }, [assets]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assets
      .filter(a => {
        if (filterStatus && a.Status !== filterStatus) return false;
        if (filterType   && a.AssetType !== filterType) return false;
        if (filterDept   && a.Department !== filterDept) return false;
        if (countryFilter !== 'all') {
          if (a.Country !== countryFilter) return false;
          if (officeFilter !== 'all' && a.OfficeCode !== officeFilter) return false;
        }
        if (q) {
          return (
            a.Title?.toLowerCase().includes(q) ||
            a.SerialNumber?.toLowerCase().includes(q) ||
            a.Model?.toLowerCase().includes(q) ||
            a.Vendor?.toLowerCase().includes(q) ||
            a.AssignedTo?.toLowerCase().includes(q) ||
            a.Department?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const av = a[sortCol] || '';
        const bv = b[sortCol] || '';
        return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
  }, [assets, search, filterStatus, filterType, filterDept, countryFilter, officeFilter, sortCol, sortAsc]);

  const hasActiveFilters = !!(search || filterStatus || filterType || filterDept || countryFilter !== 'all');

  const clearAllFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterType('');
    setFilterDept('');
    setCountryFilter('all');
    setOfficeFilter('all');
  };

  const exportCSV = () => {
    const headers = ['Asset ID','Serial Number','Model','Vendor','Type','Status','Assigned To','Department','Location','Purchase Date','Warranty Expiry','Cost (INR)','Remarks'];
    const rows = filtered.map(a => [
      a.Title, a.SerialNumber, a.Model, a.Vendor,
      ASSET_TYPE_LABELS[a.AssetType] || a.AssetType,
      a.Status, a.AssignedTo, a.Department, a.AssetLocation,
      AssetIdGenerator.formatDate(a.PurchaseDate),
      AssetIdGenerator.formatDate(a.WarrantyExpiry),
      a.Cost, a.Remarks,
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IT_Assets_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleColClick = (col: IColumn) => {
    if (col.fieldName === sortCol) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col.fieldName!);
      setSortAsc(true);
    }
  };

  const makeCol = (key: string, name: string, minW: number, maxW: number, onRender?: any): IColumn => ({
    key, name, fieldName: key, minWidth: minW, maxWidth: maxW,
    isResizable: true, isSorted: sortCol === key, isSortedDescending: !sortAsc,
    onColumnClick: (_e, col) => handleColClick(col),
    onRender,
  });

  const columns: IColumn[] = [
    makeCol('Title', 'Asset ID', 140, 170, (a: IAsset) => (
      <span className={styles.assetId} onClick={() => onView(a)}>{a.Title}</span>
    )),
    makeCol('AssetType', 'Type', 60, 80, (a: IAsset) => (
      <span title={ASSET_TYPE_LABELS[a.AssetType]}>{a.AssetType}</span>
    )),
    makeCol('Model', 'Model', 120, 200),
    makeCol('SerialNumber', 'Serial No.', 100, 150),
    makeCol('Vendor', 'Vendor', 80, 130),
    makeCol('Status', 'Status', 90, 120, (a: IAsset) => <StatusBadge status={a.Status} />),
    makeCol('AssignedTo', 'Assigned To', 100, 160),
    makeCol('Department', 'Department', 90, 140),
    makeCol('AssetLocation', 'Location', 80, 120),
    makeCol('WarrantyExpiry', 'Warranty Exp.', 90, 120, (a: IAsset) => {
      const days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
      const color = days < 0 ? '#a4262c' : days <= 30 ? '#ca5010' : days <= 90 ? '#8a3b00' : 'inherit';
      return <span style={{ color }}>{AssetIdGenerator.formatDate(a.WarrantyExpiry)}</span>;
    }),
    {
      key: 'actions', name: '', minWidth: 64, maxWidth: 72,
      onRender: (a: IAsset) => (
        <div className={styles.rowActions}>
          <IconButton
            iconProps={{ iconName: 'View' }}
            title="View details"
            ariaLabel="View"
            onClick={() => onView(a)}
            styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }}
          />
          <IconButton
            iconProps={{ iconName: 'Edit' }}
            title="Edit asset"
            ariaLabel="Edit"
            onClick={() => onEdit(a)}
            styles={{ root: { width: 28, height: 28 }, icon: { fontSize: 14 } }}
          />
        </div>
      ),
    },
  ];

  const commandItems: ICommandBarItemProps[] = [
    { key: 'add', text: 'Add Asset', iconProps: { iconName: 'Add' }, onClick: onAddNew },
    { key: 'refresh', text: 'Refresh', iconProps: { iconName: 'Refresh' }, onClick: onRefresh },
    { key: 'export', text: 'Export CSV', iconProps: { iconName: 'Download' }, onClick: exportCSV },
  ];

  return (
    <div className={styles.root}>
      <CommandBar items={commandItems} />

      <Stack horizontal tokens={{ childrenGap: 12 }} className={styles.filters} wrap>
        <SearchBox
          placeholder="Search assets, serial, model, user…"
          value={search}
          onChange={(_e, v) => setSearch(v || '')}
          className={styles.searchBox}
        />
        <Dropdown
          options={STATUS_OPTIONS}
          selectedKey={filterStatus}
          onChange={(_e, o) => setFilterStatus(o?.key as string || '')}
          className={styles.filterDrop}
          placeholder="Filter by Status"
        />
        <Dropdown
          options={TYPE_OPTIONS}
          selectedKey={filterType}
          onChange={(_e, o) => setFilterType(o?.key as string || '')}
          className={styles.filterDrop}
          placeholder="Filter by Type"
        />
        <Dropdown
          options={deptOptions}
          selectedKey={filterDept}
          onChange={(_e, o) => setFilterDept(o?.key as string || '')}
          className={styles.filterDrop}
          placeholder="Filter by Department"
        />
        <Dropdown
          options={COUNTRY_FILTER_OPTIONS}
          selectedKey={countryFilter}
          onChange={(_e, o) => {
            const country = o?.key as string || 'all';
            setCountryFilter(country);
            setOfficeFilter('all');
          }}
          className={styles.filterDrop}
          placeholder="Filter by Country"
        />
        {countryFilter !== 'all' && (
          <Dropdown
            options={getOfficeFilterOptions(countryFilter)}
            selectedKey={officeFilter}
            onChange={(_e, o) => setOfficeFilter((o?.key as string) || 'all')}
            className={styles.filterDrop}
            placeholder="Filter by Site / Office"
          />
        )}
        {hasActiveFilters && (
          <DefaultButton
            text="Clear"
            iconProps={{ iconName: 'ClearFilter' }}
            onClick={clearAllFilters}
          />
        )}
      </Stack>

      <div className={styles.resultCount}>
        {loading && <Spinner size={SpinnerSize.xSmall} />}
        <Text variant="small">{filtered.length} of {assets.length} assets</Text>
      </div>

      {filtered.length === 0 && !loading ? (
        <div className={`${styles.empty} ${styles.fadeIn}`}>
          <Icon iconName="Inbox" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No assets found</p>
          <p className={styles.emptyHint}>
            {assets.length === 0
              ? 'Click "Add Asset" to register your first asset.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <DetailsList
          items={filtered}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          compact
          className={`${styles.list} ${styles.fadeIn}`}
        />
      )}
    </div>
  );
};

export default AssetTable;
