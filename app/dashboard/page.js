'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getStaff, clearAuth, isLoggedIn } from '../../lib/api';
import { getConfig, getServiceTypes, getVerticalLabel } from '../../lib/industry-config';
import DynamicField, { applyFieldChange } from '../components/DynamicField';

// ─── Blank state factories ─────────────────────────────────────────
// Built dynamically from the config so they always match the field list.
function buildBlankAsset(config) {
  const blank = {};
  config.assetFields.forEach(f => { blank[f.key] = ''; });
  return blank;
}

function buildBlankRetention(config) {
  const blank = {};
  config.retentionFields.forEach(f => { blank[f.key] = ''; });
  return blank;
}

// ─── Shared style constants (module level - prevents re-mount bug) ──
const INP = {
  width:'100%', background:'white', border:'1px solid var(--border)',
  borderRadius:4, padding:'.75rem 1rem', fontFamily:"'DM Sans',sans-serif",
  fontSize:'.875rem', color:'var(--ink)', outline:'none',
};
const LBL = {
  display:'block', fontSize:'.68rem', fontWeight:500,
  letterSpacing:'.1em', textTransform:'uppercase',
  color:'var(--muted)', marginBottom:'.4rem',
};
const SECTION_HDR = {
  fontSize:'.68rem', fontWeight:600, letterSpacing:'.12em',
  textTransform:'uppercase', color:'var(--gold)',
  margin:'1.25rem 0 .75rem', paddingTop:'1rem',
  borderTop:'1px solid var(--border)',
  display:'flex', alignItems:'center', gap:'.5rem',
};
const OVERLAY  = { position:'fixed', inset:0, background:'rgba(13,13,13,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', padding:'1rem' };
const MBOX     = { background:'white', border:'1px solid var(--border)', borderRadius:10, width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(13,13,13,.15)' };
const MHEAD    = { padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'white', zIndex:1 };
const CLOSEBTN = { background:'var(--warm)', border:'1px solid var(--border)', borderRadius:4, color:'var(--muted)', width:28, height:28, cursor:'pointer', fontSize:'.9rem', display:'flex', alignItems:'center', justifyContent:'center' };

// ─── CustomerFormFields - MUST be outside DashboardPage ───────────
// Defining inside causes React to unmount/remount on every keystroke.
function CustomerFormFields({
  customer, setCustomer,
  channels, setChannels,
  asset, setAsset,
  retention, setRetention,
  config,
}) {
  function toggleCh(ch) {
    setChannels(prev => prev.includes(ch) ? prev.filter(c=>c!==ch) : [...prev, ch]);
  }

  // Changing a field clears any field(s) that cascade from it (directly
  // or transitively) — e.g. picking a new Vehicle Type clears Make,
  // which in turn clears Model — so a stale, no-longer-valid selection
  // never lingers.
  function updateAsset(key, val) {
    setAsset(a => applyFieldChange(config.assetFields, a, key, val));
  }
  function updateRetention(key, val) { setRetention(r => ({ ...r, [key]: val })); }

  return (
    <>
      {/* ── Core customer info (same for all verticals) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={LBL}>Full Name *</label>
          <input style={INP} placeholder="e.g. Rahul Sharma" required
            value={customer.name} onChange={e => setCustomer(c=>({...c,name:e.target.value}))}/>
        </div>
        <div>
          <label style={LBL}>Mobile (10 digits) *</label>
          <div style={{ display:'flex' }}>
            <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'.75rem .8rem', fontSize:'.82rem', fontWeight:600, color:'var(--gold)', whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>+91</div>
            <input style={{ ...INP, borderRadius:'0 4px 4px 0' }} placeholder="98765 43210" maxLength={10}
              value={customer.phone} onChange={e => setCustomer(c=>({...c,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))}/>
          </div>
        </div>
        <div>
          <label style={LBL}>City</label>
          <input style={INP} placeholder="e.g. Bengaluru"
            value={customer.city} onChange={e => setCustomer(c=>({...c,city:e.target.value}))}/>
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={LBL}>Email</label>
          <input style={INP} type="email" placeholder="rahul@example.com"
            value={customer.email} onChange={e => setCustomer(c=>({...c,email:e.target.value}))}/>
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={LBL}>Address / Area</label>
          <input style={INP} placeholder="e.g. 12 MG Road, Indiranagar, Bengaluru 560038"
            value={customer.address||''} onChange={e => setCustomer(c=>({...c,address:e.target.value}))}/>
        </div>
      </div>

      {/* ── Messaging channels ── */}
      <div>
        <div style={SECTION_HDR}>Messaging Channels <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
        <label style={{ ...LBL, marginBottom:'.6rem' }}>Select all that apply *</label>
        <div style={{ display:'flex', gap:'.6rem' }}>
          {[{id:'whatsapp',label:'WhatsApp'},{id:'sms',label:'SMS'},{id:'email',label:'Email'}].map(ch => (
            <div key={ch.id} onClick={() => toggleCh(ch.id)} style={{ flex:1, padding:'.75rem', borderRadius:6, cursor:'pointer', textAlign:'center', border:`1.5px solid ${channels.includes(ch.id)?'var(--gold)':'var(--border)'}`, background:channels.includes(ch.id)?'rgba(200,168,75,.08)':'var(--warm)', transition:'all .2s', userSelect:'none' }}>
              <div style={{ fontSize:'.8rem', fontWeight:600, color:channels.includes(ch.id)?'var(--gold)':'var(--ink)' }}>{ch.label}</div>
              {channels.includes(ch.id) && <div style={{ fontSize:'.65rem', color:'var(--gold)', marginTop:2 }}>Selected</div>}
            </div>
          ))}
        </div>
        {channels.length > 0 && (
          <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:'.4rem' }}>
            Primary: <strong style={{ color:'var(--gold)' }}>{channels[0]}</strong>
            {channels.length > 1 && ` + ${channels.slice(1).join(', ')}`}
          </div>
        )}
      </div>

      {/* ── Industry-specific asset fields ── */}
      <div>
        <div style={SECTION_HDR}>{config.assetLabel} <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
        <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'.75rem', fontWeight:300 }}>
          Optional - add details about the {config.assetName?.toLowerCase()} you will be servicing.
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {config.assetFields.map((f, i) => (
            <div key={f.key} style={{ gridColumn: i === 0 || f.key === 'medicalNotes' || f.key === 'propertyAddress' || f.key === 'preferences' || f.key === 'notes' || f.key === 'specialInstructions' || f.key === 'allergies' || f.key === 'ongoingTreatments' || f.key === 'pestHistory' || f.key === 'problemAreas' ? '1/-1' : 'auto' }}>
              <label style={LBL}>{f.label}{f.required ? ' *' : ''}</label>
              <DynamicField field={f} value={asset[f.key]} onChange={updateAsset} allValues={asset}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── Retention trigger fields ── */}
      {config.retentionFields.length > 0 && (
        <div>
          <div style={SECTION_HDR}>Retention and Reminder Dates <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
          <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'.75rem', fontWeight:300 }}>
            Set upcoming due dates so reminders are scheduled automatically.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {config.retentionFields.map(f => (
              <div key={f.key}>
                <label style={LBL}>{f.label}</label>
                <DynamicField field={f} value={retention[f.key]} onChange={updateRetention}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function DashboardPage() {
  const router     = useRouter();
  const profileRef = useRef(null);

  const [activePanel, setActivePanel] = useState('overview');
  const [staff, setStaff]             = useState(null);
  const [vertical, setVertical]       = useState('');
  const [config, setConfig]           = useState(getConfig(''));

  const [dashboard, setDashboard]             = useState(null);
  const [customers, setCustomers]             = useState([]);
  const [reminders, setReminders]             = useState([]);
  const [reminderSummary, setReminderSummary] = useState({});
  const [events, setEvents]                   = useState([]);
  const [campaigns, setCampaigns]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState('');
  const [toast, setToast]                     = useState(null);
  const [showProfile, setShowProfile]         = useState(false);

  // Add Customer
  const [showAdd, setShowAdd]       = useState(false);
  const [addSaving, setAddSaving]   = useState(false);
  const [addChannels, setAddChannels] = useState(['whatsapp']);
  const [addCustomer, setAddCustomer] = useState({ name:'', phone:'', email:'', city:'', address:'' });
  const [addAsset, setAddAsset]       = useState({});
  const [addRetention, setAddRetention] = useState({});

  // Edit Customer
  const [showEdit, setShowEdit]         = useState(false);
  const [editSaving, setEditSaving]     = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [editChannels, setEditChannels] = useState(['whatsapp']);
  const [editCustomer, setEditCustomer] = useState({ name:'', phone:'', email:'', city:'', address:'' });
  const [editAsset, setEditAsset]       = useState({});
  const [editRetention, setEditRetention] = useState({});

  // Delete
  const [showDelete, setShowDelete]       = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Customer Profile (view)
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [profileLoading, setProfileLoading]           = useState(false);
  const [viewingCustomer, setViewingCustomer]         = useState(null);

  // Quick check-in form (shareable link + counter mode)
  const [showCheckin, setShowCheckin]   = useState(false);
  const [checkinToken, setCheckinToken] = useState(null);
  const [checkinPhone, setCheckinPhone] = useState('');
  const [checkinBusy, setCheckinBusy]   = useState(false);

  // Send All (bulk campaign)
  const [showCampaign, setShowCampaign]     = useState(false);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [campaignForm, setCampaignForm] = useState({
    label:'', messageBody:'', channels:['whatsapp'],
    when:'now', scheduledDate: todayStr, scheduledTime:'10:00',
  });

  // Log Service
  const [showLog, setShowLog]     = useState(false);
  const [logSaving, setLogSaving] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    customerId:'', serviceType:'', eventDate:new Date().toISOString().split('T')[0],
    staffName:'', amountCharged:'', paymentMethod:'', followUpDays:'', notes:'',
    serviceNotes:{},
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const s = getStaff();
    setStaff(s);
    const v = s?.vertical || '';
    setVertical(v);
    const cfg = getConfig(v);
    setConfig(cfg);
    setAddAsset(buildBlankAsset(cfg));
    setAddRetention(buildBlankRetention(cfg));
    loadData();
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dash, custs, rems, remSum, evs, camps] = await Promise.all([
        api.getDashboard().catch(()=>({})),
        api.getCustomers({ limit:50 }).catch(()=>({ data:[] })),
        api.getReminders({ limit:50 }).catch(()=>({ data:[] })),
        api.getReminderSummary().catch(()=>({ data:{} })),
        api.getServiceEvents({ limit:20 }).catch(()=>({ data:[] })),
        api.getCampaigns().catch(()=>({ data:[] })),
      ]);
      setDashboard(dash.data || {});
      setCustomers(custs.data || []);
      setReminders(rems.data || []);
      setReminderSummary(remSum.data || {});
      setEvents(evs.data || []);
      setCampaigns(camps.data || []);
    } catch { showToast('Something went wrong loading data','error'); }
    finally   { setLoading(false); }
  }

  function showToast(msg, type='success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  function logout() { clearAuth(); router.push('/'); }

  function resetAdd() {
    setAddCustomer({ name:'', phone:'', email:'', city:'', address:'' });
    setAddAsset(buildBlankAsset(config));
    setAddRetention(buildBlankRetention(config));
    setAddChannels(['whatsapp']);
  }

  // ── Add Customer ───────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    if (!addCustomer.name?.trim()) { showToast('Customer name is required','error'); return; }
    if (!addCustomer.phone?.trim()) { showToast('Phone number is required','error'); return; }
    if (!/^[6-9]\d{9}$/.test(addCustomer.phone)) { showToast('Enter a valid 10-digit Indian mobile number','error'); return; }
    if (addChannels.length === 0) { showToast('Select at least one messaging channel','error'); return; }

    setAddSaving(true);
    try {
      // Find the entity name from the first asset field marked as entityName
      const entityName = addAsset.entityName || addAsset.petName || '';
      const payload = {
        name:             addCustomer.name.trim(),
        phone:            addCustomer.phone.trim(),
        email:            addCustomer.email?.trim() || undefined,
        city:             addCustomer.city?.trim()  || undefined,
        address:          addCustomer.address?.trim() || undefined,
        preferredChannel: addChannels[0],
        optedInWhatsapp:  addChannels.includes('whatsapp'),
        optedInSms:       addChannels.includes('sms'),
        optedInEmail:     addChannels.includes('email'),
        source:           'manual',
        entity: Object.values(addAsset).some(v => v) ? {
          name:        entityName || undefined,
          entityType:  vertical,
          assetData:   addAsset,
          retentionData: addRetention,
        } : undefined,
      };
      await api.createCustomer(payload);
      showToast(`${addCustomer.name} added successfully`);
      setShowAdd(false);
      resetAdd();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to add customer - please try again','error');
    } finally { setAddSaving(false); }
  }

  // ── Edit Customer ──────────────────────────────────────────────
  async function openEdit(c) {
    setEditingId(c.id);
    setEditCustomer({ name:c.name||'', phone:c.phone||'', email:c.email||'', city:c.city||'', address:c.address||'' });
    const chs = [];
    if (c.opted_in_whatsapp) chs.push('whatsapp');
    if (c.opted_in_sms)      chs.push('sms');
    if (c.opted_in_email)    chs.push('email');
    setEditChannels(chs.length ? chs : [c.preferred_channel || 'whatsapp']);

    const blankA = buildBlankAsset(config);
    const blankR = buildBlankRetention(config);
    setEditAsset(blankA);
    setEditRetention(blankR);

    // The customer list only returns flattened entity_name/entity_type -
    // fetch the full record to get the stored asset/retention data.
    try {
      const full = await api.getCustomer(c.id);
      const storedEntity = full.data?.entities?.[0] || {};
      setEditAsset({ ...blankA, ...(storedEntity.asset_data || {}) });
      setEditRetention({ ...blankR, ...(storedEntity.retention_data || {}) });
    } catch (err) {
      showToast(err.message || 'Could not load full customer details','error');
    }

    setShowEdit(true);
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editCustomer.name?.trim()) { showToast('Customer name is required','error'); return; }
    if (!/^[6-9]\d{9}$/.test(editCustomer.phone)) { showToast('Enter a valid 10-digit Indian mobile number','error'); return; }
    if (editChannels.length === 0)  { showToast('Select at least one messaging channel','error'); return; }

    setEditSaving(true);
    try {
      const entityName = editAsset.entityName || editAsset.petName || '';
      await api.updateCustomer(editingId, {
        name:             editCustomer.name.trim(),
        phone:            editCustomer.phone.trim(),
        email:            editCustomer.email?.trim()   || undefined,
        city:             editCustomer.city?.trim()    || undefined,
        address:          editCustomer.address?.trim() || undefined,
        preferredChannel: editChannels[0],
        optedInWhatsapp:  editChannels.includes('whatsapp'),
        optedInSms:       editChannels.includes('sms'),
        optedInEmail:     editChannels.includes('email'),
        entity: {
          name:          entityName || undefined,
          entityType:    vertical,
          assetData:     editAsset,
          retentionData: editRetention,
        },
      });
      showToast(`${editCustomer.name} updated successfully`);
      setShowEdit(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update - please try again','error');
    } finally { setEditSaving(false); }
  }

  // ── Customer Profile (view) ───────────────────────────────────
  async function openProfile(c) {
    setShowCustomerProfile(true);
    setProfileLoading(true);
    setViewingCustomer(null);
    try {
      const full = await api.getCustomer(c.id);
      setViewingCustomer(full.data);
    } catch (err) {
      showToast(err.message || 'Could not load customer profile','error');
      setShowCustomerProfile(false);
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  function openDelete(c) { setDeletingCustomer(c); setShowDelete(true); }

  async function handleDelete() {
    try {
      await api.updateCustomer(deletingCustomer.id, { status:'opted_out' });
      showToast(`${deletingCustomer.name} removed`);
      setShowDelete(false);
      setDeletingCustomer(null);
      await loadData();
    } catch (err) { showToast(err.message || 'Failed','error'); }
  }

  // ── Quick check-in form ────────────────────────────────────────
  async function openCheckin() {
    setShowCheckin(true);
    if (checkinToken) return;
    setCheckinBusy(true);
    try { const res = await api.getCheckinLink(); setCheckinToken(res.data.token); }
    catch (err) { showToast(err.message || 'Could not load your check-in link','error'); setShowCheckin(false); }
    finally { setCheckinBusy(false); }
  }

  const checkinLink = checkinToken ? `${window.location.origin}/checkin/${checkinToken}` : '';
  const checkinMessage = `Hi! Please fill in this quick form before your visit to ${staff?.businessName || 'us'}: ${checkinLink}`;
  const checkinPhoneOk = /^[6-9]\d{9}$/.test(checkinPhone);

  async function copyCheckinLink() {
    try { await navigator.clipboard.writeText(checkinLink); showToast('Link copied'); }
    catch { showToast('Could not copy. Select the link and copy it manually.','error'); }
  }

  async function regenerateCheckin() {
    if (!window.confirm('Create a new link? The current link (and any printed QR code or saved bookmark of it) will stop working.')) return;
    setCheckinBusy(true);
    try { const res = await api.regenerateCheckinLink(); setCheckinToken(res.data.token); showToast('New link created'); }
    catch (err) { showToast(err.message || 'Failed','error'); }
    finally { setCheckinBusy(false); }
  }

  // ── Send All (bulk campaign) ──────────────────────────────────
  function resetCampaign() {
    setCampaignForm({ label:'', messageBody:'', channels:['whatsapp'], when:'now', scheduledDate:todayStr, scheduledTime:'10:00' });
  }

  function toggleCampaignChannel(ch) {
    setCampaignForm(f => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter(c=>c!==ch) : [...f.channels, ch] }));
  }

  async function handleSendCampaign(e) {
    e.preventDefault();
    if (!campaignForm.label.trim())       { showToast('Give this campaign a name, e.g. "Diwali Greetings"','error'); return; }
    if (!campaignForm.messageBody.trim()) { showToast('Write the message to send','error'); return; }
    if (campaignForm.channels.length === 0) { showToast('Select at least one channel','error'); return; }

    const scheduledAt = campaignForm.when === 'now'
      ? new Date().toISOString()
      : new Date(`${campaignForm.scheduledDate}T${campaignForm.scheduledTime}`).toISOString();

    if (campaignForm.when === 'later' && new Date(scheduledAt) <= new Date()) {
      showToast('Pick a date and time in the future','error'); return;
    }

    setCampaignSaving(true);
    try {
      const res = await api.createCampaign({
        label:       campaignForm.label.trim(),
        messageBody: campaignForm.messageBody.trim(),
        channels:    campaignForm.channels,
        scheduledAt,
      });
      showToast(res.message || 'Campaign saved');
      setShowCampaign(false);
      resetCampaign();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to send campaign','error');
    } finally { setCampaignSaving(false); }
  }

  async function handleCancelCampaign(id) {
    try { await api.cancelCampaign(id); showToast('Campaign cancelled'); await loadData(); }
    catch (err) { showToast(err.message || 'Failed','error'); }
  }

  // ── Log Service ────────────────────────────────────────────────
  async function handleLog(e) {
    e.preventDefault();
    if (!serviceForm.customerId) { showToast('Please select a customer','error'); return; }
    if (!serviceForm.serviceType) { showToast('Please select a service type','error'); return; }

    setLogSaving(true);
    try {
      await api.createServiceEvent({
        customerId:    serviceForm.customerId,
        serviceType:   serviceForm.serviceType,
        eventDate:     serviceForm.eventDate,
        staffName:     serviceForm.staffName      || undefined,
        amountCharged: serviceForm.amountCharged  ? parseFloat(serviceForm.amountCharged) : undefined,
        paymentMethod: serviceForm.paymentMethod  || undefined,
        followUpDays:  serviceForm.followUpDays   ? parseInt(serviceForm.followUpDays)    : undefined,
        notes:         serviceForm.notes          || undefined,
        serviceData:   serviceForm.serviceNotes,
        status:        'completed',
      });
      showToast('Service logged and reminder scheduled');
      setShowLog(false);
      setServiceForm({ customerId:'', serviceType:'', eventDate:new Date().toISOString().split('T')[0], staffName:'', amountCharged:'', paymentMethod:'', followUpDays:'', notes:'', serviceNotes:{} });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to log service','error');
    } finally { setLogSaving(false); }
  }

  async function handleSendReminder(id, name) {
    try { await api.sendReminder(id); showToast(`Reminder sent to ${name}`); loadData(); }
    catch (err) { showToast(err.message || 'Failed','error'); }
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
  const serviceOpts = getServiceTypes(vertical);

  const kpis = [
    { label:'Total Customers',    value:ret.total_customers    ||0, color:'var(--gold)' },
    { label:'Active (90 days)',   value:ret.active_customers   ||0, color:'#4a7c59' },
    { label:'Reminders Sent',     value:reminderSummary.sent_this_month||0, color:'var(--muted)' },
    { label:'Overdue Follow-ups', value:queue.overdue          ||0, color:'var(--rust)' },
  ];

  function pill(type) {
    const m = { active:'sf-pill sf-pill-active', completed:'sf-pill sf-pill-active', dormant:'sf-pill sf-pill-dormant', overdue:'sf-pill sf-pill-overdue', whatsapp:'sf-pill sf-pill-whatsapp', sms:'sf-pill sf-pill-sms', email:'sf-pill sf-pill-email' };
    return m[type] || 'sf-pill sf-pill-dormant';
  }

  const navItems = [
    { id:'overview',   label:'Overview' },
    { id:'customers',  label:'Customers' },
    { id:'servicelog', label:'Service Log' },
    { id:'reminders',  label:'Reminder Queue' },
  ];

  const FOLLOW_UP_OPTIONS = [
    { label:'7 days',             value:'7'   },
    { label:'14 days',            value:'14'  },
    { label:'21 days',            value:'21'  },
    { label:'30 days (monthly)',  value:'30'  },
    { label:'45 days',            value:'45'  },
    { label:'60 days',            value:'60'  },
    { label:'90 days (quarterly)',value:'90'  },
    { label:'180 days (6 months)',value:'180' },
    { label:'365 days (annual)',  value:'365' },
  ];

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)', marginBottom:'.5rem' }}>Shih<span style={{ color:'var(--gold)' }}>-Fu</span></div>
        <div style={{ fontSize:'.82rem', color:'var(--muted)', letterSpacing:'.08em' }}>Loading your dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', height:'100vh', background:'var(--cream)', overflow:'hidden' }}>

      {/* SIDEBAR */}
      <aside style={{ background:'white', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'1.5rem 1.5rem 1rem', borderBottom:'1px solid var(--border)' }}>
          {/* Logo - plain text, not a link */}
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', userSelect:'none' }}>
            Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
          </div>
          <div style={{ marginTop:'.9rem', padding:'.75rem 1rem', background:'var(--warm)', borderRadius:6, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--ink)' }}>{staff?.businessName || 'Your Business'}</div>
            <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{getVerticalLabel(vertical) || staff?.plan || 'Growth Plan'}</div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'1rem .75rem', overflowY:'auto' }}>
          <div style={{ fontSize:'.65rem', fontWeight:500, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted)', padding:'0 .75rem', marginBottom:'.5rem' }}>Main</div>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setActivePanel(n.id)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.65rem .75rem', borderRadius:6, cursor:'pointer', marginBottom:2, background:activePanel===n.id?'rgba(200,168,75,.1)':'transparent', color:activePanel===n.id?'var(--gold)':'var(--muted)', fontWeight:activePanel===n.id?600:400, border:activePanel===n.id?'1px solid rgba(200,168,75,.2)':'1px solid transparent', fontSize:'.875rem', transition:'all .15s' }}>
              {n.label}
              {n.id==='reminders' && queue.overdue > 0 && <span style={{ background:'var(--rust)', color:'white', fontSize:'.62rem', fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{queue.overdue}</span>}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ height:60, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', background:'white', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>Dashboard / {activePanel}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontStyle:'italic', color:'var(--ink)' }}>{staff ? `Good day, ${staff.name?.split(' ')[0]}` : 'Dashboard'}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="sf-btn-ghost" style={{ padding:'.5rem 1rem', fontSize:'.8rem' }} onClick={openCheckin}>Check-in Form</button>
            <button className="sf-btn-ghost" style={{ padding:'.5rem 1rem', fontSize:'.8rem' }} onClick={() => setShowAdd(true)}>+ Add Customer</button>
            <button className="sf-btn-primary" style={{ padding:'.5rem 1rem', fontSize:'.8rem' }} onClick={() => setShowLog(true)}>+ Log Service</button>

            {/* Profile dropdown */}
            <div ref={profileRef} style={{ position:'relative' }}>
              <div onClick={() => setShowProfile(p=>!p)} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(200,168,75,.15)', border:'1.5px solid rgba(200,168,75,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.85rem', fontWeight:700, color:'var(--gold)', cursor:'pointer', userSelect:'none' }}>
                {staff?.name?.charAt(0) || 'U'}
              </div>
              {showProfile && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'white', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 8px 32px rgba(13,13,13,.12)', minWidth:230, zIndex:200, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                    <div style={{ fontSize:'.875rem', fontWeight:600, color:'var(--ink)' }}>{staff?.name || 'User'}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--muted)', marginTop:2 }}>{staff?.email || ''}</div>
                    <div style={{ marginTop:6 }}><span className="sf-pill sf-pill-active" style={{ fontSize:'.65rem' }}>{staff?.role || 'owner'}</span></div>
                  </div>
                  <div style={{ padding:'.75rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'.3rem' }}>Business</div>
                    <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--ink)' }}>{staff?.businessName || 'Your Business'}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--muted)', marginTop:2 }}>{getVerticalLabel(vertical) || 'Service Business'}</div>
                  </div>
                  <div style={{ padding:'.75rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'.3rem' }}>Current Plan</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'.82rem', fontWeight:600, color:'var(--gold)', textTransform:'capitalize' }}>{staff?.plan || 'Growth'}</span>
                      <span style={{ fontSize:'.72rem', color:'var(--muted)' }}>{staff?.planStatus || 'Active'}</span>
                    </div>
                  </div>
                  <div style={{ padding:'.5rem' }}>
                    {[{label:'Account Settings',href:'/dashboard/settings'},{label:'Help and Support',href:'/dashboard/help'}].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setShowProfile(false)} style={{ display:'block', padding:'.6rem .75rem', borderRadius:6, fontSize:'.82rem', color:'var(--muted)', textDecoration:'none' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--warm)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        {item.label}
                      </Link>
                    ))}
                    <div onClick={() => { setShowProfile(false); logout(); }} style={{ padding:'.6rem .75rem', borderRadius:6, cursor:'pointer', fontSize:'.82rem', color:'var(--rust)', fontWeight:500 }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(196,83,42,.06)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
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
          {activePanel === 'overview' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
                {kpis.map((k,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'1.25rem', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:k.color }}/>
                    <div style={{ fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{k.label}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:k.color, lineHeight:1 }}>{k.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)' }}>Reminder Queue - This Week</span>
                  <button className="sf-btn-primary" style={{ padding:'.4rem 1rem', fontSize:'.75rem' }} onClick={() => setActivePanel('reminders')}>View All</button>
                </div>
                <div style={{ display:'flex' }}>
                  {[{label:'Overdue',val:queue.overdue||0,color:'var(--rust)'},{label:'Due Today',val:queue.today||0,color:'var(--gold)'},{label:'Upcoming',val:queue.upcoming||0,color:'#4a7c59'}].map((q,i) => (
                    <div key={i} style={{ flex:1, textAlign:'center', padding:'1.25rem 1rem', borderRight:i<2?'1px solid var(--border)':'none' }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:q.color, lineHeight:1 }}>{q.val}</div>
                      <div style={{ fontSize:'.72rem', fontWeight:500, color:'var(--muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'.08em' }}>{q.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)' }}>Recent Customers</span>
                  <button className="sf-btn-ghost" style={{ padding:'.4rem 1rem', fontSize:'.75rem' }} onClick={() => setActivePanel('customers')}>View All</button>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                    {['Customer','Phone','Status','Channel','Last Visit'].map(h => <th key={h} style={{ padding:'.75rem 1rem', textAlign:'left', fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {customers.slice(0,5).map(c => (
                      <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.875rem', fontWeight:600 }}>
                          <span onClick={() => openProfile(c)} style={{ color:'var(--gold)', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(200,168,75,.35)', textUnderlineOffset:3 }}>{c.name}</span>
                            {c.tags?.includes('checkin') && <span title="Added through the quick check-in form. Open Edit to add the remaining details." style={{ marginLeft:8, fontSize:'.6rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'#4a7c59', background:'rgba(74,124,89,.1)', border:'1px solid rgba(74,124,89,.25)', borderRadius:10, padding:'1px 7px' }}>Check-in</span>}
                        </td>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.8rem', color:'var(--muted)' }}>+91 {c.phone}</td>
                        <td style={{ padding:'.85rem 1rem' }}><span className={pill(c.status)}>{c.status}</span></td>
                        <td style={{ padding:'.85rem 1rem' }}><span className={pill(c.preferred_channel)}>{c.preferred_channel}</span></td>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.78rem', color:'var(--muted)' }}>{c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : 'Not yet'}</td>
                      </tr>
                    ))}
                    {customers.length===0 && <tr><td colSpan={5} style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'.875rem' }}>No customers yet. Add your first customer to get started.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {activePanel === 'customers' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div className="sf-section-label" style={{ marginBottom:'.25rem' }}>Customer Management</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>All Customers</h2>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="sf-btn-ghost" onClick={() => setShowCampaign(true)}>Send All</button>
                  <button className="sf-btn-primary" onClick={() => setShowAdd(true)}>+ Add Customer</button>
                </div>
              </div>

              {campaigns.length > 0 && (
                <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
                  <div style={{ padding:'.85rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)' }}>Festival / Promo Campaigns</span>
                    <span style={{ fontSize:'.72rem', color:'var(--muted)' }}>{campaigns.filter(c=>c.status==='scheduled').length} upcoming</span>
                  </div>
                  <div>
                    {campaigns.slice(0,6).map(c => (
                      <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'.85rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)' }}>{c.label}</div>
                          <div style={{ fontSize:'.75rem', color:'var(--muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.message_body}</div>
                          <div style={{ marginTop:4, display:'flex', gap:4 }}>
                            {c.channels?.map(ch => <span key={ch} className={pill(ch)} style={{ fontSize:'.62rem' }}>{ch}</span>)}
                          </div>
                        </div>
                        <div style={{ fontSize:'.75rem', color:'var(--muted)', flexShrink:0, textAlign:'right' }}>
                          {new Date(c.scheduled_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                          <div style={{ marginTop:4 }}>
                            <span className={pill(c.status==='sent'?'active':c.status==='cancelled'||c.status==='failed'?'dormant':'overdue')} style={{ fontSize:'.62rem' }}>{c.status}</span>
                          </div>
                        </div>
                        {c.status === 'scheduled' && (
                          <button onClick={() => handleCancelCampaign(c.id)} style={{ padding:'5px 12px', borderRadius:4, fontSize:'.72rem', fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:'transparent', color:'var(--muted)', fontFamily:'inherit', flexShrink:0 }}>Cancel</button>
                        )}
                        {(c.status==='sent'||c.status==='sending') && (
                          <div style={{ fontSize:'.68rem', color:'var(--muted)', flexShrink:0 }}>{c.sent_count} sent{c.skipped_count?`, ${c.skipped_count} skipped`:''}{c.failed_count?`, ${c.failed_count} failed`:''}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'.85rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
                  <input style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRadius:4, padding:'.5rem .85rem', fontSize:'.82rem', color:'var(--ink)', outline:'none', width:280, fontFamily:"'DM Sans',sans-serif" }}
                    placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}/>
                  <span style={{ marginLeft:'auto', fontSize:'.72rem', fontWeight:500, background:'var(--warm)', color:'var(--muted)', padding:'3px 10px', borderRadius:4, border:'1px solid var(--border)' }}>{filteredCustomers.length} records</span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                      {['Customer','Phone',config.assetName||'Entity','Last Visit','Next Due','Status','Channel','Actions'].map(h => <th key={h} style={{ padding:'.75rem 1rem', textAlign:'left', fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)', whiteSpace:'nowrap' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredCustomers.map(c => (
                        <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'.85rem 1rem', fontSize:'.875rem', fontWeight:600, whiteSpace:'nowrap' }}>
                            <span onClick={() => openProfile(c)} style={{ color:'var(--gold)', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(200,168,75,.35)', textUnderlineOffset:3 }}>{c.name}</span>
                            {c.tags?.includes('checkin') && <span title="Added through the quick check-in form. Open Edit to add the remaining details." style={{ marginLeft:8, fontSize:'.6rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'#4a7c59', background:'rgba(74,124,89,.1)', border:'1px solid rgba(74,124,89,.25)', borderRadius:10, padding:'1px 7px' }}>Check-in</span>}
                          </td>
                          <td style={{ padding:'.85rem 1rem', fontSize:'.78rem', color:'var(--muted)' }}>+91 {c.phone}</td>
                          <td style={{ padding:'.85rem 1rem', fontSize:'.8rem', color:'var(--muted)' }}>{c.entity_name ? `${c.entity_name}${c.breed_or_model?' · '+c.breed_or_model:''}` : 'Not added'}</td>
                          <td style={{ padding:'.85rem 1rem', fontSize:'.75rem', color:'var(--muted)', whiteSpace:'nowrap' }}>{c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : 'Not yet'}</td>
                          <td style={{ padding:'.85rem 1rem', fontSize:'.75rem', whiteSpace:'nowrap', color:c.status==='overdue'?'var(--rust)':'#4a7c59' }}>{c.next_reminder_at ? new Date(c.next_reminder_at).toLocaleDateString('en-IN') : 'Not set'}</td>
                          <td style={{ padding:'.85rem 1rem' }}><span className={pill(c.status)}>{c.status}</span></td>
                          <td style={{ padding:'.85rem 1rem' }}><span className={pill(c.preferred_channel)}>{c.preferred_channel}</span></td>
                          <td style={{ padding:'.85rem 1rem', whiteSpace:'nowrap' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={() => openEdit(c)} style={{ padding:'4px 10px', borderRadius:4, fontSize:'.72rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(200,168,75,.3)', background:'rgba(200,168,75,.08)', color:'var(--gold)', fontFamily:'inherit' }}>Edit</button>
                              <button onClick={() => openDelete(c)} style={{ padding:'4px 10px', borderRadius:4, fontSize:'.72rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(196,83,42,.3)', background:'rgba(196,83,42,.06)', color:'var(--rust)', fontFamily:'inherit' }}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length===0 && <tr><td colSpan={8} style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'.875rem' }}>No customers found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SERVICE LOG */}
          {activePanel === 'servicelog' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div className="sf-section-label" style={{ marginBottom:'.25rem' }}>Service Log</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>Recent Service Events</h2>
                </div>
                <button className="sf-btn-primary" onClick={() => setShowLog(true)}>+ Log New Service</button>
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)' }}>All Events</span>
                  <span style={{ fontSize:'.72rem', color:'var(--muted)' }}>{events.length} records</span>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                    {['Customer','Service','Date','Amount','Staff','Status'].map(h => <th key={h} style={{ padding:'.75rem 1rem', textAlign:'left', fontSize:'.68rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {events.map(e => (
                      <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.875rem', fontWeight:600, color:'var(--ink)' }}>{e.customer_name}</td>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.875rem', color:'var(--muted)' }}>{e.service_type}</td>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.78rem', color:'var(--muted)' }}>{new Date(e.event_date).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.82rem', fontWeight:600, color:'var(--gold)' }}>{e.amount_charged ? `Rs. ${e.amount_charged}` : 'Not recorded'}</td>
                        <td style={{ padding:'.85rem 1rem', fontSize:'.82rem', color:'var(--muted)' }}>{e.logged_by_name || 'Not recorded'}</td>
                        <td style={{ padding:'.85rem 1rem' }}><span className={pill(e.status==='completed'?'active':'dormant')}>{e.status}</span></td>
                      </tr>
                    ))}
                    {events.length===0 && <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'.875rem' }}>No service events yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REMINDERS */}
          {activePanel === 'reminders' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div className="sf-section-label" style={{ marginBottom:'.25rem' }}>Automation</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--ink)' }}>Reminder Queue</h2>
                </div>
                <button className="sf-btn-primary" onClick={handleSendAllOverdue}>Send All Overdue</button>
              </div>
              <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', marginBottom:16, background:'white' }}>
                {[{label:'Overdue',val:reminderSummary.overdue||0,color:'var(--rust)'},{label:'Due Today',val:reminderSummary.today||0,color:'var(--gold)'},{label:'Upcoming',val:reminderSummary.upcoming||0,color:'#4a7c59'},{label:'Sent This Month',val:reminderSummary.sent_this_month||0,color:'var(--muted)'}].map((s,i) => (
                  <div key={i} style={{ flex:1, padding:'1rem', textAlign:'center', borderRight:i<3?'1px solid var(--border)':'none' }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:'.68rem', fontWeight:500, color:'var(--muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)' }}>All Reminders</span>
                </div>
                {reminders.map(r => (
                  <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'.875rem', fontWeight:600, color:'var(--ink)' }}>{r.customer_name}</div>
                      <div style={{ fontSize:'.78rem', color:'var(--muted)', marginTop:2 }}>{r.entity_name ? `${r.entity_name} · ` : ''}{r.reminder_type}</div>
                      <div style={{ marginTop:4 }}><span className={pill(r.channel)}>{r.channel}</span></div>
                    </div>
                    <div style={{ fontSize:'.75rem', fontWeight:600, flexShrink:0, color:r.urgency==='overdue'?'var(--rust)':r.urgency==='today'?'var(--gold)':'#4a7c59' }}>
                      {r.urgency==='overdue'?`${Math.abs(r.days_until_due)} days overdue`:r.urgency==='today'?'Due Today':`In ${r.days_until_due} days`}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      {r.status==='scheduled' && (
                        <>
                          <button onClick={() => handleSendReminder(r.id,r.customer_name)} style={{ padding:'5px 12px', borderRadius:4, fontSize:'.75rem', fontWeight:600, cursor:'pointer', border:'1px solid rgba(74,124,89,.3)', background:'rgba(74,124,89,.08)', color:'#4a7c59', fontFamily:'inherit' }}>Send Now</button>
                          <button onClick={() => handleSkipReminder(r.id)} style={{ padding:'5px 12px', borderRadius:4, fontSize:'.75rem', fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:'transparent', color:'var(--muted)', fontFamily:'inherit' }}>Skip</button>
                        </>
                      )}
                      {r.status==='sent' && <span className="sf-pill sf-pill-active">Sent</span>}
                    </div>
                  </div>
                ))}
                {reminders.length===0 && <div style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'.875rem' }}>No reminders scheduled yet.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD CUSTOMER */}
      {showAdd && (
        <div style={OVERLAY} onClick={() => { setShowAdd(false); resetAdd(); }}>
          <div style={MBOX} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Add New Customer</h3>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{config.label} fields</div>
              </div>
              <button style={CLOSEBTN} onClick={() => { setShowAdd(false); resetAdd(); }}>x</button>
            </div>
            <form onSubmit={handleAdd} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <CustomerFormFields
                customer={addCustomer}   setCustomer={setAddCustomer}
                channels={addChannels}   setChannels={setAddChannels}
                asset={addAsset}         setAsset={setAddAsset}
                retention={addRetention} setRetention={setAddRetention}
                config={config}
              />
              <div style={{ display:'flex', gap:8, marginTop:'.5rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'.8rem' }} onClick={() => { setShowAdd(false); resetAdd(); }}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'.8rem', opacity:addSaving?.7:1 }} disabled={addSaving}>
                  {addSaving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER */}
      {showEdit && editingId && (
        <div style={OVERLAY} onClick={() => setShowEdit(false)}>
          <div style={MBOX} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Edit Customer</h3>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{config.label} fields</div>
              </div>
              <button style={CLOSEBTN} onClick={() => setShowEdit(false)}>x</button>
            </div>
            <form onSubmit={handleEdit} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <CustomerFormFields
                customer={editCustomer}   setCustomer={setEditCustomer}
                channels={editChannels}   setChannels={setEditChannels}
                asset={editAsset}         setAsset={setEditAsset}
                retention={editRetention} setRetention={setEditRetention}
                config={config}
              />
              <div style={{ display:'flex', gap:8, marginTop:'.5rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'.8rem' }} onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'.8rem', opacity:editSaving?.7:1 }} disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER PROFILE (view) */}
      {showCustomerProfile && (
        <div style={OVERLAY} onClick={() => setShowCustomerProfile(false)}>
          <div style={{ ...MBOX, maxWidth:720 }} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>
                  {viewingCustomer?.name || 'Customer Profile'}
                </h3>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>Full profile, service history and reminders</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {viewingCustomer && (
                  <button className="sf-btn-ghost" style={{ padding:'.4rem .9rem', fontSize:'.75rem' }}
                    onClick={() => { setShowCustomerProfile(false); openEdit(viewingCustomer); }}>Edit</button>
                )}
                <button style={CLOSEBTN} onClick={() => setShowCustomerProfile(false)}>x</button>
              </div>
            </div>

            <div style={{ padding:'1.5rem' }}>
              {profileLoading && (
                <div style={{ padding:'3rem', textAlign:'center', color:'var(--muted)', fontSize:'.875rem' }}>Loading profile...</div>
              )}

              {!profileLoading && viewingCustomer && (() => {
                const entity = viewingCustomer.entities?.[0] || null;
                const assetData     = entity?.asset_data || {};
                const retentionData = entity?.retention_data || {};
                return (
                  <>
                    {/* Core info */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem 1.5rem', marginBottom:'1.25rem' }}>
                      <div><span style={LBL}>Phone</span><div style={{ fontSize:'.875rem', color:'var(--ink)' }}>+91 {viewingCustomer.phone}</div></div>
                      <div><span style={LBL}>Email</span><div style={{ fontSize:'.875rem', color:'var(--ink)' }}>{viewingCustomer.email || '-'}</div></div>
                      <div><span style={LBL}>City</span><div style={{ fontSize:'.875rem', color:'var(--ink)' }}>{viewingCustomer.city || '-'}</div></div>
                      <div><span style={LBL}>Address</span><div style={{ fontSize:'.875rem', color:'var(--ink)' }}>{viewingCustomer.address || '-'}</div></div>
                      <div><span style={LBL}>Status</span><div style={{ marginTop:2 }}><span className={pill(viewingCustomer.status)}>{viewingCustomer.status}</span></div></div>
                      <div><span style={LBL}>Preferred Channel</span><div style={{ marginTop:2 }}><span className={pill(viewingCustomer.preferred_channel)}>{viewingCustomer.preferred_channel}</span></div></div>
                    </div>

                    {/* Entity / asset details */}
                    {entity && (
                      <div style={{ marginBottom:'1.25rem' }}>
                        <div style={SECTION_HDR}>{config.assetLabel} <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem 1.5rem' }}>
                          {config.assetFields.filter(f => assetData[f.key]).map(f => (
                            <div key={f.key}>
                              <span style={LBL}>{f.label}</span>
                              <div style={{ fontSize:'.875rem', color:'var(--ink)' }}>{assetData[f.key]}</div>
                            </div>
                          ))}
                          {!config.assetFields.some(f => assetData[f.key]) && (
                            <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>No details added yet.</div>
                          )}
                        </div>

                        {config.retentionFields.some(f => retentionData[f.key]) && (
                          <div style={{ marginTop:'1rem' }}>
                            <div style={{ ...LBL, marginBottom:'.5rem' }}>Retention and Reminder Dates</div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem 1.5rem' }}>
                              {config.retentionFields.filter(f => retentionData[f.key]).map(f => (
                                <div key={f.key}>
                                  <span style={LBL}>{f.label}</span>
                                  <div style={{ fontSize:'.875rem', color:'var(--ink)' }}>{retentionData[f.key]}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Service history */}
                    <div style={{ marginBottom:'1.25rem' }}>
                      <div style={SECTION_HDR}>Service History <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
                      {viewingCustomer.serviceEvents?.length ? (
                        <div style={{ border:'1px solid var(--border)', borderRadius:6, overflow:'hidden' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead><tr style={{ background:'var(--warm)' }}>
                              {['Service','Date','Amount','Status'].map(h => <th key={h} style={{ padding:'.6rem .85rem', textAlign:'left', fontSize:'.65rem', fontWeight:500, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                              {viewingCustomer.serviceEvents.map(se => (
                                <tr key={se.id} style={{ borderTop:'1px solid var(--border)' }}>
                                  <td style={{ padding:'.6rem .85rem', fontSize:'.82rem', color:'var(--ink)' }}>{se.service_type}</td>
                                  <td style={{ padding:'.6rem .85rem', fontSize:'.78rem', color:'var(--muted)' }}>{new Date(se.event_date).toLocaleDateString('en-IN')}</td>
                                  <td style={{ padding:'.6rem .85rem', fontSize:'.78rem', color:'var(--muted)' }}>{se.amount_charged ? `Rs. ${se.amount_charged}` : '-'}</td>
                                  <td style={{ padding:'.6rem .85rem' }}><span className={pill(se.status==='completed'?'active':'dormant')}>{se.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>No service events logged yet.</div>
                      )}
                    </div>

                    {/* Reminders */}
                    <div>
                      <div style={SECTION_HDR}>Upcoming Reminders <div style={{ flex:1, height:1, background:'var(--border)' }}/></div>
                      {viewingCustomer.reminders?.length ? (
                        <div style={{ border:'1px solid var(--border)', borderRadius:6, overflow:'hidden' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead><tr style={{ background:'var(--warm)' }}>
                              {['Reminder','Scheduled','Channel','Status'].map(h => <th key={h} style={{ padding:'.6rem .85rem', textAlign:'left', fontSize:'.65rem', fontWeight:500, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted)' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                              {viewingCustomer.reminders.map(r => (
                                <tr key={r.id} style={{ borderTop:'1px solid var(--border)' }}>
                                  <td style={{ padding:'.6rem .85rem', fontSize:'.82rem', color:'var(--ink)' }}>{r.reminder_type}</td>
                                  <td style={{ padding:'.6rem .85rem', fontSize:'.78rem', color:'var(--muted)' }}>{new Date(r.scheduled_at).toLocaleDateString('en-IN')}</td>
                                  <td style={{ padding:'.6rem .85rem' }}><span className={pill(r.channel)}>{r.channel}</span></td>
                                  <td style={{ padding:'.6rem .85rem' }}><span className={pill(r.status==='scheduled'?'overdue':'active')}>{r.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>No reminders scheduled yet.</div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRM */}
      {showDelete && deletingCustomer && (
        <div style={OVERLAY} onClick={() => setShowDelete(false)}>
          <div style={{ ...MBOX, maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Remove Customer</h3>
              <button style={CLOSEBTN} onClick={() => setShowDelete(false)}>x</button>
            </div>
            <div style={{ padding:'1.5rem' }}>
              <p style={{ fontSize:'.9rem', color:'var(--muted)', lineHeight:1.7, marginBottom:'.75rem' }}>
                Are you sure you want to remove <strong style={{ color:'var(--ink)' }}>{deletingCustomer.name}</strong>?
              </p>
              <p style={{ fontSize:'.8rem', color:'var(--muted)', lineHeight:1.6, background:'rgba(196,83,42,.06)', border:'1px solid rgba(196,83,42,.15)', borderRadius:6, padding:'.75rem 1rem' }}>
                Service history is preserved. Future reminders will be stopped.
              </p>
              <div style={{ display:'flex', gap:8, marginTop:'1.5rem' }}>
                <button className="sf-btn-ghost" style={{ flex:1, padding:'.8rem' }} onClick={() => setShowDelete(false)}>Cancel</button>
                <button onClick={handleDelete} style={{ flex:1, padding:'.8rem', background:'var(--rust)', color:'white', border:'none', borderRadius:4, fontSize:'.875rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Yes, Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHECK-IN FORM LINK */}
      {showCheckin && (
        <div style={OVERLAY} onClick={() => setShowCheckin(false)}>
          <div style={MBOX} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Quick Check-in Form</h3>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>Let new customers enter their own details</div>
              </div>
              <button style={CLOSEBTN} onClick={() => setShowCheckin(false)}>x</button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {!checkinToken ? (
                <div style={{ color:'var(--muted)', fontSize:'.875rem' }}>Loading your link...</div>
              ) : (
                <>
                  <div style={{ fontSize:'.82rem', color:'var(--muted)', lineHeight:1.7 }}>
                    A short form tailored to {getVerticalLabel(vertical) || 'your business'}. Customers enter their name, number and a few details about their {config.assetName?.toLowerCase()}, and agree to be messaged. They show up in your Customers list marked <strong>Check-in</strong>; open Edit any time to add more.
                  </div>

                  <div>
                    <label style={LBL}>Your check-in link</label>
                    <div style={{ display:'flex', gap:8 }}>
                      <input readOnly value={checkinLink} onFocus={e=>e.target.select()} style={{ ...INP, fontSize:'.8rem' }}/>
                      <button className="sf-btn-primary" style={{ padding:'0 1.25rem', whiteSpace:'nowrap' }} onClick={copyCheckinLink}>Copy</button>
                    </div>
                  </div>

                  <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRadius:8, padding:'1rem 1.15rem' }}>
                    <div style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)', marginBottom:'.25rem' }}>At the counter (iPad or display)</div>
                    <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'.75rem', lineHeight:1.6 }}>Opens the form on its own and resets itself after each person, so the next customer starts fresh.</div>
                    <a href={`${checkinLink}?kiosk=1`} target="_blank" rel="noreferrer" className="sf-btn-ghost" style={{ display:'inline-block', padding:'.55rem 1.1rem', fontSize:'.8rem', textDecoration:'none' }}>Open counter mode</a>
                  </div>

                  <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRadius:8, padding:'1rem 1.15rem' }}>
                    <div style={{ fontSize:'.85rem', fontWeight:600, color:'var(--ink)', marginBottom:'.25rem' }}>Send to someone who called</div>
                    <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'.75rem', lineHeight:1.6 }}>Opens WhatsApp or your messages app with the link ready to send from your own number.</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <div style={{ display:'flex', flex:'1 1 200px' }}>
                        <div style={{ background:'white', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'.75rem .8rem', fontSize:'.82rem', fontWeight:600, color:'var(--gold)', display:'flex', alignItems:'center' }}>+91</div>
                        <input style={{ ...INP, borderRadius:'0 4px 4px 0' }} inputMode="numeric" maxLength={10} placeholder="Mobile number" value={checkinPhone} onChange={e=>setCheckinPhone(e.target.value.replace(/\D/g,'').slice(0,10))}/>
                      </div>
                      <a href={`https://wa.me/91${checkinPhone}?text=${encodeURIComponent(checkinMessage)}`} target="_blank" rel="noreferrer" className="sf-btn-primary" style={{ padding:'.75rem 1.1rem', fontSize:'.8rem', textDecoration:'none', opacity:checkinPhoneOk?1:.45, pointerEvents:checkinPhoneOk?'auto':'none' }}>WhatsApp</a>
                      <a href={`sms:+91${checkinPhone}?body=${encodeURIComponent(checkinMessage)}`} className="sf-btn-ghost" style={{ padding:'.75rem 1.1rem', fontSize:'.8rem', textDecoration:'none', opacity:checkinPhoneOk?1:.45, pointerEvents:checkinPhoneOk?'auto':'none' }}>SMS</a>
                    </div>
                  </div>

                  {(staff?.role === 'owner' || staff?.role === 'manager') && (
                    <button type="button" onClick={regenerateCheckin} disabled={checkinBusy} style={{ alignSelf:'flex-start', background:'none', border:'none', padding:0, cursor:'pointer', fontSize:'.75rem', color:'var(--muted)', textDecoration:'underline', fontFamily:'inherit' }}>
                      Link shared by mistake? Create a new one
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEND ALL (bulk campaign) */}
      {showCampaign && (
        <div style={OVERLAY} onClick={() => { setShowCampaign(false); resetCampaign(); }}>
          <div style={MBOX} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Message Your Whole Customer Base</h3>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>Festival greetings, promos, and seasonal offers - send now or schedule ahead</div>
              </div>
              <button style={CLOSEBTN} onClick={() => { setShowCampaign(false); resetCampaign(); }}>x</button>
            </div>
            <form onSubmit={handleSendCampaign} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

              <div>
                <label style={LBL}>Campaign Name *</label>
                <input style={INP} placeholder="e.g. Diwali Greetings 2026" required
                  value={campaignForm.label} onChange={e=>setCampaignForm(f=>({...f,label:e.target.value}))}/>
              </div>

              <div>
                <label style={LBL}>Message *</label>
                <textarea style={{ ...INP, minHeight:100, resize:'vertical' }} maxLength={1000}
                  placeholder="e.g. Wishing you and your family a very Happy Diwali from all of us! As a thank you, enjoy 20% off your next visit this month."
                  value={campaignForm.messageBody} onChange={e=>setCampaignForm(f=>({...f,messageBody:e.target.value}))}/>
                <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:4, textAlign:'right' }}>{campaignForm.messageBody.length}/1000</div>
              </div>

              <div>
                <label style={{ ...LBL, marginBottom:'.6rem' }}>Send Via *</label>
                <div style={{ display:'flex', gap:'.6rem' }}>
                  {[{id:'whatsapp',label:'WhatsApp'},{id:'sms',label:'SMS'},{id:'email',label:'Email'}].map(ch => (
                    <div key={ch.id} onClick={() => toggleCampaignChannel(ch.id)} style={{ flex:1, padding:'.75rem', borderRadius:6, cursor:'pointer', textAlign:'center', border:`1.5px solid ${campaignForm.channels.includes(ch.id)?'var(--gold)':'var(--border)'}`, background:campaignForm.channels.includes(ch.id)?'rgba(200,168,75,.08)':'var(--warm)', transition:'all .2s', userSelect:'none' }}>
                      <div style={{ fontSize:'.8rem', fontWeight:600, color:campaignForm.channels.includes(ch.id)?'var(--gold)':'var(--ink)' }}>{ch.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:'.5rem' }}>
                  Only reaches customers whose preferred channel is selected here and who have opted in - about{' '}
                  <strong style={{ color:'var(--gold)' }}>
                    {customers.filter(c => c.status!=='opted_out' && campaignForm.channels.includes(c.preferred_channel) &&
                      ((c.preferred_channel==='whatsapp'&&c.opted_in_whatsapp)||(c.preferred_channel==='sms'&&c.opted_in_sms)||(c.preferred_channel==='email'&&c.opted_in_email))).length}
                  </strong> of {customers.length} customers.
                </div>
              </div>

              <div>
                <label style={{ ...LBL, marginBottom:'.6rem' }}>When *</label>
                <div style={{ display:'flex', gap:'.6rem', marginBottom:'.75rem' }}>
                  {[{id:'now',label:'Send Now'},{id:'later',label:'Schedule for Later'}].map(w => (
                    <div key={w.id} onClick={() => setCampaignForm(f=>({...f,when:w.id}))} style={{ flex:1, padding:'.75rem', borderRadius:6, cursor:'pointer', textAlign:'center', border:`1.5px solid ${campaignForm.when===w.id?'var(--gold)':'var(--border)'}`, background:campaignForm.when===w.id?'rgba(200,168,75,.08)':'var(--warm)', transition:'all .2s', userSelect:'none' }}>
                      <div style={{ fontSize:'.8rem', fontWeight:600, color:campaignForm.when===w.id?'var(--gold)':'var(--ink)' }}>{w.label}</div>
                    </div>
                  ))}
                </div>
                {campaignForm.when === 'later' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <div>
                      <label style={LBL}>Date</label>
                      <input style={INP} type="date" min={todayStr} value={campaignForm.scheduledDate} onChange={e=>setCampaignForm(f=>({...f,scheduledDate:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={LBL}>Time</label>
                      <input style={INP} type="time" value={campaignForm.scheduledTime} onChange={e=>setCampaignForm(f=>({...f,scheduledTime:e.target.value}))}/>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display:'flex', gap:8, marginTop:'.5rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'.8rem' }} onClick={() => { setShowCampaign(false); resetCampaign(); }}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'.8rem', opacity:campaignSaving?.7:1 }} disabled={campaignSaving}>
                  {campaignSaving ? 'Saving...' : campaignForm.when==='now' ? 'Send Now' : 'Schedule Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG SERVICE */}
      {showLog && (
        <div style={OVERLAY} onClick={() => setShowLog(false)}>
          <div style={MBOX} onClick={e=>e.stopPropagation()}>
            <div style={MHEAD}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)' }}>Log a Service Event</h3>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{config.label} service types</div>
              </div>
              <button style={CLOSEBTN} onClick={() => setShowLog(false)}>x</button>
            </div>
            <form onSubmit={handleLog} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

              <div>
                <label style={LBL}>Customer *</label>
                <select style={{ ...INP, cursor:'pointer' }} value={serviceForm.customerId} onChange={e=>setServiceForm(f=>({...f,customerId:e.target.value}))} required>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.entity_name?` (${c.entity_name})`:''}</option>)}
                </select>
              </div>

              {/* Industry-specific service types */}
              <div>
                <label style={LBL}>Service Type *</label>
                <select style={{ ...INP, cursor:'pointer' }} value={serviceForm.serviceType} onChange={e=>setServiceForm(f=>({...f,serviceType:e.target.value}))} required>
                  <option value="">Select service...</option>
                  {serviceOpts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={LBL}>Date of Service *</label>
                  <input style={INP} type="date" value={serviceForm.eventDate} onChange={e=>setServiceForm(f=>({...f,eventDate:e.target.value}))}/>
                </div>
                <div>
                  <label style={LBL}>Follow-up Reminder</label>
                  <select style={{ ...INP, cursor:'pointer' }} value={serviceForm.followUpDays} onChange={e=>setServiceForm(f=>({...f,followUpDays:e.target.value}))}>
                    <option value="">No reminder</option>
                    {FOLLOW_UP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Amount Charged (Rs.)</label>
                  <input style={INP} type="number" placeholder="e.g. 850" value={serviceForm.amountCharged} onChange={e=>setServiceForm(f=>({...f,amountCharged:e.target.value}))}/>
                </div>
                <div>
                  <label style={LBL}>Payment Method</label>
                  <select style={{ ...INP, cursor:'pointer' }} value={serviceForm.paymentMethod} onChange={e=>setServiceForm(f=>({...f,paymentMethod:e.target.value}))}>
                    <option value="">Select...</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="emi">EMI</option>
                  </select>
                </div>

                {/* Industry-specific service fields */}
                {config.serviceFields?.map(f => (
                  <div key={f.key} style={{ gridColumn: f.type === 'text' && (f.key.includes('notes') || f.key.includes('issues') || f.key.includes('parts') || f.key.includes('feedback') || f.key.includes('property') || f.key.includes('chemicals')) ? '1/-1' : 'auto' }}>
                    <label style={LBL}>{f.label}</label>
                    {f.type === 'select'
                      ? <select style={{ ...INP, cursor:'pointer' }} value={serviceForm.serviceNotes[f.key]||''} onChange={e=>setServiceForm(sf=>({...sf,serviceNotes:{...sf.serviceNotes,[f.key]:e.target.value}}))}>
                          <option value="">Select...</option>
                          {f.options?.map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      : <input style={INP} type={f.type==='date'?'date':'text'} placeholder={f.placeholder||''} value={serviceForm.serviceNotes[f.key]||''} onChange={e=>setServiceForm(sf=>({...sf,serviceNotes:{...sf.serviceNotes,[f.key]:e.target.value}}))}/>
                    }
                  </div>
                ))}

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={LBL}>General Notes</label>
                  <textarea style={{ ...INP, minHeight:72, resize:'vertical' }} placeholder="Any additional notes or observations..." value={serviceForm.notes} onChange={e=>setServiceForm(f=>({...f,notes:e.target.value}))}/>
                </div>
              </div>

              {serviceForm.followUpDays && (
                <div style={{ background:'rgba(200,168,75,.08)', border:'1px solid rgba(200,168,75,.2)', borderRadius:6, padding:'.85rem 1rem', fontSize:'.8rem', color:'var(--muted)' }}>
                  Reminder scheduled for{' '}
                  <strong style={{ color:'var(--ink)' }}>{new Date(Date.now()+parseInt(serviceForm.followUpDays)*86400000).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</strong>
                  {' '}- <strong style={{ color:'var(--gold)' }}>{serviceForm.followUpDays} days</strong> from today
                </div>
              )}

              <div style={{ display:'flex', gap:8, marginTop:'.25rem' }}>
                <button type="button" className="sf-btn-ghost" style={{ flex:1, padding:'.8rem' }} onClick={() => setShowLog(false)}>Cancel</button>
                <button type="submit" className="sf-btn-primary" style={{ flex:1, padding:'.8rem', opacity:logSaving?.7:1 }} disabled={logSaving}>
                  {logSaving ? 'Saving...' : 'Log Service and Schedule Reminder'}
                </button>
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