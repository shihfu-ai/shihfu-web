'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getStaff, clearAuth, isLoggedIn } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState('overview');
  const [staff, setStaff] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [reminderSummary, setReminderSummary] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name:'', phone:'', email:'', city:'',
    preferredChannel:'whatsapp', optedInWhatsapp:true,
    optedInSms:false, optedInEmail:false,
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const s = getStaff();
    setStaff(s);
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dash, custs, rems, remSum, evs] = await Promise.all([
        api.getDashboard().catch(() => ({})),
        api.getCustomers({ limit:50 }).catch(() => ({ data:[] })),
        api.getReminders({ limit:50 }).catch(() => ({ data:[] })),
        api.getReminderSummary().catch(() => ({ data:{} })),
        api.getServiceEvents({ limit:20 }).catch(() => ({ data:[] })),
      ]);
      setDashboard(dash.data || {});
      setCustomers(custs.data || []);
      setReminders(rems.data || []);
      setReminderSummary(remSum.data || {});
      setEvents(evs.data || []);
    } catch (err) {
      showToast('Something went wrong loading data', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function logout() {
    clearAuth();
    router.push('/login');
  }

  async function handleSendReminder(id, name) {
    try {
      await api.sendReminder(id);
      showToast(`Reminder sent to ${name}`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Send failed', 'error');
    }
  }

  async function handleSkipReminder(id) {
    try {
      await api.skipReminder(id);
      showToast('Reminder skipped');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed', 'error');
    }
  }

  async function handleSendAllOverdue() {
    try {
      const res = await api.sendAllOverdue();
      showToast(res.message || 'Overdue reminders sent');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed', 'error');
    }
  }

  async function handleAddCustomer(e) {
    e.preventDefault();
    try {
      await api.createCustomer(newCustomer);
      showToast(`${newCustomer.name} added successfully`);
      setShowAddCustomer(false);
      setNewCustomer({
        name:'', phone:'', email:'', city:'',
        preferredChannel:'whatsapp', optedInWhatsapp:true,
        optedInSms:false, optedInEmail:false,
      });
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to add customer', 'error');
    }
  }

  const filteredCustomers = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const ret = dashboard?.retention || {};
  const queue = dashboard?.queue || {};

  const kpis = [
    { label:'Total Customers', value: ret.total_customers || 0, color:'#f0a500' },
    { label:'Active (90 days)', value: ret.active_customers || 0, color:'#34d399' },
    { label:'Reminders Sent', value: reminderSummary.sent_this_month || 0, color:'#2dd4bf' },
    { label:'Overdue Follow-ups', value: queue.overdue || 0, color:'#f05252' },
  ];

  const S = {
    shell:{ display:'grid', gridTemplateColumns:'220px 1fr', height:'100vh', background:'#111214', color:'#e4e6eb', fontFamily:'inherit' },
    sidebar:{ background:'#18191d', borderRight:'1px solid rgba(255,255,255,.07)', display:'flex', flexDirection:'column', overflow:'hidden' },
    sbTop:{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,.07)' },
    logo:{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:700, color:'#e4e6eb' },
    navItem:(active) => ({
      display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
      borderRadius:6, cursor:'pointer', transition:'all .15s',
      color: active ? '#f0a500' : '#9499a6', fontSize:'.82rem', fontWeight:500,
      background: active ? 'rgba(240,165,0,.1)' : 'transparent',
      border: active ? '1px solid rgba(240,165,0,.15)' : '1px solid transparent',
      marginBottom:2,
    }),
    main:{ display:'flex', flexDirection:'column', overflow:'hidden' },
    topbar:{ height:56, borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'#18191d', flexShrink:0 },
    content:{ flex:1, overflowY:'auto', padding:24 },
    card:{ background:'#18191d', border:'1px solid rgba(255,255,255,.07)', borderRadius:10, overflow:'hidden', marginBottom:16 },
    cardHeader:{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between' },
    input:{ background:'#1e2025', border:'1px solid rgba(255,255,255,.07)', borderRadius:6, padding:'7px 10px', fontSize:'.8rem', color:'#e4e6eb', outline:'none', fontFamily:'inherit', width:'100%' },
    btn:(color='#f0a500') => ({
      background:color, color: color === '#f0a500' ? '#111' : '#e4e6eb',
      border:'none', borderRadius:6, padding:'6px 14px',
      fontSize:'.78rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
      transition:'all .15s',
    }),
    pill:(type) => {
      const map = {
        active:{ bg:'rgba(52,211,153,.1)', color:'#34d399', border:'rgba(52,211,153,.2)' },
        dormant:{ bg:'rgba(255,255,255,.05)', color:'#9499a6', border:'rgba(255,255,255,.1)' },
        overdue:{ bg:'rgba(240,82,82,.1)', color:'#f05252', border:'rgba(240,82,82,.2)' },
        whatsapp:{ bg:'rgba(52,211,153,.1)', color:'#34d399', border:'rgba(52,211,153,.2)' },
        sms:{ bg:'rgba(96,165,250,.1)', color:'#60a5fa', border:'rgba(96,165,250,.2)' },
        email:{ bg:'rgba(240,165,0,.1)', color:'#f0a500', border:'rgba(240,165,0,.2)' },
      };
      const c = map[type] || map.dormant;
      return { display:'inline-block', background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:4, padding:'2px 8px', fontSize:'.65rem', fontWeight:600, fontFamily:'monospace', letterSpacing:'.03em' };
    },
  };

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#111214', color:'#9499a6', fontFamily:'monospace', fontSize:'.85rem', letterSpacing:'.1em' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div style={S.shell}>

      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.sbTop}>
          <div style={S.logo}>Shih<span style={{color:'#f0a500'}}>-Fu</span></div>
          <div style={{
            marginTop:12, padding:'8px 10px', background:'#1e2025',
            borderRadius:6, border:'1px solid rgba(255,255,255,.07)',
          }}>
            <div style={{ fontSize:'.75rem', fontWeight:600, color:'#e4e6eb' }}>
              {staff?.businessName || 'Your Business'}
            </div>
            <div style={{ fontSize:'.65rem', color:'#5c6070', marginTop:1 }}>
              {staff?.plan || 'Growth'} Plan
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
          {[
            { id:'overview',   label:'Overview' },
            { id:'customers',  label:'Customers' },
            { id:'servicelog', label:'Service Log' },
            { id:'reminders',  label:'Reminder Queue' },
          ].map(n => (
            <div key={n.id} style={S.navItem(activePanel === n.id)}
              onClick={() => setActivePanel(n.id)}>
              {n.label}
              {n.id === 'reminders' && queue.overdue > 0 && (
                <span style={{
                  marginLeft:'auto', background:'#f05252', color:'white',
                  fontSize:'.6rem', fontWeight:600, padding:'1px 6px',
                  borderRadius:10, fontFamily:'monospace',
                }}>{queue.overdue}</span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
          <div style={S.navItem(false)} onClick={logout}>Sign Out</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={S.main}>

        {/* TOPBAR */}
        <div style={S.topbar}>
          <div>
            <div style={{ fontSize:'.68rem', fontFamily:'monospace', color:'#5c6070', letterSpacing:'.08em', textTransform:'uppercase' }}>
              Dashboard / {activePanel}
            </div>
            <div style={{ fontSize:'1rem', fontStyle:'italic', fontFamily:'Georgia,serif', color:'#e4e6eb' }}>
              {staff ? `Welcome back, ${staff.name?.split(' ')[0]}` : 'Dashboard'}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button style={S.btn('#1e2025')} onClick={() => setShowAddCustomer(true)}>
              + Add Customer
            </button>
            <button style={S.btn()}>+ Log Service</button>
            <div style={{
              width:30, height:30, borderRadius:'50%',
              background:'rgba(240,165,0,.15)', border:'1.5px solid rgba(240,165,0,.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'.8rem', fontWeight:700, color:'#f0a500', cursor:'pointer',
            }}>
              {staff?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* ── OVERVIEW ── */}
          {activePanel === 'overview' && (
            <div>
              {/* KPI Grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
                {kpis.map((k, i) => (
                  <div key={i} style={{
                    ...S.card, marginBottom:0, padding:16, position:'relative', overflow:'hidden',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${k.color},transparent)` }}></div>
                    <div style={{ fontSize:'.65rem', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', color:'#9499a6', marginBottom:10 }}>
                      {k.label}
                    </div>
                    <div style={{ fontSize:'1.9rem', fontWeight:700, color:k.color, lineHeight:1 }}>
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Queue summary */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={{ fontSize:'.78rem', fontWeight:600, color:'#e4e6eb' }}>This Week — Reminder Queue</span>
                  <button style={{ ...S.btn(), fontSize:'.7rem', padding:'4px 10px' }}
                    onClick={() => setActivePanel('reminders')}>
                    View All
                  </button>
                </div>
                <div style={{ padding:16, display:'flex', gap:24 }}>
                  {[
                    { label:'Overdue', val: queue.overdue || 0, color:'#f05252' },
                    { label:'Due Today', val: queue.today || 0, color:'#f0a500' },
                    { label:'Upcoming', val: queue.upcoming || 0, color:'#2dd4bf' },
                  ].map((q, i) => (
                    <div key={i} style={{
                      flex:1, textAlign:'center', padding:'16px 8px',
                      background:'#1e2025', borderRadius:8,
                      border:'1px solid rgba(255,255,255,.07)',
                    }}>
                      <div style={{ fontSize:'2rem', fontWeight:700, color:q.color, lineHeight:1, fontFamily:'monospace' }}>
                        {q.val}
                      </div>
                      <div style={{ fontSize:'.7rem', color:'#9499a6', marginTop:4, letterSpacing:'.05em' }}>
                        {q.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent customers */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={{ fontSize:'.78rem', fontWeight:600, color:'#e4e6eb' }}>Recent Customers</span>
                  <button style={{ ...S.btn('#1e2025'), fontSize:'.7rem', padding:'4px 10px', border:'1px solid rgba(255,255,255,.07)', color:'#9499a6' }}
                    onClick={() => setActivePanel('customers')}>
                    View All
                  </button>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                        {['Customer','Phone','Status','Channel','Last Visit'].map(h => (
                          <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'.63rem', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', color:'#5c6070', fontWeight:500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.slice(0, 5).map(c => (
                        <tr key={c.id} style={{ borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                          <td style={{ padding:'11px 16px', fontSize:'.82rem', fontWeight:600, color:'#e4e6eb' }}>{c.name}</td>
                          <td style={{ padding:'11px 16px', fontSize:'.78rem', color:'#9499a6', fontFamily:'monospace' }}>+91 {c.phone}</td>
                          <td style={{ padding:'11px 16px' }}><span style={S.pill(c.status)}>{c.status}</span></td>
                          <td style={{ padding:'11px 16px' }}><span style={S.pill(c.preferred_channel)}>{c.preferred_channel}</span></td>
                          <td style={{ padding:'11px 16px', fontSize:'.75rem', color:'#9499a6', fontFamily:'monospace' }}>
                            {c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : '—'}
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr><td colSpan={5} style={{ padding:40, textAlign:'center', color:'#5c6070', fontSize:'.85rem' }}>
                          No customers yet. Add your first customer to get started.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {activePanel === 'customers' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:'.68rem', fontFamily:'monospace', color:'#5c6070', textTransform:'uppercase', letterSpacing:'.1em' }}>Customer Management</div>
                  <div style={{ fontSize:'1.1rem', fontStyle:'italic', fontFamily:'Georgia,serif', color:'#e4e6eb' }}>All Customers</div>
                </div>
                <button style={S.btn()} onClick={() => setShowAddCustomer(true)}>+ Add Customer</button>
              </div>

              <div style={S.card}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', gap:8, alignItems:'center' }}>
                  <input style={{ ...S.input, maxWidth:280 }}
                    placeholder="Search by name or phone..."
                    value={search} onChange={e => setSearch(e.target.value)}/>
                  <span style={{ marginLeft:'auto', fontSize:'.65rem', fontFamily:'monospace', background:'#1e2025', color:'#9499a6', padding:'3px 10px', borderRadius:4 }}>
                    {filteredCustomers.length} records
                  </span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                        {['Customer','Phone','Entity','Last Visit','Next Due','Status','Channel'].map(h => (
                          <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'.63rem', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', color:'#5c6070', fontWeight:500, whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                          <td style={{ padding:'11px 12px', fontSize:'.82rem', fontWeight:600, color:'#e4e6eb', whiteSpace:'nowrap' }}>{c.name}</td>
                          <td style={{ padding:'11px 12px', fontSize:'.75rem', color:'#9499a6', fontFamily:'monospace' }}>+91 {c.phone}</td>
                          <td style={{ padding:'11px 12px', fontSize:'.78rem', color:'#9499a6' }}>
                            {c.entity_name ? `${c.entity_name} · ${c.breed_or_model || ''}` : '—'}
                          </td>
                          <td style={{ padding:'11px 12px', fontSize:'.72rem', color:'#9499a6', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                            {c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding:'11px 12px', fontSize:'.72rem', fontFamily:'monospace', whiteSpace:'nowrap', color: c.status === 'overdue' ? '#f05252' : '#2dd4bf' }}>
                            {c.next_reminder_at ? new Date(c.next_reminder_at).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding:'11px 12px' }}><span style={S.pill(c.status)}>{c.status}</span></td>
                          <td style={{ padding:'11px 12px' }}><span style={S.pill(c.preferred_channel)}>{c.preferred_channel}</span></td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#5c6070', fontSize:'.85rem' }}>
                          No customers found.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICE LOG ── */}
          {activePanel === 'servicelog' && (
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:'.68rem', fontFamily:'monospace', color:'#5c6070', textTransform:'uppercase', letterSpacing:'.1em' }}>Service Log</div>
                <div style={{ fontSize:'1.1rem', fontStyle:'italic', fontFamily:'Georgia,serif', color:'#e4e6eb' }}>Recent Service Events</div>
              </div>
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={{ fontSize:'.78rem', fontWeight:600, color:'#e4e6eb' }}>All Events</span>
                  <span style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#9499a6' }}>{events.length} records</span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                        {['Customer','Service','Date','Amount','Staff','Status'].map(h => (
                          <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'.63rem', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', color:'#5c6070', fontWeight:500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(e => (
                        <tr key={e.id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                          <td style={{ padding:'11px 16px', fontSize:'.82rem', fontWeight:600, color:'#e4e6eb' }}>{e.customer_name}</td>
                          <td style={{ padding:'11px 16px', fontSize:'.82rem', color:'#9499a6' }}>{e.service_type}</td>
                          <td style={{ padding:'11px 16px', fontSize:'.75rem', color:'#9499a6', fontFamily:'monospace' }}>
                            {new Date(e.event_date).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding:'11px 16px', fontSize:'.78rem', color:'#f0a500', fontFamily:'monospace' }}>
                            {e.amount_charged ? `₹${e.amount_charged}` : '—'}
                          </td>
                          <td style={{ padding:'11px 16px', fontSize:'.78rem', color:'#9499a6' }}>{e.logged_by_name || '—'}</td>
                          <td style={{ padding:'11px 16px' }}><span style={S.pill(e.status === 'completed' ? 'active' : 'dormant')}>{e.status}</span></td>
                        </tr>
                      ))}
                      {events.length === 0 && (
                        <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#5c6070', fontSize:'.85rem' }}>
                          No service events yet. Log a service to get started.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── REMINDERS ── */}
          {activePanel === 'reminders' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:'.68rem', fontFamily:'monospace', color:'#5c6070', textTransform:'uppercase', letterSpacing:'.1em' }}>Automation</div>
                  <div style={{ fontSize:'1.1rem', fontStyle:'italic', fontFamily:'Georgia,serif', color:'#e4e6eb' }}>Reminder Queue</div>
                </div>
                <button style={S.btn()} onClick={handleSendAllOverdue}>Send All Overdue</button>
              </div>

              {/* Summary stats */}
              <div style={{ display:'flex', gap:0, border:'1px solid rgba(255,255,255,.07)', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
                {[
                  { label:'Overdue', val: reminderSummary.overdue || 0, color:'#f05252' },
                  { label:'Due Today', val: reminderSummary.today || 0, color:'#f0a500' },
                  { label:'Upcoming', val: reminderSummary.upcoming || 0, color:'#2dd4bf' },
                  { label:'Sent This Month', val: reminderSummary.sent_this_month || 0, color:'#34d399' },
                ].map((s, i) => (
                  <div key={i} style={{
                    flex:1, padding:'12px 16px', textAlign:'center',
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,.07)' : 'none',
                    background:'#18191d',
                  }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:700, color:s.color, fontFamily:'monospace' }}>{s.val}</div>
                    <div style={{ fontSize:'.65rem', color:'#9499a6', marginTop:2, letterSpacing:'.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <div style={S.cardHeader}>
                  <span style={{ fontSize:'.78rem', fontWeight:600, color:'#e4e6eb' }}>All Reminders</span>
                </div>
                {reminders.map(r => (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                    borderBottom:'1px solid rgba(255,255,255,.05)',
                    transition:'background .15s',
                  }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'.83rem', fontWeight:600, color:'#e4e6eb' }}>{r.customer_name}</div>
                      <div style={{ fontSize:'.72rem', color:'#9499a6', marginTop:2 }}>
                        {r.entity_name ? `${r.entity_name} — ` : ''}{r.reminder_type}
                      </div>
                      <div style={{ marginTop:4 }}>
                        <span style={S.pill(r.channel)}>{r.channel}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{
                        fontSize:'.72rem', fontFamily:'monospace', fontWeight:600,
                        color: r.urgency === 'overdue' ? '#f05252' : r.urgency === 'today' ? '#f0a500' : '#2dd4bf',
                      }}>
                        {r.urgency === 'overdue' ? `${Math.abs(r.days_until_due)} days overdue` :
                         r.urgency === 'today' ? 'Due Today' :
                         `In ${r.days_until_due} days`}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      {r.status === 'scheduled' && (
                        <>
                          <button style={{
                            padding:'5px 10px', borderRadius:5, fontSize:'.72rem', fontWeight:600,
                            cursor:'pointer', border:'1px solid rgba(45,212,191,.25)',
                            background:'rgba(45,212,191,.08)', color:'#2dd4bf', fontFamily:'inherit',
                          }} onClick={() => handleSendReminder(r.id, r.customer_name)}>
                            Send Now
                          </button>
                          <button style={{
                            padding:'5px 10px', borderRadius:5, fontSize:'.72rem', fontWeight:600,
                            cursor:'pointer', border:'1px solid rgba(255,255,255,.07)',
                            background:'#1e2025', color:'#9499a6', fontFamily:'inherit',
                          }} onClick={() => handleSkipReminder(r.id)}>
                            Skip
                          </button>
                        </>
                      )}
                      {r.status === 'sent' && (
                        <span style={{ ...S.pill('active'), padding:'5px 10px' }}>Sent</span>
                      )}
                    </div>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color:'#5c6070', fontSize:'.85rem' }}>
                    No reminders scheduled. Log a service event to create reminders automatically.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddCustomer && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
          zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(4px)',
        }} onClick={() => setShowAddCustomer(false)}>
          <div style={{
            background:'#18191d', border:'1px solid rgba(255,255,255,.12)',
            borderRadius:12, padding:'2rem', width:'100%', maxWidth:480,
            maxHeight:'85vh', overflowY:'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'.95rem', fontWeight:700, color:'#e4e6eb' }}>Add New Customer</div>
              <button style={{ background:'#1e2025', border:'1px solid rgba(255,255,255,.07)', borderRadius:6, color:'#9499a6', width:28, height:28, cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}
                onClick={() => setShowAddCustomer(false)}>x</button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { label:'Full Name *', field:'name', placeholder:'Priya Sharma' },
                { label:'Mobile (10 digits) *', field:'phone', placeholder:'98765 43210' },
                { label:'Email', field:'email', placeholder:'priya@gmail.com' },
                { label:'City', field:'city', placeholder:'Bengaluru' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ display:'block', fontSize:'.63rem', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', color:'#9499a6', marginBottom:'.4rem' }}>{f.label}</label>
                  <input style={S.input} placeholder={f.placeholder}
                    value={newCustomer[f.field]}
                    onChange={e => setNewCustomer(n => ({ ...n, [f.field]: e.target.value }))}
                    required={f.label.includes('*')}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:'.63rem', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', color:'#9499a6', marginBottom:'.4rem' }}>Preferred Channel</label>
                <select style={{ ...S.input, cursor:'pointer' }}
                  value={newCustomer.preferredChannel}
                  onChange={e => setNewCustomer(n => ({ ...n, preferredChannel: e.target.value }))}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:'.5rem' }}>
                <button type="button" style={{ ...S.btn('#1e2025'), flex:1, padding:'.8rem', border:'1px solid rgba(255,255,255,.07)', color:'#9499a6' }}
                  onClick={() => setShowAddCustomer(false)}>Cancel</button>
                <button type="submit" style={{ ...S.btn(), flex:1, padding:'.8rem' }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:2000,
          background:'#18191d', border:`1px solid ${toast.type === 'error' ? 'rgba(240,82,82,.3)' : 'rgba(255,255,255,.12)'}`,
          borderLeft:`3px solid ${toast.type === 'error' ? '#f05252' : '#34d399'}`,
          borderRadius:8, padding:'12px 16px', fontSize:'.82rem', color:'#e4e6eb',
          boxShadow:'0 8px 32px rgba(0,0,0,.4)', minWidth:240,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}