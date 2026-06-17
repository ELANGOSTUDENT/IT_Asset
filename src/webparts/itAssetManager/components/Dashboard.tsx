import * as React from 'react';
import { useMemo } from 'react';
import { Icon, PrimaryButton } from '@fluentui/react';
import { IAsset } from '../models/IAsset';
import DashboardBreakdowns from './DashboardBreakdowns';
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

  // ── KPI card definitions ─────────────────────────────────────────────────────
  const KPI_CARDS = [
    { label: 'Total Assets',    value: assets.length,        color: '#2563eb', icon: 'PC1'          },
    { label: 'Active',          value: kpi.active,           color: '#16a34a', icon: 'CheckMark'    },
    { label: 'In Stock',        value: kpi.inStock,          color: '#0284c7', icon: 'Inbox'        },
    { label: 'In Repair',       value: kpi.inRepair,         color: '#ea580c', icon: 'Wrench'       },
    { label: 'Procured',        value: kpi.procured,         color: '#7c3aed', icon: 'ShoppingCart' },
    { label: 'Temp Assigned',   value: kpi.tempAssigned,     color: '#0891b2', icon: 'Contact'      },
    { label: 'Gifted',          value: kpi.gifted,           color: '#059669', icon: 'Heart'        },
    { label: 'Transferred',     value: kpi.transferred,      color: '#6366f1', icon: 'Forward'      },
    { label: 'Scrapped',        value: kpi.scrapped,         color: '#78716c', icon: 'Delete'       },
    { label: 'Warranty Soon',   value: kpi.warrantySoon,     color: '#dc2626', icon: 'Warning'      },
    { label: 'End of Svc Soon', value: kpi.endOfServiceSoon, color: '#b45309', icon: 'Clock'        },
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

      {/* ── Charts & Breakdowns ── */}
      <DashboardBreakdowns assets={assets} onViewAsset={onViewAsset} />

      <div className={styles.footer}>
        <PrimaryButton iconProps={{ iconName: 'List' }} onClick={onViewAll}>
          View All Assets
        </PrimaryButton>
      </div>

    </div>
  );
};

export default Dashboard;
