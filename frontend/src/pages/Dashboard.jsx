import { Users, UserCheck, UserMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatsCard          from '../components/Dashboard/StatsCard';
import DemographicsChart  from '../components/Dashboard/DemographicsChart';
import PerformanceGauge   from '../components/Dashboard/PerformanceGauge';
import TeamPerformanceChart from '../components/Dashboard/TeamPerformanceChart';
import ProjectOverview    from '../components/Dashboard/ProjectOverview';
import UpcomingInterviews from '../components/Dashboard/UpcomingInterviews';
import EmployeeStatusTable from '../components/Dashboard/EmployeeStatusTable';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Get a comprehensive snapshot of your HR operations at a glance</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2 text-xs">
            📅 {t('thisMonth')}
          </button>
          <button className="btn-primary flex items-center gap-2 text-xs">
            ↑ {t('export')}
          </button>
        </div>
      </div>

      {/* Row 1: Stats + Demographics */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard icon={Users}     label={t('totalEmployees')}    value="450" change="15.6%" changeType="up" />
        <StatsCard icon={UserCheck} label={t('newEmployees')}      value="123" change="23.3%" changeType="up" />
        <StatsCard icon={UserMinus} label={t('resignedEmployees')} value="12"  change="7.4%"  changeType="down" />
        <DemographicsChart total={450} />
      </div>

      {/* Row 2: Gauge + Team Performance */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <PerformanceGauge score={86} lastMonth={75} />
        </div>
        <div className="col-span-3">
          <TeamPerformanceChart />
        </div>
      </div>

      {/* Row 3: Project + Interviews + Status */}
      <div className="grid grid-cols-3 gap-4">
        <ProjectOverview />
        <UpcomingInterviews />
        <EmployeeStatusTable />
      </div>
    </div>
  );
}
