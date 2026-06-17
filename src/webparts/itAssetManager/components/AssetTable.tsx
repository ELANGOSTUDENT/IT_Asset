import * as React from 'react';
import { useState, useMemo, useRef } from 'react';
import {
  DetailsList, DetailsListLayoutMode, SelectionMode, IColumn,
  SearchBox, Dropdown, IDropdownOption,
  Stack, DefaultButton, IconButton, CommandBar, ICommandBarItemProps,
  Spinner, SpinnerSize, Text, Icon,
  Selection, Dialog, DialogType, DialogFooter, TextField,
  MessageBar, MessageBarType,
} from '@fluentui/react';
import {
  IAsset, AssetStatus, AssetType,
  ASSET_TYPE_LABELS, STATUS_BADGE_COLORS, ALL_ASSET_TYPES, OFFICE_OPTIONS,
} from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './AssetTable.module.scss';

// ── Display helpers ────────────────────────────────────────────────────────────

function normalizeStatusLabel(status: string): string {
  if (status === 'Stock')        return 'In Stock';
  if (status === 'Repair')       return 'In Repair';
  if (status === 'TempAssigned') return 'Temp Assigned';
  if (status === 'EndOfService') return 'End of Service';
  return status;
}

// ── Filter constants ──────────────────────────────────────────────────────────

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: '',             text: 'All Statuses'  },
  { key: 'Procured',     text: 'Procured'      },
  { key: 'Stock',        text: 'In Stock'      },
  { key: 'Active',       text: 'Active'        },
  { key: 'Repair',       text: 'In Repair'     },
  { key: 'TempAssigned', text: 'Temp Assigned' },
  { key: 'Gifted',       text: 'Gifted'        },
  { key: 'Lost',         text: 'Lost'          },
  { key: 'Stolen',       text: 'Stolen'        },
  { key: 'EndOfService', text: 'End of Service'},
  { key: 'Scrapped',     text: 'Scrapped'      },
  { key: 'Disposed',     text: 'Disposed'      },
];

const TYPE_OPTIONS: IDropdownOption[] = [
  { key: '', text: 'All Types' },
  ...ALL_ASSET_TYPES.map(t => ({ key: t, text: `${t} – ${ASSET_TYPE_LABELS[t]}` })),
];

const COUNTRY_FILTER_OPTIONS: IDropdownOption[] = [
  { key: 'all', text: 'All Countries'  },
  { key: 'IN',  text: 'India'          },
  { key: 'US',  text: 'United States'  },
];

