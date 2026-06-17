import * as React from 'react';
import { useMemo } from 'react';
import { Icon } from '@fluentui/react';
import { IAsset, ASSET_TYPE_LABELS, AssetType, STATUS_BADGE_COLORS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './DashboardBreakdowns.module.scss';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStringValue(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

function groupByCount<T>(
  items: T[],
  getter: (item: T) => string
): Array<{ label: string; key: string; count: number }> {
  const map: Record<string, number> = {};
  for (const item of items) {
    const key = getter(item);
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, key: label, count }))
    .sort((a, b) => b.count - a.count);
}

function getDaysUntil(dateValue: string | Date | undefined | null): number | null {
  if (!dateValue) return null;
  const d = typeof dateValue === 'string' ? new Date(dateValue) : new Date((dateValue as Date).getTime());
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

function normalizeStatusLabel(status: string): string {
  if (status === 'Stock')  return 'In Stock';
  if (status === 'Repair') return 'In Repair';
  return status;
}

function getCountryLabel(country: string): string {
  if (country === 'IN') return 'India';
  if (country === 'US') return 'United States';
  return country || 'Unknown';
}

const STANDARD_STATUSES = [
  'Procured', 'Stock', 'Active', 'Repair', 'Gifted', 'Lost', 'Stolen', 'Scrapped', 'Disposed',
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface IDashboardBreakdownsProps {
  assets: IAsset[];
  onViewAsset?: (asset: IAsset) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const DashboardBreakdowns: React.FC<IDashboardBreakdownsProps> = ({ assets, onViewAsset }) => {

  // ── Asset Type Distribution ─────────────────────────────────────────────────
  const typeRows = useMemo(() =>
    groupByCount(assets, a => getStringValue(a.AssetType, 'Unknown')),
  [assets]);
  const maxTypeCount = typeRows.length > 0 ? typeRows[0].count : 1;

  // ── Status Breakdown ────────────────────────────────────────────────────────
  const statusRows = useMemo((): Array<[string, number]> => {
    const counts: Record<string, number> = {};
    for (const s of STANDARD_STATUSES) counts[s] = 0;
    for (const a of assets) {
      const s = getStringValue(a.Status, 'Unknown');
      counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts);
  }, [assets]);

  // ── Top Departments (Active only, top 5) ─────────────────────────────────────
  const deptRows = useMemo(() => {
    const active = assets.filter(a => a.Status === 'Active');
    return groupByCount(active, a => getStringValue(a.Department, 'Unknown')).slice(0, 5);
  }, [assets]);
  const maxDeptCount = deptRows.length > 0 ? deptRows[0].count : 1;

  // ── Country Split ────────────────────────────────────────────────────────────
  const countryRows = useMemo(() =>
    groupByCount(assets, a => getCountryLabel(getStringValue(a.Country, ''))),
  [assets]);

  // ── Warranty Risk Buckets ────────────────────────────────────────────────────
  const warrantyRisk = useMemo(() => {
    const b = { early: 0, mid: 0, safe: 0, expired: 0 };
    for (const a of assets) {
      if (!a.WarrantyExpiry) continue;
      const days = getDaysUntil(a.WarrantyExpiry);
      if (days === null) continue;
      if (days < 0)        b.expired++;
      else if (days <= 30) b.early++;
      else if (days <= 90) b.mid++;
      else                 b.safe++;
    }
    return b;
  }, [assets]);
  const maxRiskCount = Math.max(warrantyRisk.early, warrantyRisk.mid, warrantyRisk.safe, 1);

  const riskBuckets = [
    { label: '0–30 days',  count: warrantyRisk.early,   fillCls: styles.barFillDanger },
    { label: '31–90 days', count: warrantyRisk.mid,     fillCls: styles.barFillWarn   },
    { label: '90+ days',   count: warrantyRisk.safe,    fillCls: styles.barFill       },
    { label: 'Expired',    count: warrantyRisk.expired, fillCls: styles.barFillDanger },
  ];

  // ── Warranty expiring soon (next 90 days) ────────────────────────────────────
  const expiringAssets = useMemo(() =>
    assets
      .filter(a => {
        const d = getDaysUntil(a.WarrantyExpiry);
        return d !== null && d >= 0 && d <= 90;
      })
      .slice()
      .sort((a, b) => (getDaysUntil(a.WarrantyExpiry) ?? 0) - (getDaysUntil(b.WarrantyExpiry) ?? 0)),
  [assets]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>

      {/* ── Section heading ── */}
      <div className={styles.sectionHeading}>
        <Icon iconName="BarChart4" className={styles.sectionIcon} />
        Charts &amp; Breakdowns
      </div>

      {/* ── Row 1: Asset Type Distribution · Status Breakdown · Top Departments ── */}
      <div className={`${styles.chartRow} ${styles.fadeIn}`}>

        {/* Asset Type Distribution */}
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <div className={styles.panelHeader}>
            <Icon iconName="Chart" /> Asset Type Distribution
          </div>
          {typeRows.length === 0 ? (
            <span className={styles.emptyMsg}>No assets yet</span>
          ) : (
            typeRows.map(({ key, label, count }) => {
              const pct = Math.round((count / maxTypeCount) * 100);
              const typeFullName = ASSET_TYPE_LABELS[label as AssetType] || label;
              return (
                <div key={key} className={styles.barRow}>
                  <span className={styles.barLabel} title={typeFullName}>{label}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.barCount}>{count}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Status Breakdown */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Bullseye" /> Status Breakdown
          </div>
          <div className={styles.statusGrid}>
            {statusRows.map(([status, count]) => {
              const colors = STATUS_BADGE_COLORS[status as keyof typeof STATUS_BADGE_COLORS]
                || { bg: '#ebebeb', text: '#333' };
              return (
                <div
                  key={status}
                  className={styles.statusChip}
                  style={{ background: colors.bg, color: colors.text, opacity: count === 0 ? 0.45 : 1 }}
                >
                  <span>{normalizeStatusLabel(status)}</span>
                  <span className={styles.statusCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Departments — active only */}
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <div className={styles.panelHeader}>
            <Icon iconName="Org" /> Top Departments
          </div>
          {deptRows.length === 0 ? (
            <span className={styles.emptyMsg}>No active assets</span>
          ) : (
            deptRows.map(({ label, count }) => {
              const pct = Math.round((count / maxDeptCount) * 100);
              return (
                <div key={label} className={styles.barRow}>
                  <span className={styles.barLabel}>{label}</span>
                  <div className={styles.barTrack}>
                    <div className={`${styles.barFill} ${styles.barFillGreen}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.barCount}>{count}</span>
                </div>
              );
            })
          )}
          <div className={styles.panelCaption}>Active assets only · Top 5</div>
        </div>

      </div>

      {/* ── Row 2: Country Split · Warranty Risk ── */}
      <div className={`${styles.chartRow} ${styles.fadeIn}`}>

        {/* Country Split */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Globe" /> Country Split
          </div>
          {countryRows.length === 0 ? (
            <span className={styles.emptyMsg}>No assets yet</span>
          ) : (
            countryRows.map(({ label, count }) => {
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
        </div>

        {/* Warranty Risk */}
        <div className={`${styles.panel} ${styles.panelWide}`}>
          <div className={styles.panelHeader}>
            <Icon iconName="Shield" /> Warranty Risk
          </div>
          {riskBuckets.map(({ label, count, fillCls }) => {
            const pct = Math.round((count / maxRiskCount) * 100);
            return (
              <div key={label} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div className={fillCls} style={{ width: count > 0 ? `${pct}%` : '0%' }} />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            );
          })}
          <div className={styles.panelCaption}>Based on WarrantyExpiry — assets with no date excluded</div>
        </div>

      </div>

      {/* ── Warranty Expiring Soon table (next 90 days) ── */}
      {expiringAssets.length > 0 && (
        <div className={`${styles.warrantyPanel} ${styles.fadeIn}`}>
          <div className={styles.warrantyPanelHeader}>
            <Icon iconName="Warning" />
            Warranty Expiring Within 90 Days
            <span className={styles.warrantyBadge}>{expiringAssets.length}</span>
          </div>
          <table className={styles.warrantyTable}>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Model</th>
                <th>Assigned To</th>
                <th>Department</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
              </tr>
            </thead>
            <tbody>
              {expiringAssets.map(a => {
                const days = getDaysUntil(a.WarrantyExpiry) ?? 0;
                const dayColor = days <= 30 ? '#a4262c' : days <= 60 ? '#ca5010' : '#375623';
                const dayBg   = days <= 30 ? '#fde7e9' : days <= 60 ? '#fdf6f0' : '#dff6dd';
                return (
                  <tr
                    key={a.Id ?? a.Title}
                    className={styles.warrantyRow}
                    onClick={() => onViewAsset && onViewAsset(a)}
                    style={onViewAsset ? { cursor: 'pointer' } : undefined}
                  >
                    <td><span className={styles.assetLink}>{a.Title}</span></td>
                    <td>{a.Model}</td>
                    <td>{a.AssignedTo || '—'}</td>
                    <td>{a.Department || '—'}</td>
                    <td>{AssetIdGenerator.formatDate(a.WarrantyExpiry)}</td>
                    <td>
                      <span className={styles.daysBadge} style={{ color: dayColor, background: dayBg }}>
                        {`${days}d`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </>
  );
};

export default DashboardBreakdowns;
