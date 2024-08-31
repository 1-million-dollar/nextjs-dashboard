import { Metadata } from 'next';
import  Table  from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import Pagination from '@/app/ui/invoices/pagination';


export const metadata: Metadata = {
    title: "Customer",
}

export default async function Page({
    searchParams,
      }: {
        searchParams?: {
          query?: string;
          page?: string;
        };
}) {
    const query = searchParams?.query || '';
    
    const customers = await fetchFilteredCustomers(query);
    const currentPage = Number(searchParams?.page) || 1;
    return <div>
        <Table customers={customers} />
        
    </div>
}