import  Form  from '@/app/ui/customers/create-customer';
import { fetchCustomers } from '@/app/lib/data';

export default async function Page() {
    const customers = await fetchCustomers();

    return <main>
            <Form />
        </main>
}