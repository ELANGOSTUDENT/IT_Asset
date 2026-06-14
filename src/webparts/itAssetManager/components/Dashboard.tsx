import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Stack, Text, Spinner, SpinnerSize, Icon,
  PrimaryButton, DefaultButton, Shimmer,
} from '@fluentui/react';
import { AssetService } from '../services/AssetService';
import { IAsset, ASSET_TYPE_LABELS, AssetType, STATUS_BADGE_COLORS } from '../models/IAsset';
import { AssetIdGenerator } from '../utils/AssetIdGenerator';
import styles from './Dashboard.module.scss';

interface IDashboardProps {
  assets: IAsset[];
  assetService: AssetService;
  onViewAll: () => void;
  onViewAsset: (asset: IAsset) => void;
}

interface IStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byDept: Record<string, number>;
  warrantyExpiringSoon: number;
}

const STAT_CARDS = [
  { key: 'Active',    label: 'Active',      icon: 'CheckMark',   color: '#16a34a' },
  { key: 'Stock',     label: 'In Stock',    icon: 'Inbox',       color: '#0284c7' },
  { key: 'Repair',    label: 'In Repair',   icon: 'Wrench',      color: '#ea580c' },
  { key: 'Procured',  label: 'Procured',    icon: 'ShoppingCart',color: '#7c3aed' },
];

const Dashboard: React.FC<IDashboardProps> = ({ assets, assetService, onViewAll, onViewAsset }) => {
  const [stats, setStats]       = useState<IStats | null>(null);
  const [expiring, setExpiring] = useState<IAsset[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      assetService.getDashboardStats(),
      assetService.getWarrantyExpiring(90),
    ])
      .then(([s, e]) => { setStats(s); setExpiring(e); })
      .catch(() => { /* stats unavailable — list columns not yet set up */ })
      .finally(() => setLoadingStats(false));
  }, [assets]);

  const total = assets.length;
  const issues = (stats?.byStatus['Lost'] || 0) + (stats?.byStatus['Stolen'] || 0);

  return (
    <div className={styles.root}>
      {/* Summary KPI row */}
      <div className={`${styles.kpiRow} ${styles.fadeIn}`}>
        <div className={styles.kpiCard} style={{ borderTop: '4px solid #2563eb' }}>
          <div className={styles.kpiIconWrap} style={{ background: 'rgba(37,99,235,.10)' }}>
            <Icon iconName="PC1" style={{ color: '#2563eb', fontSize: 18 }} />
          </div>
          <div className={styles.kpiValue}>{total}</div>
          <div className={styles.kpiLabel}>Total Assets</div>
        </div>
        {STAT_CARDS.map(c => (
          <div key={c.key} className={styles.kpiCard} style={{ borderTop: `4px solid ${c.color}` }}>
            <div className={styles.kpiIconWrap} style={{ background: `${c.color}18` }}>
              <Icon iconName={c.icon} style={{ color: c.color, fontSize: 18 }} />
            </div>
            <div className={styles.kpiValue}>
              {loadingStats ? <Shimmer width={40} styles={{ root: { marginTop: 4 } }} /> : (stats?.byStatus[c.key] || 0)}
            </div>
            <div className={styles.kpiLabel}>{c.label}</div>
          </div>
        ))}
        <div className={styles.kpiCard} style={{ borderTop: '4px solid #dc2626' }}>
          <div className={styles.kpiIconWrap} style={{ background: 'rgba(220,38,38,.10)' }}>
            <Icon iconName="Warning" style={{ color: '#dc2626', fontSize: 18 }} />
          </div>
          <div className={styles.kpiValue}>
            {loadingStats ? <Shimmer width={40} styles={{ root: { marginTop: 4 } }} /> : (stats?.warrantyExpiringSoon || 0)}
          </div>
          <div className={styles.kpiLabel}>Warranty Soon</div>
        </div>
        {issues > 0 && (
          <div className={styles.kpiCard} style={{ borderTop: '4px solid #a4262c' }}>
            <div className={styles.kpiIconWrap} style={{ background: 'rgba(164,38,44,.10)' }}>
              <Icon iconName="AlertSolid" style={{ color: '#a4262c', fontSize: 18 }} />
            </div>
            <div className={styles.kpiValue}>{issues}</div>
            <div className={styles.kpiLabel}>Lost / Stolen</div>
          </div>
        )}
      </div>

      <Stack horizontal tokens={{ childrenGap: 18 }} className={`${styles.panels} ${styles.fadeIn}`}>
        {/* Asset Type Breakdown */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Chart" /> Asset Type Distribution
          </div>
          {loadingStats ? (
            <Spinner size={SpinnerSize.small} />
          ) : (
            <div>
              {Object.entries(stats?.byType || {}).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={type} className={styles.barRow}>
                    <span className={styles.barLabel}>{ASSET_TYPE_LABELS[type as AssetType] || type}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.barCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Stack.Item>

        {/* Status Breakdown */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Bullseye" /> Status Breakdown
          </div>
          {loadingStats ? (
            <Spinner size={SpinnerSize.small} />
          ) : (
            <div className={styles.statusGrid}>
              {Object.entries(stats?.byStatus || {}).map(([status, count]) => {
                const colors = STATUS_BADGE_COLORS[status as any] || { bg: '#ebebeb', text: '#333' };
                return (
                  <div key={status} className={styles.statusChip}
                    style={{ background: colors.bg, color: colors.text }}>
                    <span>{status}</span>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Stack.Item>

        {/* Top Departments */}
        <Stack.Item grow={1} className={styles.panel}>
          <div className={styles.panelHeader}>
            <Icon iconName="Org" /> Top Departments
          </div>
          {loadingStats ? (
            <Spinner size={SpinnerSize.small} />
          ) : (
            <div>
              {Object.entries(stats?.byDept || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([dept, count]) => (
                  <div key={dept} className={styles.deptRow}>
                    <Icon iconName="People" className={styles.deptIcon} />
                    <span className={styles.deptName}>{dept || '(Unassigned)'}</span>
                    <span className={styles.deptCount}>{count}</span>
                  </div>
                ))}
            </div>
          )}
        </Stack.Item>
      </Stack>

      {/* Warranty Expiring Soon */}
      {expiring.length > 0 && (
        <div className={styles.warrantyPanel}>
          <div className={styles.warrantyPanelHeader}>
            <Icon iconName="Warning" />
            Warranty Expiring Within 90 Days
            <span style={{ marginLeft: 4, background: '#ca5010', color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>
              {expiring.length}
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
              {expiring.map(a => {
                const days = AssetIdGenerator.daysUntilWarrantyExpiry(a.WarrantyExpiry);
                const dayColor = days < 0 ? '#a4262c' : days <= 30 ? '#a4262c' : days <= 60 ? '#ca5010' : '#375623';
                const dayBg   = days < 0 ? '#fde7e9' : days <= 30 ? '#fde7e9' : days <= 60 ? '#fdf6f0' : '#dff6dd';
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
