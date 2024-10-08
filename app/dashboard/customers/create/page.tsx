import  Form  from '@/app/ui/customers/create-customer';
import { fetchCustomers } from '@/app/lib/data';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';




export default async function Page() {
    const customers = await fetchCustomers();

    return <main>
    <Breadcrumbs 
        breadcrumbs={[
            { label: 'Customers', href: '/dashboard/customers' },
            {
                label: 'Create Customer',
                href: '/dashboard/customers/create',
                active: true,
            },
        ]}
        />
        <Form />
</main>
}