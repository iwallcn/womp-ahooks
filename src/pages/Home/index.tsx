import React from 'react';
import { ResponsiveGrid } from '@alifd/next';
import PageHeader from '@/components/PageHeader';
import FusionCardBarChart from './components/FusionCardBarChart';
import FusionCardAreaChart from './components/FusionCardAreaChart';
import FusionCardTypebarChart from './components/FusionCardTypebarChart';
import FusionCardLineChart from './components/FusionCardLineChart';

const { Cell } = ResponsiveGrid;

const Home = () => {
  return (
    <ResponsiveGrid gap={20}>
      <Cell colSpan={12}>
        <PageHeader
          breadcrumbs={[{ name: window.GLOBAL_LANG['fb4.womp.system.name'] }, { name: window.GLOBAL_LANG['fb4.home.page'] }]}
        />
      </Cell>

      <Cell colSpan={3}>
        <FusionCardBarChart />
      </Cell>

      <Cell colSpan={3}>
        <FusionCardAreaChart />
      </Cell>

      <Cell colSpan={3}>
        <FusionCardTypebarChart />
      </Cell>

      <Cell colSpan={3}>
        <FusionCardLineChart />
      </Cell>
    </ResponsiveGrid>
  );
};

export default Home;
