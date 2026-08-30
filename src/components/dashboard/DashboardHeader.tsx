import React from 'react';
import { Button } from '../../design-system/Button';
import { Scan, ShieldCheck, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface DashboardHeaderProps {
  onScanProduct: () => void;
  userRole?: UserRole;
  totalCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onScanProduct,
  userRole = 'inspector',
  totalCount,
}) => {
  const roleLabelMap: Record<UserRole, { title: string; badge: string }> = {
    inspector: { title: 'Legal Metrology Officer', badge: 'INSPECTOR VIEW' },
    reviewer: { title: 'Senior Compliance Reviewer', badge: 'REVIEWER VIEW' },
    admin: { title: 'Chief Metrology Administrator', badge: 'ADMIN VIEW' },
  };

  const roleInfo = roleLabelMap[userRole] || roleLabelMap.inspector;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Supporting Text */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
              {roleInfo.badge}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Overview of your packaged commodity inspections.
          </p>
        </div>

        {/* Primary Action Button: Scan Product */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            id="dashboard-btn-scan-product"
            variant="primary"
            size="lg"
            leftIcon={<Scan className="w-4 h-4 text-blue-300" />}
            onClick={onScanProduct}
            className="shadow-sm font-bold w-full sm:w-auto justify-center"
          >
            Scan Product
          </Button>
        </div>
      </div>
    </div>
  );
};
