import { redirect } from 'next/navigation';

export default function UauthorisedPage() {
  redirect('/unauthorized');
}
