import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, Inbox, ArrowLeft, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import clsx from 'clsx';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function MessagesPanel() {
  const [open, setOpen]         = useState(false);
  const [tab, setTab]           = useState('inbox');     // inbox | sent | compose
  const [inbox, setInbox]       = useState([]);
  const [sent, setSent]         = useState([]);
  const [unread, setUnread]     = useState(0);
  const [selected, setSelected] = useState(null);        // full message view
  const [employees, setEmployees] = useState([]);
  const [sending, setSending]   = useState(false);
  const [form, setForm] = useState({ recipientId:'', subject:'', body:'' });
  const panelRef = useRef(null);

  const fetchAll = async () => {
    try {
      const [inboxRes, sentRes, countRes] = await Promise.all([
        api.get('/messages/inbox'),
        api.get('/messages/sent'),
        api.get('/messages/unread-count'),
      ]);
      setInbox(inboxRes.data.data || []);
      setSent(sentRes.data.data  || []);
      setUnread(countRes.data.count || 0);
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open && employees.length === 0) {
      api.get('/messages/employees').then(r => setEmployees(r.data.data || [])).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openMessage = async (msg) => {
    try {
      const res = await api.get(`/messages/${msg._id}`);
      setSelected(res.data.data);
      if (!msg.read && tab === 'inbox') {
        setInbox(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
        setUnread(prev => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const deleteMsg = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/messages/${id}`).catch(() => {});
    setInbox(prev => prev.filter(m => m._id !== id));
    setSent(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const handleSend = async () => {
    if (!form.recipientId || !form.subject.trim() || !form.body.trim())
      return alert('All fields are required');
    setSending(true);
    try {
      await api.post('/messages', form);
      setForm({ recipientId:'', subject:'', body:'' });
      setTab('sent');
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const messages = tab === 'inbox' ? inbox : sent;

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
        <MessageSquare size={16} className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 flex flex-col" style={{ height: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              {selected && (
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 mr-1">
                  <ArrowLeft size={15} />
                </button>
              )}
              <h3 className="font-semibold text-gray-900">
                {selected ? 'Message' : 'Messages'}
              </h3>
              {unread > 0 && !selected && (
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!selected && (
                <button onClick={() => { setTab('compose'); setSelected(null); }}
                  className="flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1 rounded-lg hover:bg-primary-600">
                  <Send size={11} /> Compose
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {!selected && tab !== 'compose' && (
            <div className="flex border-b border-gray-100 shrink-0">
              {['inbox','sent'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={clsx('flex-1 py-2 text-xs font-medium capitalize transition-colors border-b-2',
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600')}>
                  {t === 'inbox' ? `Inbox ${inbox.filter(m => !m.read).length > 0 ? `(${inbox.filter(m => !m.read).length})` : ''}` : 'Sent'}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Compose */}
            {tab === 'compose' && !selected && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">To</label>
                  <select value={form.recipientId} onChange={e => setForm(p => ({...p, recipientId: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100">
                    <option value="">Select recipient...</option>
                    {employees.map(e => (
                      <option key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} — {e.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Subject</label>
                  <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}
                    placeholder="Message subject..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Message</label>
                  <textarea value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))}
                    rows={7} placeholder="Write your message..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTab('inbox')} className="btn-outline flex-1 text-xs">Cancel</button>
                  <button onClick={handleSend} disabled={sending}
                    className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5 disabled:opacity-60">
                    <Send size={12} /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}

            {/* Message detail */}
            {selected && (
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{selected.subject}</h4>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500">
                    {tab === 'inbox'
                      ? `From: ${selected.sender?.firstName} ${selected.sender?.lastName}`
                      : `To: ${selected.recipient?.firstName} ${selected.recipient?.lastName}`}
                    {' · '}{selected.sender?.department}
                  </p>
                  <p className="text-[10px] text-gray-400">{timeAgo(selected.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selected.body}
                </div>
                <button
                  onClick={() => { setForm({ recipientId: selected.sender?._id || '', subject: `Re: ${selected.subject}`, body: '' }); setTab('compose'); setSelected(null); }}
                  className="mt-3 btn-primary text-xs flex items-center gap-1.5">
                  <Send size={12} /> Reply
                </button>
              </div>
            )}

            {/* Inbox / Sent list */}
            {!selected && tab !== 'compose' && (
              <>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <Inbox size={28} className="mb-2 opacity-30" />
                    <p className="text-sm">{tab === 'inbox' ? 'Your inbox is empty' : 'No sent messages'}</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg._id} onClick={() => openMessage(msg)}
                    className={clsx(
                      'flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group',
                      tab === 'inbox' && !msg.read && 'bg-primary-50/40'
                    )}>
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {tab === 'inbox'
                        ? `${msg.sender?.firstName?.[0] || '?'}${msg.sender?.lastName?.[0] || ''}`
                        : `${msg.recipient?.firstName?.[0] || '?'}${msg.recipient?.lastName?.[0] || ''}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={clsx('text-xs truncate', !msg.read && tab === 'inbox' ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>
                          {tab === 'inbox'
                            ? `${msg.sender?.firstName} ${msg.sender?.lastName}`
                            : `${msg.recipient?.firstName} ${msg.recipient?.lastName}`}
                        </p>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                          <button onClick={(e) => deleteMsg(e, msg._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 ml-1">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      <p className={clsx('text-xs mt-0.5 truncate', !msg.read && tab === 'inbox' ? 'text-gray-700 font-medium' : 'text-gray-500')}>
                        {msg.subject}
                      </p>
                    </div>
                    {tab === 'inbox' && !msg.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
