'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getStaff, clearAuth, isLoggedIn } from '../../lib/api';

const ENTITY_CONFIG = {
  veterinary: {
    label: 'Pet Details', namePlaceholder: 'e.g. Champ',
    typeLabel: 'Species', typeOptions: ['Dog','Cat','Bird','Rabbit','Guinea Pig','Other'],
    breedLabel: 'Breed', breedPlaceholder: 'e.g. Labrador, Persian',
    extraFields: [
      { key:'gender',    label:'Gender',       type:'select', options:['Male','Female','Unknown'] },
      { key:'dobOrYear', label:'Age / DOB',    type:'text',   placeholder:'e.g. 6 years or Jan 2019' },
      { key:'microchip', label:'Microchip ID', type:'text',   placeholder:'Optional' },
    ],
  },
  salon_beauty: {
    label: 'Client Details', namePlaceholder: 'e.g. Priya',
    typeLabel: 'Service Focus', typeOptions: ['Hair','Skin','Nails','Full Body','Bridal','Other'],
    breedLabel: 'Hair Type / Skin Type', breedPlaceholder: 'e.g. Curly hair, Oily skin',
    extraFields: [
      { key:'gender',    label:'Gender',   type:'select', options:['Female','Male','Other'] },
      { key:'dobOrYear', label:'Birthday', type:'text',   placeholder:'e.g. March 1990 (optional)' },
    ],
  },
  auto_repair: {
    label: 'Vehicle Details', namePlaceholder: 'e.g. MH12 AB1234',
    typeLabel: 'Vehicle Type', typeOptions: ['Car','Two Wheeler','SUV','Commercial Vehicle','Other'],
    breedLabel: 'Make & Model', breedPlaceholder: 'e.g. Maruti Swift, Honda Activa',
    extraFields: [
      { key:'dobOrYear',       label:'Year of Manufacture', type:'text',   placeholder:'e.g. 2019' },
      { key:'registrationNo',  label:'Registration No.',   type:'text',   placeholder:'e.g. MH12 AB1234' },
      { key:'fuelType',        label:'Fuel Type',          type:'select', options:['Petrol','Diesel','CNG','Electric','Hybrid'] },
      { key:'insuranceExpiry', label:'Insurance Expiry',   type:'date',   placeholder:'' },
    ],
  },
};

const DEFAULT_ENTITY_CONFIG = {
  label:'Entity Details', namePlaceholder:'e.g. Entity name',
  typeLabel:'Type', typeOptions:['Person','Vehicle','Pet','Other'],
  breedLabel:'Description', breedPlaceholder:'e.g. Details',
  extraFields:[{ key:'dobOrYear', label:'Year / DOB', type:'text', placeholder:'Optional' }],
};

const SERVICE_TYPES = {
  veterinary:   ['Annual Vaccination','Booster Shot','Grooming','Annual Checkup','Deworming','Dental Cleaning','Post-Surgery Follow-up','Emergency Visit','Other'],
  salon_beauty: ['Hair Cut','Hair Color / Highlights','Keratin / Smoothening','Facial / Cleanup','Manicure / Pedicure','Waxing / Threading','Bridal Package','Hair Spa','Other'],
  auto_repair:  ['Oil Change','Full Service','Tyre Rotation / Replacement','Battery Check / Replacement','AC Service & Gas Refill','Insurance Renewal','Brake Service','Engine Repair','Other'],
};

const FOLLOW_UP_OPTIONS = [
  { label:'7 days',            value:'7'   },
  { label:'14 days',           value:'14'  },
  { label:'21 days (grooming)',value:'21'  },
  { label:'30 days',           value:'30'  },
  { label:'90 days',           value:'90'  },
  { label:'180 days',          value:'180' },
  { label:'365 days (annual)', value:'365' },
];

// ── Shared blank customer/entity state ──────────────────────────
const blankCustomer = { name:'', phone:'', email:'', city:'' };
const blankEntity   = { name:'', entityType:'', breedOrModel:'', gender:'', dobOrYear:'', registrationNo:'', fuelType:'', insuranceExpiry:'', microchip:'' };

