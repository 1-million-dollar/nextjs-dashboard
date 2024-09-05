import { Metadata } from 'next';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Form from '@/app/ui/customers/edit-form';
import { notFound } from 'next/navigation';
import { fetchCustomerById } from '@/app/lib/data';

export const metadata: Metadata = {
    title: "Edit Customer",
}

export default async function Page({ params }: { params: {id: string} }) {
    const id = params.id;
    const [customer] = await Promise.all(
        [fetchCustomerById(id),]
       
    );

    if (!customer) {
        notFound();
    }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}