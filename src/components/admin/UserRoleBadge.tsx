import { ReactNode } from 'react';

export function UserRoleBadge({ role }: { role: 'admin' | 'staff' | 'customer' }) {
  const styles = {
    admin: 'bg-gold-100 text-gold-700 border-gold-200',
    staff: 'bg-celeste-100 text-celeste-700 border-celeste-200',
    customer: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const labels = {
    admin: 'Administrador',
    staff: 'Personal',
    customer: 'Cliente',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}
