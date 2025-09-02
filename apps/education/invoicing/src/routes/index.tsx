import { createFileRoute } from '@tanstack/react-router';

import CreateInvoiceButton from '#src/components/create-invoice-button.tsx';
import InvoicesTable from '#src/components/invoices-table.tsx';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <CreateInvoiceButton />
      <InvoicesTable />
    </div>
  );
}
