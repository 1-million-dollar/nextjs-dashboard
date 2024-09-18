'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// actions.ts
import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  // Get authentication details from the request
  const { userId } = getAuth(req);

  // Check if the user is authenticated
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch additional user data from your database if needed
  // Example SQL query to fetch user details
  try {
    const result = await sql`
      SELECT * FROM users WHERE clerk_id = ${userId}
    `;
    const user = result.rows[0];

    // Proceed with your business logic
    // ...

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}



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
        INSERT INTO customers (name, email, ) 
        VALUES (${customerName}, ${email}, } )
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

    const month = sql`SELECT TO_CHAR(date, 'Month') AS month_name FROM invoices
    `;

    const amt = sql`SELECT revenue FROM revenue WHERE month='September';`


    const data = await Promise.all([month, amt]);
    const month_name = data[0].rows[0].month_name;
    let sum = Number(data[1].rows[0].revenue ?? 0);
    sum = sum + amount;
    await sql`
    UPDATE revenue 
    SET revenue = ${sum} 
    where month = ${month_name}
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
    

    const invoice_month = sql`SELECT TO_CHAR(date, 'FMMonth') AS month_name FROM invoices WHERE id = ${id}`;
    const invoice_amount = sql`SELECT amount FROM invoices WHERE id = ${id}`;
    
    
    const data = await Promise.all([invoice_month, invoice_amount]);

    

    const month = data[0].rows[0].month_name;
    const amount = Number(data[1].rows[0].amount ?? 0);

    

    const amt = await sql`SELECT revenue FROM revenue WHERE month = ${month};`;

    let sum = Number(amt.rows[0].revenue ?? 0);
    sum = sum - (amount / 100); 

    await sql`
    UPDATE revenue 
    SET revenue = ${sum} 
    where month = ${month}
    `;
    
    await sql `DELETE FROM invoices WHERE id = ${id}`;
    

    revalidatePath('/dashboard/invoices');
    return {message: 'Deleted Invoice.'};
    } catch (error) {
        return {message: 'Failed to delete invoices' };
    }
    
}




