'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';







const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });




const FormSchemaCom = z.object({
    id: z.string(),
    customerName: z.string({
        invalid_type_error: 'Please enter a customer name.',
    }),
    email: z.string({ invalid_type_error: 'Please enter an email address' }),
    
});

const CreateCustomer = FormSchemaCom.omit({id: true});
const UpdateCustomer = FormSchemaCom.omit({id: true});


export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export type ConState = {
    errors?: {
        customerName?: string[];
        email?: string[];
       
    };
    message?: string | null;
};

export async function createCustomer(prevState: ConState, formData: FormData) {
    const validatedFields = CreateCustomer.safeParse({
        customerName: formData.get('customer'),
        email: formData.get('email'),
        
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to Create Customer.',
        };
    }
    const { customerName, email } = validatedFields.data;
    try {
        await sql`
        INSERT INTO customers (name, email ) 
        VALUES (${customerName}, ${email} )
        `; 
        } catch (error) {
            return {
                message: 'Database Error: Failed to Create Customer.'
            };
        }
        revalidatePath('/dashboard/customers');
        redirect('/dashboard/customers');
    }



export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice. ',
        };
    }
    const{ customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }
    

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }
    
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `;
    } catch (error) {
        return {message: 'Falied to update invoices.' };
    }

    revalidatePath('dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateCustomer(id: string, formData: FormData ) {
   const { customerName , email } = UpdateCustomer.parse({
        customerName: formData.get('customer'),
        email: formData.get('email'),
   });

   try {
    await sql`
    UPDATE customers
    SET name = ${customerName}, email = ${email}
    WHERE id = ${id}
    `;
   } catch (error) {
    return { message: 'Failed to update customers.' };
   }

   revalidatePath('dashboard/customers');
   redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {

    try{
        await sql`
        DELETE FROM customers WHERE id = ${id}`;
        revalidatePath('/dashboard/customers');
        return {message: 'Deleted Customer'};
    }
    catch (error) {
        return { message:" failed to delete customer."}
    }
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');
    try{
    await sql `DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return {message: 'Deleted Invoice.'};
    } catch (error) {
        return {message: 'Failed to delete invoices' };
    }
    
}




