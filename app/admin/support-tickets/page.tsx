'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, RefreshCw } from 'lucide-react';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'normal' | 'high';

interface SupportTicket {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: 'chatbot' | 'contact_form';
  status: TicketStatus;
  priority: TicketPriority;
  metadata?: {
    lastUserMessage?: string;
    matchedEntryIds?: string[];
    evidenceSufficient?: boolean;
  };
  createdAt: string;
}

const statuses: Array<'all' | TicketStatus> = ['all', 'open', 'in_progress', 'resolved', 'closed'];

function statusBadge(status: TicketStatus) {
  const classes = {
    open: 'bg-blue-50 text-blue-700 ring-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
    resolved: 'bg-green-50 text-green-700 ring-green-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return classes[status];
}

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/support-tickets?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch support tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(ticket => ticket.status === 'open').length,
    inProgress: tickets.filter(ticket => ticket.status === 'in_progress').length,
    resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
  }), [tickets]);

  const updateTicket = async (
    ticketId: string,
    update: Partial<Pick<SupportTicket, 'status' | 'priority'>>
  ) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/support-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error('Failed to update support ticket');
      }

      const data = await response.json();
      setTickets(current => current.map(ticket =>
        ticket._id === ticketId ? data.ticket : ticket
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update support ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review chatbot support requests and follow up with customers.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Showing</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Open</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{counts.open}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{counts.inProgress}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{counts.resolved}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map(status => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          Loading support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          No support tickets found.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <article key={ticket._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{ticket.subject}</h2>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${statusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    {ticket.priority === 'high' && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                        high priority
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.name} • {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                    <a href={`mailto:${ticket.email}`} className="inline-flex items-center gap-1 hover:text-blue-700">
                      <Mail className="h-4 w-4" />
                      {ticket.email}
                    </a>
                    {ticket.phone && (
                      <a href={`tel:${ticket.phone}`} className="inline-flex items-center gap-1 hover:text-blue-700">
                        <Phone className="h-4 w-4" />
                        {ticket.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={ticket.status}
                    onChange={e => updateTicket(ticket._id, { status: e.target.value as TicketStatus })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={ticket.priority}
                    onChange={e => updateTicket(ticket._id, { priority: e.target.value as TicketPriority })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {ticket.message}
              </div>

              {ticket.metadata && (
                <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                  <p>Source: {ticket.source}</p>
                  <p>Evidence: {ticket.metadata.evidenceSufficient === false ? 'insufficient' : 'available/unknown'}</p>
                  <p>KB IDs: {ticket.metadata.matchedEntryIds?.join(', ') || 'none'}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