export default function DashboardPage() {
  const router     = useRouter();
  const profileRef = useRef(null);

  const [activePanel, setActivePanel]         = useState('overview');
  const [staff, setStaff]                     = useState(null);
  const [vertical, setVertical]               = useState('veterinary');
  const [dashboard, setDashboard]             = useState(null);
  const [customers, setCustomers]             = useState([]);
  const [reminders, setReminders]             = useState([]);
  const [reminderSummary, setReminderSummary] = useState({});
  const [events, setEvents]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState('');
  const [toast, setToast]                     = useState(null);
  const [showProfile, setShowProfile]         = useState(false);

  // Add Customer
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [custChannels, setCustChannels]       = useState(['whatsapp']);
  const [newCustomer, setNewCustomer]         = useState({ ...blankCustomer });
  const [newEntity, setNewEntity]             = useState({ ...blankEntity });

  // Edit Customer — uses same fields as Add Customer
  const [showEditCustomer, setShowEditCustomer]   = useState(false);
  const [editingCustomer, setEditingCustomer]     = useState(null);
  const [editCustomer, setEditCustomer]           = useState({ ...blankCustomer });
  const [editEntity, setEditEntity]               = useState({ ...blankEntity });
  const [editChannels, setEditChannels]           = useState(['whatsapp']);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCustomer, setDeletingCustomer]   = useState(null);

  // Log Service
  const [showLogService, setShowLogService] = useState(false);
  const [serviceForm, setServiceForm]       = useState({
    customerId:'', serviceType:'', eventDate:new Date().toISOString().split('T')[0],
    staffName:'', amountCharged:'', paymentMethod:'', followUpDays:'365', notes:'',
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const s = getStaff();
    setStaff(s);
    if (s?.vertical) setVertical(s.vertical);
    loadData();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dash, custs, rems, remSum, evs] = await Promise.all([
        api.getDashboard().catch(()=>({})),
        api.getCustomers({ limit:50 }).catch(()=>({ data:[] })),
        api.getReminders({ limit:50 }).catch(()=>({ data:[] })),
        api.getReminderSummary().catch(()=>({ data:{} })),
        api.getServiceEvents({ limit:20 }).catch(()=>({ data:[] })),
      ]);
      setDashboard(dash.data || {});
      setCustomers(custs.data || []);
      setReminders(rems.data || []);
      setReminderSummary(remSum.data || {});
      setEvents(evs.data || []);
    } catch { showToast('Something went wrong loading data','error'); }
    finally   { setLoading(false); }
  }

  function showToast(msg, type='success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function logout() { clearAuth(); router.push('/'); }

  function toggleChannel(ch, setter) {
    setter(prev => prev.includes(ch) ? prev.filter(c=>c!==ch) : [...prev, ch]);
  }

  function resetAddForm() {
    setNewCustomer({ ...blankCustomer });
    setNewEntity({ ...blankEntity });
    setCustChannels(['whatsapp']);
  }

  function entityTypeValue(label) {
    const map = { 'Dog':'dog','Cat':'cat','Bird':'bird','Rabbit':'rabbit','Guinea Pig':'other_animal','Car':'car','Two Wheeler':'two_wheeler','SUV':'car','Commercial Vehicle':'commercial_vehicle' };
    return map[label] || 'other';
  }

  // ── Add Customer ───────────────────────────────────────────────
  async function handleAddCustomer(e) {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) { showToast('Name and phone are required','error'); return; }
    if (!/^[6-9]\d{9}$/.test(newCustomer.phone)) { showToast('Enter a valid 10-digit Indian mobile number','error'); return; }
    if (custChannels.length === 0) { showToast('Select at least one messaging channel','error'); return; }
    const payload = {
      ...newCustomer,
      preferredChannel: custChannels[0],
      optedInWhatsapp:  custChannels.includes('whatsapp'),
      optedInSms:       custChannels.includes('sms'),
      optedInEmail:     custChannels.includes('email'),
      entity: (newEntity.name || newEntity.entityType) ? {
        name:           newEntity.name          || undefined,
        entityType:     entityTypeValue(newEntity.entityType),
        breedOrModel:   newEntity.breedOrModel  || undefined,
        gender:         newEntity.gender?.toLowerCase() || undefined,
        dobOrYear:      newEntity.dobOrYear      || undefined,
        registrationNo: newEntity.registrationNo || undefined,
        notes:          newEntity.microchip ? `Microchip: ${newEntity.microchip}` : undefined,
      } : undefined,
    };
    try {
      await api.createCustomer(payload);
      showToast(`${newCustomer.name} added successfully`);
      setShowAddCustomer(false);
      resetAddForm();
      loadData();
    } catch (err) { showToast(err.message || 'Failed to add customer','error'); }
  }

  // ── Open Edit (pre-populate same fields as Add) ────────────────
  function openEditCustomer(c) {
    setEditingCustomer(c);
    setEditCustomer({
      name:  c.name  || '',
      phone: c.phone || '',
      email: c.email || '',
      city:  c.city  || '',
    });
    setEditEntity({
      name:           c.entity_name      || '',
      entityType:     c.entity_type      || '',
      breedOrModel:   c.breed_or_model   || '',
      gender:         c.gender           || '',
      dobOrYear:      c.dob_or_year      || '',
      registrationNo: c.registration_no  || '',
      fuelType:       c.fuel_type        || '',
      insuranceExpiry:c.insurance_expiry || '',
      microchip:      '',
    });
    const channels = [];
    if (c.opted_in_whatsapp) channels.push('whatsapp');
    if (c.opted_in_sms)      channels.push('sms');
    if (c.opted_in_email)    channels.push('email');
    setEditChannels(channels.length ? channels : [c.preferred_channel || 'whatsapp']);
    setShowEditCustomer(true);
  }

  async function handleEditCustomer(e) {
    e.preventDefault();
    if (!editCustomer.name) { showToast('Name is required','error'); return; }
    if (editChannels.length === 0) { showToast('Select at least one messaging channel','error'); return; }
    const payload = {
      name:             editCustomer.name,
      email:            editCustomer.email   || undefined,
      city:             editCustomer.city    || undefined,
      preferredChannel: editChannels[0],
      optedInWhatsapp:  editChannels.includes('whatsapp'),
      optedInSms:       editChannels.includes('sms'),
      optedInEmail:     editChannels.includes('email'),
    };
    try {
      await api.updateCustomer(editingCustomer.id, payload);
      showToast(`${editCustomer.name} updated successfully`);
      setShowEditCustomer(false);
      setEditingCustomer(null);
      loadData();
    } catch (err) { showToast(err.message || 'Failed to update customer','error'); }
  }

  // ── Delete ─────────────────────────────────────────────────────
  function openDeleteConfirm(c) { setDeletingCustomer(c); setShowDeleteConfirm(true); }

  async function handleDeleteCustomer() {
    try {
      await api.updateCustomer(deletingCustomer.id, { status:'opted_out' });
      showToast(`${deletingCustomer.name} removed`);
      setShowDeleteConfirm(false);
      setDeletingCustomer(null);
      loadData();
    } catch (err) { showToast(err.message || 'Failed to remove customer','error'); }
  }

  // ── Log Service ────────────────────────────────────────────────
  async function handleLogService(e) {
    e.preventDefault();
    if (!serviceForm.customerId || !serviceForm.serviceType) { showToast('Please select a customer and service type','error'); return; }
    try {
      await api.createServiceEvent({
        customerId:    serviceForm.customerId,
        serviceType:   serviceForm.serviceType,
        eventDate:     serviceForm.eventDate,
        staffName:     serviceForm.staffName     || undefined,
        amountCharged: serviceForm.amountCharged ? parseFloat(serviceForm.amountCharged) : undefined,
        paymentMethod: serviceForm.paymentMethod || undefined,
        followUpDays:  serviceForm.followUpDays  ? parseInt(serviceForm.followUpDays) : undefined,
        notes:         serviceForm.notes         || undefined,
        status:        'completed',
      });
      showToast('Service logged and reminder scheduled');
      setShowLogService(false);
      setServiceForm({ customerId:'', serviceType:'', eventDate:new Date().toISOString().split('T')[0], staffName:'', amountCharged:'', paymentMethod:'', followUpDays:'365', notes:'' });
      loadData();
    } catch (err) { showToast(err.message || 'Failed to log service','error'); }
  }

  async function handleSendReminder(id, name) {
    try { await api.sendReminder(id); showToast(`Reminder sent to ${name}`); loadData(); }
    catch (err) { showToast(err.message || 'Send failed','error'); }
  }

  async function handleSkipReminder(id) {
    try { await api.skipReminder(id); showToast('Reminder skipped'); loadData(); }
    catch (err) { showToast(err.message || 'Failed','error'); }
  }

  async function handleSendAllOverdue() {
    try { const res = await api.sendAllOverdue(); showToast(res.message || 'Overdue reminders sent'); loadData(); }
    catch (err) { showToast(err.message || 'Failed','error'); }
  }

  const filteredCustomers = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const ret   = dashboard?.retention || {};
  const queue = dashboard?.queue     || {};

  const kpis = [
    { label:'Total Customers',    value:ret.total_customers    ||0, color:'var(--gold)' },
    { label:'Active (90 days)',   value:ret.active_customers   ||0, color:'#4a7c59' },
    { label:'Reminders Sent',     value:reminderSummary.sent_this_month||0, color:'var(--muted)' },
    { label:'Overdue Follow-ups', value:queue.overdue          ||0, color:'var(--rust)' },
  ];

  function pill(type) {
    const map = { active:'sf-pill sf-pill-active', completed:'sf-pill sf-pill-active', dormant:'sf-pill sf-pill-dormant', overdue:'sf-pill sf-pill-overdue', whatsapp:'sf-pill sf-pill-whatsapp', sms:'sf-pill sf-pill-sms', email:'sf-pill sf-pill-email' };
    return map[type] || 'sf-pill sf-pill-dormant';
  }

  const entityCfg   = ENTITY_CONFIG[vertical] || DEFAULT_ENTITY_CONFIG;
  const serviceOpts = SERVICE_TYPES[vertical]  || SERVICE_TYPES.veterinary;
  const navItems    = [
    { id:'overview',   label:'Overview' },
    { id:'customers',  label:'Customers' },
    { id:'servicelog', label:'Service Log' },
    { id:'reminders',  label:'Reminder Queue' },
  ];

  // Shared styles
  const inp = { width:'100%', background:'white', border:'1px solid var(--border)', borderRadius:4, padding:'0.75rem 1rem', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', color:'var(--ink)', outline:'none' };
  const lbl = { display:'block', fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.4rem' };
  const overlay = { position:'fixed', inset:0, background:'rgba(13,13,13,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', padding:'1rem' };
  const mbox = { background:'white', border:'1px solid var(--border)', borderRadius:10, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(13,13,13,0.15)' };
  const mhead = { padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'white', zIndex:1 };
  const divider = { fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', margin:'1.25rem 0 0.75rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.5rem' };
  const closeBtn = { background:'var(--warm)', border:'1px solid var(--border)', borderRadius:4, color:'var(--muted)', width:28, height:28, cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center' };

  // Reusable customer/entity form fields — used in both Add and Edit modals
  function CustomerFormFields({ customer, setCustomer, entity, setEntity, channels, setChannels }) {
    return (
      <>
        {/* Customer info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Full Name *</label>
            <input style={inp} placeholder="Priya Sharma" required value={customer.name} onChange={e=>setCustomer(n=>({...n,name:e.target.value}))}/>
          </div>
          <div>
            <label style={lbl}>Mobile (10 digits) *</label>
            <div style={{ display:'flex' }}>
              <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'0.75rem 0.8rem', fontSize:'0.82rem', fontWeight:600, color:'var(--gold)', whiteSpace:'nowrap' }}>+91</div>
              <input style={{ ...inp, borderRadius:'0 4px 4px 0' }} placeholder="98765 43210" maxLength={10} value={customer.phone} onChange={e=>setCustomer(n=>({...n,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))}/>
            </div>
          </div>
          <div>
            <label style={lbl}>City</label>
            <input style={inp} placeholder="Bengaluru" value={customer.city} onChange={e=>setCustomer(n=>({...n,city:e.target.value}))}/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" placeholder="priya@gmail.com" value={customer.email} onChange={e=>setCustomer(n=>({...n,email:e.target.value}))}/>
          </div>
        </div>

        {/* Messaging Channels */}
        <div>
          <div style={divider}>Messaging Channels <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
          <label style={{ ...lbl, marginBottom:'0.6rem' }}>Select all that apply *</label>
          <div style={{ display:'flex', gap:'0.6rem' }}>
            {[{id:'whatsapp',label:'WhatsApp'},{id:'sms',label:'SMS'},{id:'email',label:'Email'}].map(ch => (
              <div key={ch.id} onClick={() => toggleChannel(ch.id, setChannels)} style={{ flex:1, padding:'0.75rem', borderRadius:6, cursor:'pointer', textAlign:'center', border:`1.5px solid ${channels.includes(ch.id)?'var(--gold)':'var(--border)'}`, background:channels.includes(ch.id)?'rgba(200,168,75,0.08)':'var(--warm)', transition:'all .2s' }}>
                <div style={{ fontSize:'0.8rem', fontWeight:600, color:channels.includes(ch.id)?'var(--gold)':'var(--ink)' }}>{ch.label}</div>
                {channels.includes(ch.id) && <div style={{ fontSize:'0.65rem', color:'var(--gold)', marginTop:2 }}>Selected</div>}
              </div>
            ))}
          </div>
          {channels.length > 0 && (
            <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:'0.4rem' }}>
              Primary: <strong style={{ color:'var(--gold)' }}>{channels[0]}</strong>
              {channels.length > 1 && ` + ${channels.slice(1).join(', ')}`}
            </div>
          )}
        </div>

        {/* Entity / Pet / Vehicle */}
        <div>
          <div style={divider}>{entityCfg.label} <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label style={lbl}>Name</label>
              <input style={inp} placeholder={entityCfg.namePlaceholder} value={entity.name} onChange={e=>setEntity(n=>({...n,name:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>{entityCfg.typeLabel}</label>
              <select style={{ ...inp, cursor:'pointer' }} value={entity.entityType} onChange={e=>setEntity(n=>({...n,entityType:e.target.value}))}>
                <option value="">Select...</option>
                {entityCfg.typeOptions.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>{entityCfg.breedLabel}</label>
              <input style={inp} placeholder={entityCfg.breedPlaceholder} value={entity.breedOrModel} onChange={e=>setEntity(n=>({...n,breedOrModel:e.target.value}))}/>
            </div>
            {entityCfg.extraFields.map(f=>(
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                {f.type==='select'
                  ? <select style={{ ...inp, cursor:'pointer' }} value={entity[f.key]||''} onChange={e=>setEntity(n=>({...n,[f.key]:e.target.value}))}><option value="">Select...</option>{f.options.map(o=><option key={o} value={o}>{o}</option>)}</select>
                  : <input style={inp} type={f.type} placeholder={f.placeholder||''} value={entity[f.key]||''} onChange={e=>setEntity(n=>({...n,[f.key]:e.target.value}))}/>
                }
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.5rem' }}>Shih<span style={{ color:'var(--gold)' }}>-Fu</span></div>
        <div style={{ fontSize:'0.82rem', color:'var(--muted)', letterSpacing:'0.08em' }}>Loading your dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', height:'100vh', background:'var(--cream)', overflow:'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ background:'white', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'1.5rem 1.5rem 1rem', borderBottom:'1px solid var(--border)' }}>
          <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
            Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
          </Link>
          <div style={{ marginTop:'0.9rem', padding:'0.75rem 1rem', background:'var(--warm)', borderRadius:6, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--ink)' }}>{staff?.businessName || 'Your Business'}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{staff?.plan || 'Growth Plan'}</div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'1rem 0.75rem', overflowY:'auto' }}>
          <div style={{ fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted)', padding:'0 0.75rem', marginBottom:'0.5rem' }}>Main</div>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setActivePanel(n.id)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.65rem 0.75rem', borderRadius:6, cursor:'pointer', marginBottom:2, background:activePanel===n.id?'rgba(200,168,75,0.1)':'transparent', color:activePanel===n.id?'var(--gold)':'var(--muted)', fontWeight:activePanel===n.id?600:400, border:activePanel===n.id?'1px solid rgba(200,168,75,0.2)':'1px solid transparent', fontSize:'0.875rem', transition:'all .15s' }}>
              {n.label}
              {n.id==='reminders' && queue.overdue > 0 && (
                <span style={{ background:'var(--rust)', color:'white', fontSize:'0.62rem', fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{queue.overdue}</span>
              )}
            </div>
          ))}
        </nav>
        {/* Sign out removed from sidebar — available in profile dropdown */}
      </aside>

      {/* ── MAIN ── */}
      <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ height:60, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', background:'white', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>Dashboard / {activePanel}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontStyle:'italic', color:'var(--ink)' }}>
              {staff ? `Good day, ${staff.name?.split(' ')[0]}` : 'Dashboard'}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="sf-btn-ghost" style={{ padding:'0.5rem 1rem', fontSize:'0.8rem' }} onClick={() => setShowAddCustomer(true)}>+ Add Customer</button>
            <button className="sf-btn-primary" style={{ padding:'0.5rem 1rem', fontSize:'0.8rem' }} onClick={() => setShowLogService(true)}>+ Log Service</button>

            {/* Profile button */}
            <div ref={profileRef} style={{ position:'relative' }}>
              <div onClick={() => setShowProfile(p=>!p)} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(200,168,75,0.15)', border:'1.5px solid rgba(200,168,75,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, color:'var(--gold)', cursor:'pointer', userSelect:'none' }}>
                {staff?.name?.charAt(0) || 'U'}
              </div>

              {showProfile && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'white', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 8px 32px rgba(13,13,13,0.12)', minWidth:230, zIndex:200, overflow:'hidden' }}>
                  {/* Header */}
                  <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--ink)' }}>{staff?.name || 'User'}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>{staff?.email || ''}</div>
                    <div style={{ marginTop:6 }}><span className="sf-pill sf-pill-active" style={{ fontSize:'0.65rem' }}>{staff?.role || 'owner'}</span></div>
                  </div>
                  {/* Business */}
                  <div style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.3rem' }}>Business</div>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--ink)' }}>{staff?.businessName || 'Your Business'}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>{staff?.vertical?.replace('_',' ') || 'Service Business'}</div>
                  </div>
                  {/* Plan */}
                  <div style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.3rem' }}>Current Plan</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--gold)', textTransform:'capitalize' }}>{staff?.plan || 'Growth'}</span>
                      <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>{staff?.planStatus || 'Active'}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ padding:'0.5rem' }}>
                    {[
                      { label:'Account Settings', href:'/dashboard/settings' },
                      { label:'Help and Support',  href:'/dashboard/help' },
                    ].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setShowProfile(false)} style={{ display:'block', padding:'0.6rem 0.75rem', borderRadius:6, fontSize:'0.82rem', color:'var(--muted)', textDecoration:'none', transition:'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--warm)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        {item.label}
                      </Link>
                    ))}
                    <div onClick={() => { setShowProfile(false); logout(); }} style={{ padding:'0.6rem 0.75rem', borderRadius:6, cursor:'pointer', fontSize:'0.82rem', color:'var(--rust)', fontWeight:500, transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(196,83,42,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      Sign Out
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.5rem' }}>

          {/* OVERVIEW */}
          {activePanel==='overview' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
                {kpis.map((k,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'1.25rem', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:k.color }}/>
                    <div style={{ fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{k.label}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--ink)' }}>This Week — Reminder Queue</span>
                  <button className="sf-btn-primary" style={{ padding:'0.4rem 1rem', fontSize:'0.75rem' }} onClick={() => setActivePanel('reminders')}>View All</button>
                </div>
                <div style={{ display:'flex' }}>
                  {[{label:'Overdue',val:queue.overdue||0,color:'var(--rust)'},{label:'Due Today',val:queue.today||0,color:'var(--gold)'},{label:'Upcoming',val:queue.upcoming||0,color:'#4a7c59'}].map((q,i) => (
                    <div key={i} style={{ flex:1, textAlign:'center', padding:'1.25rem 1rem', borderRight:i<2?'1px solid var(--border)':'none' }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:q.color, lineHeight:1 }}>{q.val}</div>
                      <div style={{ fontSize:'0.72rem', fontWeight:500, color:'var(--muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{q.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--ink)' }}>Recent Customers</span>
                  <button className="sf-btn-ghost" style={{ padding:'0.4rem 1rem', fontSize:'0.75rem' }} onClick={() => setActivePanel('customers')}>View All</button>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                      {['Customer','Phone','Status','Channel','Last Visit'].map(h => <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {customers.slice(0,5).map(c => (
                        <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.875rem', fontWeight:600, color:'var(--ink)' }}>{c.name}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.8rem', color:'var(--muted)' }}>+91 {c.phone}</td>
                          <td style={{ padding:'0.85rem 1rem' }}><span className={pill(c.status)}>{c.status}</span></td>
                          <td style={{ padding:'0.85rem 1rem' }}><span className={pill(c.preferred_channel)}>{c.preferred_channel}</span></td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.78rem', color:'var(--muted)' }}>{c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : 'Not yet'}</td>
                        </tr>
                      ))}
                      {customers.length===0 && <tr><td colSpan={5} style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'0.875rem' }}>No customers yet. Add your first customer to get started.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {activePanel==='customers' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div className="sf-section-label" style={{ marginBottom:'0.25rem' }}>Customer Management</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>All Customers</h2>
                </div>
                <button className="sf-btn-primary" onClick={() => setShowAddCustomer(true)}>+ Add Customer</button>
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'0.85rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
                  <input style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRadius:4, padding:'0.5rem 0.85rem', fontSize:'0.82rem', color:'var(--ink)', outline:'none', width:280, fontFamily:"'DM Sans',sans-serif" }}
                    placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}/>
                  <span style={{ marginLeft:'auto', fontSize:'0.72rem', fontWeight:500, background:'var(--warm)', color:'var(--muted)', padding:'3px 10px', borderRadius:4, border:'1px solid var(--border)' }}>{filteredCustomers.length} records</span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                      {['Customer','Phone','Entity','Last Visit','Next Due','Status','Channel','Actions'].map(h => <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', whiteSpace:'nowrap' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.875rem', fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap' }}>{c.name}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.78rem', color:'var(--muted)' }}>+91 {c.phone}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.8rem', color:'var(--muted)' }}>{c.entity_name ? `${c.entity_name}${c.breed_or_model?' · '+c.breed_or_model:''}` : 'Not added'}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.75rem', color:'var(--muted)', whiteSpace:'nowrap' }}>{c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : 'Not yet'}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.75rem', whiteSpace:'nowrap', color:c.status==='overdue'?'var(--rust)':'#4a7c59' }}>{c.next_reminder_at ? new Date(c.next_reminder_at).toLocaleDateString('en-IN') : 'Not set'}</td>
                          <td style={{ padding:'0.85rem 1rem' }}><span className={pill(c.status)}>{c.status}</span></td>
                          <td style={{ padding:'0.85rem 1rem' }}><span className={pill(c.preferred_channel)}>{c.preferred_channel}</span></td>
                          <td style={{ padding:'0.85rem 1rem', whiteSpace:'nowrap' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={() => openEditCustomer(c)} style={{ padding:'4px 10px', borderRadius:4, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(200,168,75,0.3)', background:'rgba(200,168,75,0.08)', color:'var(--gold)', fontFamily:'inherit' }}>Edit</button>
                              <button onClick={() => openDeleteConfirm(c)} style={{ padding:'4px 10px', borderRadius:4, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(196,83,42,0.3)', background:'rgba(196,83,42,0.06)', color:'var(--rust)', fontFamily:'inherit' }}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length===0 && <tr><td colSpan={8} style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'0.875rem' }}>No customers found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE LOG */}
          {activePanel==='servicelog' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div className="sf-section-label" style={{ marginBottom:'0.25rem' }}>Service Log</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>Recent Service Events</h2>
                </div>
                <button className="sf-btn-primary" onClick={() => setShowLogService(true)}>+ Log New Service</button>
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--ink)' }}>All Events</span>
                  <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>{events.length} records</span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                      {['Customer','Service','Date','Amount','Staff','Status'].map(h => <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {events.map(e => (
                        <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.875rem', fontWeight:600, color:'var(--ink)' }}>{e.customer_name}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.875rem', color:'var(--muted)' }}>{e.service_type}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.78rem', color:'var(--muted)' }}>{new Date(e.event_date).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.82rem', fontWeight:600, color:'var(--gold)' }}>{e.amount_charged ? `Rs. ${e.amount_charged}` : 'Not recorded'}</td>
                          <td style={{ padding:'0.85rem 1rem', fontSize:'0.82rem', color:'var(--muted)' }}>{e.logged_by_name || 'Not recorded'}</td>
                          <td style={{ padding:'0.85rem 1rem' }}><span className={pill(e.status==='completed'?'active':'dormant')}>{e.status}</span></td>
                        </tr>
                      ))}
                      {events.length===0 && <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'0.875rem' }}>No service events yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REMINDERS */}
          {activePanel==='reminders' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div className="sf-section-label" style={{ marginBottom:'0.25rem' }}>Automation</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>Reminder Queue</h2>
                </div>
                <button className="sf-btn-primary" onClick={handleSendAllOverdue}>Send All Overdue</button>
              </div>
              <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom:16, background:'white' }}>
                {[{label:'Overdue',val:reminderSummary.overdue||0,color:'var(--rust)'},{label:'Due Today',val:reminderSummary.today||0,color:'var(--gold)'},{label:'Upcoming',val:reminderSummary.upcoming||0,color:'#4a7c59'},{label:'Sent This Month',val:reminderSummary.sent_this_month||0,color:'var(--muted)'}].map((s,i) => (
                  <div key={i} style={{ flex:1, padding:'1rem', textAlign:'center', borderRight:i<3?'1px solid var(--border)':'none' }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:'0.68rem', fontWeight:500, color:'var(--muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--ink)' }}>All Reminders</span>
                </div>
                {reminders.map(r => (
                  <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--ink)' }}>{r.customer_name}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:2 }}>{r.entity_name ? `${r.entity_name} · ` : ''}{r.reminder_type}</div>
                      <div style={{ marginTop:4 }}><span className={pill(r.channel)}>{r.channel}</span></div>
                    </div>
                    <div style={{ fontSize:'0.75rem', fontWeight:600, textAlign:'right', flexShrink:0, color:r.urgency==='overdue'?'var(--rust)':r.urgency==='today'?'var(--gold)':'#4a7c59' }}>
                      {r.urgency==='overdue' ? `${Math.abs(r.days_until_due)} days overdue` : r.urgency==='today' ? 'Due Today' : `In ${r.days_until_due} days`}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      {r.status==='scheduled' && (
                        <>
                          <button onClick={() => handleSendReminder(r.id,r.customer_name)} style={{ padding:'5px 12px', borderRadius:4, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(74,124,89,0.3)', background:'rgba(74,124,89,0.08)', color:'#4a7c59', fontFamily:'inherit' }}>Send Now</button>
                          <button onClick={() => handleSkipReminder(r.id)} style={{ padding:'5px 12px', borderRadius:4, fontSize:'0.75rem', fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:'transparent', color:'var(--muted)', fontFamily:'inherit' }}>Skip</button>
                        </>
                      )}
                      {r.status==='sent' && <span className="sf-pill sf-pill-active">Sent</span>}
                    </div>
                  </div>
                ))}
                {reminders.length===0 && <div style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'0.875rem' }}>No reminders scheduled yet.</div>}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: ADD CUSTOMER */}
      {showAddCustomer && (
        <div style={overlay} onClick={() => { setShowAddCustomer(false); resetAddForm(); }}>
          <div style={mbox} onClick={e => e.stopPropagation()}>
            <div style={mhead}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Add New Customer</h3>
              <button style={closeBtn} onClick={() => { setShowAddCustomer(false); resetAddForm(); }}>x</button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <CustomerFormFields
                customer={newCustomer} setCustomer={setNewCustomer}
                entity={newEntity}     setEntity={setNewEntity}
                channels={custChannels} setChannels={setCustChannels}
              />
              <div style={{ display:'flex', gap:8, marginTop:'0.5rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'0.8rem' }} onClick={() => { setShowAddCustomer(false); resetAddForm(); }}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'0.8rem' }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER — identical fields to Add Customer */}
      {showEditCustomer && editingCustomer && (
        <div style={overlay} onClick={() => setShowEditCustomer(false)}>
          <div style={mbox} onClick={e => e.stopPropagation()}>
            <div style={mhead}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Edit Customer</h3>
              <button style={closeBtn} onClick={() => setShowEditCustomer(false)}>x</button>
            </div>
            <form onSubmit={handleEditCustomer} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <CustomerFormFields
                customer={editCustomer} setCustomer={setEditCustomer}
                entity={editEntity}     setEntity={setEditEntity}
                channels={editChannels} setChannels={setEditChannels}
              />
              <div style={{ display:'flex', gap:8, marginTop:'0.5rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'0.8rem' }} onClick={() => setShowEditCustomer(false)}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'0.8rem' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRM */}
      {showDeleteConfirm && deletingCustomer && (
        <div style={overlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ ...mbox, maxWidth:400 }} onClick={e => e.stopPropagation()}>
            <div style={mhead}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Remove Customer</h3>
              <button style={closeBtn} onClick={() => setShowDeleteConfirm(false)}>x</button>
            </div>
            <div style={{ padding:'1.5rem' }}>
              <p style={{ fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.7, marginBottom:'0.75rem' }}>
                Are you sure you want to remove <strong style={{ color:'var(--ink)' }}>{deletingCustomer.name}</strong> from your customer list?
              </p>
              <p style={{ fontSize:'0.8rem', color:'var(--muted)', lineHeight:1.6, background:'rgba(196,83,42,0.06)', border:'1px solid rgba(196,83,42,0.15)', borderRadius:6, padding:'0.75rem 1rem' }}>
                Their service history and reminders will be preserved. This action marks them as removed and stops future reminders.
              </p>
              <div style={{ display:'flex', gap:8, marginTop:'1.5rem' }}>
                <button className="sf-btn-ghost" style={{ flex:1, padding:'0.8rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button onClick={handleDeleteCustomer} style={{ flex:1, padding:'0.8rem', background:'var(--rust)', color:'white', border:'none', borderRadius:4, fontSize:'0.875rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Yes, Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG SERVICE */}
      {showLogService && (
        <div style={overlay} onClick={() => setShowLogService(false)}>
          <div style={mbox} onClick={e => e.stopPropagation()}>
            <div style={mhead}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Log a Service Event</h3>
              <button style={closeBtn} onClick={() => setShowLogService(false)}>x</button>
            </div>
            <form onSubmit={handleLogService} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={lbl}>Customer *</label>
                <select style={{ ...inp, cursor:'pointer' }} value={serviceForm.customerId} onChange={e=>setServiceForm(f=>({...f,customerId:e.target.value}))} required>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.entity_name?` (${c.entity_name})`:''}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Service Type *</label>
                <select style={{ ...inp, cursor:'pointer' }} value={serviceForm.serviceType} onChange={e=>setServiceForm(f=>({...f,serviceType:e.target.value}))} required>
                  <option value="">Select service...</option>
                  {serviceOpts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={lbl}>Date of Service *</label>
                  <input style={inp} type="date" value={serviceForm.eventDate} onChange={e=>setServiceForm(f=>({...f,eventDate:e.target.value}))}/>
                </div>
                <div>
                  <label style={lbl}>Next Reminder</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={serviceForm.followUpDays} onChange={e=>setServiceForm(f=>({...f,followUpDays:e.target.value}))}>
                    {FOLLOW_UP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Amount Charged (Rs.)</label>
                  <input style={inp} type="number" placeholder="e.g. 850" value={serviceForm.amountCharged} onChange={e=>setServiceForm(f=>({...f,amountCharged:e.target.value}))}/>
                </div>
                <div>
                  <label style={lbl}>Payment Method</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={serviceForm.paymentMethod} onChange={e=>setServiceForm(f=>({...f,paymentMethod:e.target.value}))}>
                    <option value="">Select...</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="emi">EMI</option>
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={lbl}>Staff / Doctor Name</label>
                  <input style={inp} placeholder="e.g. Dr. Priya Sharma" value={serviceForm.staffName} onChange={e=>setServiceForm(f=>({...f,staffName:e.target.value}))}/>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={lbl}>Notes / Observations</label>
                  <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder="Vaccine batch no., prescription, observations..." value={serviceForm.notes} onChange={e=>setServiceForm(f=>({...f,notes:e.target.value}))}/>
                </div>
              </div>
              {serviceForm.followUpDays && (
                <div style={{ background:'rgba(200,168,75,0.08)', border:'1px solid rgba(200,168,75,0.2)', borderRadius:6, padding:'0.85rem 1rem', fontSize:'0.8rem', color:'var(--muted)' }}>
                  Reminder will be scheduled <strong style={{ color:'var(--gold)' }}>{serviceForm.followUpDays} days</strong> from today on{' '}
                  <strong style={{ color:'var(--ink)' }}>{new Date(Date.now()+parseInt(serviceForm.followUpDays)*86400000).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</strong>
                </div>
              )}
              <div style={{ display:'flex', gap:8, marginTop:'0.25rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'0.8rem' }} onClick={() => setShowLogService(false)}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'0.8rem' }}>Log Service and Schedule Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`sf-toast ${toast.type==='error'?'sf-toast-error':''}`}>{toast.msg}</div>}
    </div>
  );
}