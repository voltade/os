import { createFileRoute } from '@tanstack/react-router';

import data from '#src/app/dashboard/data.json';
import { ChartAreaInteractive } from '#src/components/chart-area-interactive';
import { DataTable } from '#src/components/data-table';
import { SectionCards } from '#src/components/section-cards';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
