import { Metadata } from 'next';
import  Table  from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import Pagination from '@/app/ui/invoices/pagination';
import { fetchCustomersPages } from '@/app/lib/data';


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
  const currentPage = Number(searchParams?.page) || 1;
 
  const totalPages = await fetchCustomersPages(query);
    return <div>
        <Table query={query} currentPage={currentPage} />
        <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} /> 
      </div>
        
    </div>
}