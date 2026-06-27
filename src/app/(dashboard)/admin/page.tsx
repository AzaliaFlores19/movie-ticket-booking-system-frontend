import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const role = (await cookies()).get('auth_role')?.value;
  if (role === 'RECEPCIONISTA') {
    redirect('/admin/reservations');
  }
  redirect('/admin/movies');
}