const WARRANTY_FILTER_OPTIONS: IDropdownOption[] = [
  { key: '',         text: 'All Warranties'         },
  { key: 'expiring', text: 'Expiring Soon (≤30 d)'  },
  { key: 'expired',  text: 'Expired'                },
  { key: 'valid',    text: 'Valid (31+ days)'        },
];

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

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  const colors = STATUS_BADGE_COLORS[status] || { bg: '#ebebeb', text: '#333' };
  return (
    <span className={styles.statusBadge} style={{ background: colors.bg, color: colors.text }}>
      {normalizeStatusLabel(status)}
    </span>
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface IAssetTableProps {
  assets: IAsset[];
  loading: boolean;
  onAddNew:  () => void;
  onView:    (asset: IAsset) => void;
  onEdit:    (asset: IAsset) => void;
  onRefresh: () => void;
  onBulkLinkDocument?: (assetItemIds: number[], docUrl: string) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

const AssetTable: React.FC<IAssetTableProps> = ({ assets, loading, onAddNew, onView, onEdit, onRefresh, onBulkLinkDocument }) => {
  const [search,          setSearch]          = useState('');
  const [filterStatus,    setFilterStatus]    = useState<string>('');
  const [filterType,      setFilterType]      = useState<string>('');
  const [filterDept,      setFilterDept]      = useState<string>('');
  const [filterWarranty,  setFilterWarranty]  = useState<string>('');
  const [countryFilter,   setCountryFilter]   = useState<string>('all');
  const [officeFilter,    setOfficeFilter]    = useState<string>('all');
  const [sortCol,         setSortCol]         = useState<string>('Title');
  const [sortAsc,         setSortAsc]         = useState(true);

  // 6.13 Bulk document linking
  const [selectedItems,   setSelectedItems]   = useState<IAsset[]>([]);
  const [showBulkDlg,     setShowBulkDlg]     = useState(false);
  const [bulkDocUrl,      setBulkDocUrl]       = useState('');
  const [bulkLinking,     setBulkLinking]      = useState(false);
  const [bulkLinkError,   setBulkLinkError]    = useState('');
  const [bulkLinkDone,    setBulkLinkDone]     = useState(false);

  const selectionRef = useRef<Selection | null>(null);
  if (!selectionRef.current) {
    selectionRef.current = new Selection({
      onSelectionChanged: () => {
        setSelectedItems((selectionRef.current?.getSelection() as IAsset[]) || []);
      },
    });
  }
  const selection = selectionRef.current;

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
        if (filterWarranty) {
          const days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
          if (filterWarranty === 'expired')  return days < 0;
          if (filterWarranty === 'expiring') return days >= 0 && days <= 30;
          if (filterWarranty === 'valid')    return days > 30;
        }
        if (q) {
          return (
            a.Title?.toLowerCase().includes(q) ||
            a.SerialNumber?.toLowerCase().includes(q) ||
            a.Model?.toLowerCase().includes(q) ||
            a.Vendor?.toLowerCase().includes(q) ||
            a.AssignedTo?.toLowerCase().includes(q) ||
            a.Department?.toLowerCase().includes(q) ||
            a.Country?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a: IAsset & Record<string, unknown>, b: IAsset & Record<string, unknown>) => {
        const av = String(a[sortCol] || '');
        const bv = String(b[sortCol] || '');
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [assets, search, filterStatus, filterType, filterDept, filterWarranty, countryFilter, officeFilter, sortCol, sortAsc]);

  const hasActiveFilters = !!(
    search || filterStatus || filterType || filterDept || filterWarranty ||
    countryFilter !== 'all' || officeFilter !== 'all'
  );

  const clearAllFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterType('');
    setFilterDept('');
    setFilterWarranty('');
    setCountryFilter('all');
    setOfficeFilter('all');
  };

  const exportCSV = () => {
    const headers = [
      'Asset ID', 'Type', 'Model', 'Serial Number', 'Make', 'Status',
      'Assigned To', 'Department', 'Location', 'Country',
      'Warranty End', 'Purchase Date', 'Cost (INR)', 'Remarks',
    ];
    const rows = filtered.map(a => [
      a.Title,
      a.AssetType,
      a.Model,
      a.SerialNumber,
      a.Vendor,
      normalizeStatusLabel(a.Status),
      a.AssignedTo,
      a.Department,
      a.AssetLocation,
      a.Country,
      AssetIdGenerator.formatDate(a.WarrantyExpiry),
      AssetIdGenerator.formatDate(a.PurchaseDate),
      a.Cost,
      a.Remarks,
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IT_Assets_${new Date().toISOString().slice(0, 10)}.csv`;
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

  const makeCol = (
    key: string, name: string, minW: number, maxW: number,
    onRender?: (item: IAsset) => JSX.Element | string | null,
  ): IColumn => ({
    key, name, fieldName: key, minWidth: minW, maxWidth: maxW,
    isResizable: true, isSorted: sortCol === key, isSortedDescending: !sortAsc,
    onColumnClick: (_e, col) => handleColClick(col),
    onRender,
  });

  const columns: IColumn[] = [
    makeCol('Title', 'Asset ID', 140, 170, a => (
      <span className={styles.assetId} onClick={() => onView(a)}>{a.Title}</span>
    )),
    makeCol('AssetType', 'Type', 55, 70, a => (
      <span title={ASSET_TYPE_LABELS[a.AssetType] || a.AssetType}>{a.AssetType}</span>
    )),
    makeCol('Model', 'Model', 120, 200),
    makeCol('SerialNumber', 'Serial No.', 100, 150),
    makeCol('Vendor', 'Make', 80, 130),
    makeCol('Status', 'Status', 90, 120, a => <StatusBadge status={a.Status} />),
    makeCol('AssignedTo', 'Assigned To', 100, 160),
    makeCol('Department', 'Department', 90, 140),
    makeCol('AssetLocation', 'Location', 80, 120),
    makeCol('WarrantyExpiry', 'Warranty End', 90, 120, a => {
      const days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
      const color = (days < 0 || days <= 30) ? '#a4262c' : days <= 90 ? '#ca5010' : 'inherit';
      return <span style={{ color, fontWeight: days <= 30 ? 600 : undefined }}>
        {AssetIdGenerator.formatDate(a.WarrantyExpiry)}
      </span>;
    }),
    makeCol('Country', 'Country', 56, 70),
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

  const handleBulkLink = async () => {
    if (!bulkDocUrl.trim() || !selectedItems.length || !onBulkLinkDocument) return;
    setBulkLinking(true);
    setBulkLinkError('');
    setBulkLinkDone(false);
    try {
      const ids = selectedItems.map(a => a.Id!).filter(Boolean);
      await onBulkLinkDocument(ids, bulkDocUrl.trim());
      setBulkLinkDone(true);
      setBulkDocUrl('');
    } catch {
      setBulkLinkError('Link failed. Please check the URL and try again.');
    } finally {
      setBulkLinking(false);
    }
  };

  const commandItems: ICommandBarItemProps[] = [
    { key: 'add',     text: 'Add Asset',  iconProps: { iconName: 'Add'      }, onClick: onAddNew   },
    { key: 'refresh', text: 'Refresh',    iconProps: { iconName: 'Refresh'  }, onClick: onRefresh  },
    { key: 'export',  text: 'Export CSV', iconProps: { iconName: 'Download' }, onClick: exportCSV  },
    ...(selectedItems.length > 0 && onBulkLinkDocument ? [{
      key: 'linkdoc',
      text: `Link Document (${selectedItems.length} selected)`,
      iconProps: { iconName: 'Link' },
      onClick: () => { setBulkDocUrl(''); setBulkLinkError(''); setBulkLinkDone(false); setShowBulkDlg(true); },
    }] : []),
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
          placeholder="Status"
        />
        <Dropdown
          options={TYPE_OPTIONS}
          selectedKey={filterType}
          onChange={(_e, o) => setFilterType(o?.key as string || '')}
          className={styles.filterDrop}
          placeholder="Type"
        />
        <Dropdown
          options={deptOptions}
          selectedKey={filterDept}
          onChange={(_e, o) => setFilterDept(o?.key as string || '')}
          className={styles.filterDrop}
          placeholder="Department"
        />
        <Dropdown
          options={COUNTRY_FILTER_OPTIONS}
          selectedKey={countryFilter}
          onChange={(_e, o) => {
            setCountryFilter(o?.key as string || 'all');
            setOfficeFilter('all');
          }}
          className={styles.filterDrop}
          placeholder="Country"
        />
        {countryFilter !== 'all' && (
          <Dropdown
            options={getOfficeFilterOptions(countryFilter)}
            selectedKey={officeFilter}
            onChange={(_e, o) => setOfficeFilter(o?.key as string || 'all')}
            className={styles.filterDrop}
            placeholder="Site / Office"
          />
        )}
        <Dropdown
          options={WARRANTY_FILTER_OPTIONS}
          selectedKey={filterWarranty}
          onChange={(_e, o) => setFilterWarranty(o?.key as string || '')}
          className={styles.filterDrop}
          placeholder="Warranty"
        />
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
          selectionMode={onBulkLinkDocument ? SelectionMode.multiple : SelectionMode.none}
          selection={selection}
          selectionPreservedOnEmptyClick
          compact
          className={`${styles.list} ${styles.fadeIn}`}
        />
      )}

      {/* 6.13 Bulk Document Link Dialog */}
      <Dialog
        hidden={!showBulkDlg}
        onDismiss={() => { setShowBulkDlg(false); setBulkLinkDone(false); }}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Link Document to Selected Assets',
          subText: `This will link the document URL as the Purchase Invoice on ${selectedItems.length} selected asset(s).`,
        }}
        modalProps={{ isBlocking: false }}
        styles={{ main: { minWidth: 520 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
          {selectedItems.length > 0 && (
            <div style={{ fontSize: 12, color: '#605e5c' }}>
              Selected: {selectedItems.map(a => a.Title).join(', ')}
            </div>
          )}
          <TextField
            label="Document URL *"
            value={bulkDocUrl}
            onChange={(_e, v) => setBulkDocUrl(v || '')}
            placeholder="https://…  or  /sites/…/Shared Documents/…"
          />
          {bulkLinkError && <MessageBar messageBarType={MessageBarType.error}>{bulkLinkError}</MessageBar>}
          {bulkLinkDone  && <MessageBar messageBarType={MessageBarType.success}>Document linked to {selectedItems.length} asset(s) successfully.</MessageBar>}
        </div>
        <DialogFooter>
          <DefaultButton
            primary
            onClick={handleBulkLink}
            disabled={!bulkDocUrl.trim() || bulkLinking || bulkLinkDone}
          >
            {bulkLinking ? 'Linking…' : 'Link Document'}
          </DefaultButton>
          <DefaultButton onClick={() => { setShowBulkDlg(false); setBulkLinkDone(false); }}>
            {bulkLinkDone ? 'Close' : 'Cancel'}
          </DefaultButton>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AssetTable;
