import * as React from 'react';
import { useMemo } from 'react';
import { Stack, Icon, PrimaryButton } from '@fluentui/react';
import { IAsset, ASSET_TYPE_LABELS, AssetType, STATUS_BADGE_COLORS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './Dashboard.module.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns days from today (start-of-day) to the given date. Negative = past. -Infinity = invalid/missing. */
function daysUntil(dateValue: string | null | undefined): number {
  if (!dateValue) return -Infinity;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return -Infinity;
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - todayStart().getTime()) / 86400000);
}

/** Normalises status variants to canonical stored names. */
function normalizeStatus(status: string): string {
  if (status === 'In Stock')  return 'Stock';
  if (status === 'In Repair') return 'Repair';
  return status;
}

/** Groups items by a string key and returns a count map. */
function groupByCount<T>(items: T[], getter: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = getter(item) || 'Unknown';
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

const COUNTRY_LABELS: Record<string, string> = { IN: 'India', US: 'United States' };

// Standard statuses shown in breakdown even when count is 0 (lifecycle visualisation)
const STANDARD_STATUSES = [
  'Procured', 'Stock', 'Active', 'Repair', 'Gifted', 'Lost', 'Stolen', 'Scrapped', 'Disposed',
];

// ── Component interface ───────────────────────────────────────────────────────

interface IDashboardProps {
  assets: IAsset[];
  onViewAll: () => void;
  onViewAsset: (asset: IAsset) => void;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard: React.FC<IDashboardProps> = ({ assets, onViewAll, onViewAsset }) => {

  // ── KPI counters ────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    let active = 0, inStock = 0, inRepair = 0, procured = 0;
    let tempAssigned = 0, gifted = 0, transferred = 0, scrapped = 0;
    let warrantySoon = 0, endOfServiceSoon = 0;

    for (const a of assets) {
      const s = normalizeStatus(a.Status || '');
      if (s === 'Active')         active++;
      if (s === 'Stock')          inStock++;
      if (s === 'Repair')         inRepair++;
      if (s === 'Procured')       procured++;
      if (s === 'Temp Assigned')  tempAssigned++;
      if (s === 'Gifted')         gifted++;
      if (s === 'Transferred')    transferred++;
      if (s === 'Scrapped')       scrapped++;

      const wDays = daysUntil(a.WarrantyExpiry);
      if (wDays >= 0 && wDays <= 30) warrantySoon++;

      // End of Service — field may not exist in current schema; handled defensively.
      // When OEMEndOfServiceDate / OemEndOfServiceDate / EndOfServiceDate is added to
      // the IT_Assets list and IAsset model, this count will populate automatically.
      const rec = a as unknown as Record<string, unknown>;
      const eosRaw = (rec.OEMEndOfServiceDate ?? rec.OemEndOfServiceDate ?? rec.EndOfServiceDate) as string | undefined;
      const eosDays = daysUntil(eosRaw);
      if (eosDays >= 0 && eosDays <= 90) endOfServiceSoon++;
    }

    return { active, inStock, inRepair, procured, tempAssigned, gifted, transferred, scrapped, warrantySoon, endOfServiceSoon };
  }, [assets]);

  // ── Asset type distribution ─────────────────────────────────────────────────
  const typeRows = useMemo((): [string, number][] => {
    const counts = groupByCount(assets, a => a.AssetType || 'OTH');
    return Object.entries(counts).sort((x, y) => y[1] - x[1]);
  }, [assets]);
  const maxTypeCount = typeRows.length > 0 ? typeRows[0][1] : 1;

  // ── Status breakdown ────────────────────────────────────────────────────────
  const statusCounts = useMemo((): Record<string, number> => {
    const counts: Record<string, number> = {};
    // Pre-seed standard statuses at 0 to preserve lifecycle order
    for (const s of STANDARD_STATUSES) counts[s] = 0;
    for (const a of assets) {
      const s = a.Status || 'Unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [assets]);

  // ── Active assets by department — top 5 ─────────────────────────────────────
  const deptRows = useMemo((): [string, number][] => {
    const activeAssets = assets.filter(a => normalizeStatus(a.Status || '') === 'Active');
    const counts = groupByCount(activeAssets, a => a.Department?.trim() || 'Unassigned Department');
    return Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 5);
  }, [assets]);

  // ── Country split ────────────────────────────────────────────────────────────
  const countryRows = useMemo((): [string, number][] => {
    const counts = groupByCount(assets, a => COUNTRY_LABELS[a.Country || ''] || a.Country || 'Unknown');
    return Object.entries(counts).sort((x, y) => y[1] - x[1]);
  }, [assets]);

  // ── Warranty risk buckets ────────────────────────────────────────────────────
  const warrantyRisk = useMemo(() => {
    const b = { '0–30 days': 0, '31–90 days': 0, '90+ days': 0, 'Expired': 0 };
    for (const a of assets) {
      if (!a.WarrantyExpiry) continue;
      const days = daysUntil(a.WarrantyExpiry);
      if (days < 0)           b['Expired']++;
      else if (days <= 30)    b['0–30 days']++;
      else if (days <= 90)    b['31–90 days']++;
      else                    b['90+ days']++;
    }
    return b;
  }, [assets]);
  const maxRiskCount = Math.max(...Object.values(warrantyRisk), 1);

  // ── Warranty expiring table (next 90 days) ───────────────────────────────────
  const expiringAssets = useMemo(() => {
    return assets
      .filter(a => { const d = daysUntil(a.WarrantyExpiry); return d >= 0 && d <= 90; })
      .sort((a, b) => daysUntil(a.WarrantyExpiry) - daysUntil(b.WarrantyExpiry));
  }, [assets]);

  // ── KPI card definitions ─────────────────────────────────────────────────────
  const KPI_CARDS = [
    { label: 'Total Assets',    value: assets.length,       color: '#2563eb', icon: 'PC1'         },
    { label: 'Active',          value: kpi.active,          color: '#16a34a', icon: 'CheckMark'   },
    { label: 'In Stock',        value: kpi.inStock,         color: '#0284c7', icon: 'Inbox'       },
    { label: 'In Repair',       value: kpi.inRepair,        color: '#ea580c', icon: 'Wrench'      },
    { label: 'Procured',        value: kpi.procured,        color: '#7c3aed', icon: 'ShoppingCart'},
    { label: 'Temp Assigned',   value: kpi.tempAssigned,    color: '#0891b2', icon: 'Contact'     },
    { label: 'Gifted',          value: kpi.gifted,          color: '#059669', icon: 'Heart'       },
    { label: 'Transferred',     value: kpi.transferred,     color: '#6366f1', icon: 'Forward'     },
    { label: 'Scrapped',        value: kpi.scrapped,        color: '#78716c', icon: 'Delete'      },
    { label: 'Warranty Soon',   value: kpi.warrantySoon,    color: '#dc2626', icon: 'Warning'     },
    { label: 'End of Svc Soon', value: kpi.endOfServiceSoon,color: '#b45309', icon: 'Clock'       },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>

      {/* ── KPI cards ── */}
      <div className={`${styles.kpiRow} ${styles.fadeIn}`}>
        {KPI_CARDS.map(c => (
          <div key={c.label} className={styles.kpiCard} style={{ borderTop: `4px solid ${c.color}` }}>
            <div className={styles.kpiIconWrap} style={{ background: `${c.color}18` }}>
              <Icon iconName={c.icon} style={{ color: c.color, fontSize: 18 }} />
            </div>
            <div className={styles.kpiValue}>{c.value}</div>
            <div className={styles.kpiLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1: Type · Status · Departments ── */}
      <Stack horizontal tokens={{ childrenGap: 18 }} className={`${styles.panels} ${styles.fadeIn}`}>

        {/* Asset Type Distribution */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Chart" /> Asset Type Distribution
          </div>
          {typeRows.length === 0 ? (
            <span className={styles.emptyMsg}>No assets yet</span>
          ) : (
            typeRows.map(([type, count]) => {
              const pct = Math.round((count / maxTypeCount) * 100);
              const fullLabel = `${type} – ${ASSET_TYPE_LABELS[type as AssetType] || type}`;
              return (
                <div key={type} className={styles.barRow}>
                  <span className={styles.barLabel} title={fullLabel}>{fullLabel}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.barCount}>{count}</span>
                </div>
              );
            })
          )}
        </Stack.Item>

        {/* Status Breakdown */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Bullseye" /> Status Breakdown
          </div>
          <div className={styles.statusGrid}>
            {Object.entries(statusCounts).map(([status, count]) => {
              const colors = STATUS_BADGE_COLORS[status as keyof typeof STATUS_BADGE_COLORS] || { bg: '#ebebeb', text: '#333' };
              return (
                <div
                  key={status}
                  className={styles.statusChip}
                  style={{ background: colors.bg, color: colors.text, opacity: count === 0 ? 0.45 : 1 }}
                >
                  <span>{status}</span>
                  <span className={styles.statusCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </Stack.Item>

        {/* Top Departments — active assets only */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Org" /> Top Departments
          </div>
          {deptRows.length === 0 ? (
            <span className={styles.emptyMsg}>No active assets</span>
          ) : (
            deptRows.map(([dept, count]) => (
              <div key={dept} className={styles.deptRow}>
                <Icon iconName="People" className={styles.deptIcon} />
                <span className={styles.deptName}>{dept}</span>
                <span className={styles.deptCount}>{count}</span>
              </div>
            ))
          )}
          <div className={styles.panelCaption}>Active assets only · Top 5</div>
        </Stack.Item>

      </Stack>

      {/* ── Charts row 2: Country split · Warranty risk ── */}
      <Stack horizontal tokens={{ childrenGap: 18 }} className={`${styles.panels} ${styles.fadeIn}`}>

        {/* Country Split */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Globe" /> Country Split
          </div>
          {countryRows.length === 0 ? (
            <span className={styles.emptyMsg}>No assets yet</span>
          ) : (
            countryRows.map(([label, count]) => {
              const pct = assets.length > 0 ? Math.round((count / assets.length) * 100) : 0;
              return (
                <div key={label} className={styles.barRow}>
                  <span className={styles.barLabel}>{label}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.barCount}>{count}</span>
                </div>
              );
            })
          )}
        </Stack.Item>

        {/* Warranty Risk */}
        <Stack.Item grow={2} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Shield" /> Warranty Risk
          </div>
          {Object.entries(warrantyRisk).map(([bucket, count]) => {
            const pct = Math.round((count / maxRiskCount) * 100);
            const fillClass =
              bucket === '0–30 days' || bucket === 'Expired'
                ? styles.barFillDanger
                : bucket === '31–90 days'
                  ? styles.barFillWarn
                  : styles.barFill;
            return (
              <div key={bucket} className={styles.barRow}>
                <span className={styles.barLabel}>{bucket}</span>
                <div className={styles.barTrack}>
                  <div className={fillClass} style={{ width: count > 0 ? `${pct}%` : '0%' }} />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            );
          })}
          <div className={styles.panelCaption}>Based on WarrantyExpiry — assets with no date excluded</div>
        </Stack.Item>

      </Stack>

      {/* ── Warranty Expiring Soon table (next 90 days) ── */}
      {expiringAssets.length > 0 && (
        <div className={styles.warrantyPanel}>
          <div className={styles.warrantyPanelHeader}>
            <Icon iconName="Warning" />
            Warranty Expiring Within 90 Days
            <span style={{ marginLeft: 4, background: '#ca5010', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>
              {expiringAssets.length}
            </span>
          </div>
          <table className={styles.warrantyTable}>
            <thead>
              <tr>
                <th>Asset ID</th><th>Model</th><th>Assigned To</th>
                <th>Department</th><th>Expiry Date</th><th>Days Left</th>
              </tr>
            </thead>
            <tbody>
              {expiringAssets.map(a => {
                const days = daysUntil(a.WarrantyExpiry);
                const dayColor = days <= 0 ? '#a4262c' : days <= 30 ? '#a4262c' : days <= 60 ? '#ca5010' : '#375623';
                const dayBg   = days <= 0 ? '#fde7e9' : days <= 30 ? '#fde7e9' : days <= 60 ? '#fdf6f0' : '#dff6dd';
                return (
                  <tr key={a.Id} className={styles.warrantyRow} onClick={() => onViewAsset(a)}>
                    <td><span className={styles.assetLink}>{a.Title}</span></td>
                    <td>{a.Model}</td>
                    <td>{a.AssignedTo || '—'}</td>
                    <td>{a.Department || '—'}</td>
                    <td>{AssetIdGenerator.formatDate(a.WarrantyExpiry)}</td>
                    <td>
                      <span className={styles.daysBadge} style={{ color: dayColor, background: dayBg }}>
                        {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footer}>
        <PrimaryButton iconProps={{ iconName: 'List' }} onClick={onViewAll}>
          View All Assets
        </PrimaryButton>
      </div>

    </div>
  );
};

export default Dashboard;
