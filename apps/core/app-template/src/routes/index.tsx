import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';

import data from '#src/app/dashboard/data.json';
import { ChartAreaInteractive } from '#src/components/chart-area-interactive';
import { DataTable } from '#src/components/data-table';
import { SectionCards } from '#src/components/section-cards';
import { toast } from '#src/lib/toast.ts';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          <Button onClick={() => toast.success('Hello')}>Toast Success</Button>
          <Button onClick={() => toast.error('Hello')}>Toast Error</Button>
          <Button onClick={() => toast.warning('Hello')}>Toast Warning</Button>
          <Button onClick={() => toast.info('Hello')}>Toast Info</Button>
        </div>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <ChartAreaInteractive />
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
