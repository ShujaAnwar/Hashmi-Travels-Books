
import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { supabase } from '../lib/supabase';
import { 
  Settings, 
  Globe, 
  Image as ImageIcon, 
  CreditCard, 
  Lock, 
  Mail, 
  MapPin, 
  Phone, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Cloud,
  Hash,
  Landmark,
  ShieldCheck,
  User,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldAlert,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface CPanelProps {
  isCompact: boolean;
}

const CPanel: React.FC<CPanelProps> = ({ isCompact }) => {
  const [settings, setSettings] = useState(db.getSettings());
  const [activeSection, setActiveSection] = useState<'branding' | 'office' | 'financial' | 'security'>('branding');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Auth state for Security section
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user?.email) setNewEmail(user.email);
    });
  }, []);

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateSetting('logoBase64', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = () => {
    if (window.confirm("Remove custom logo and return to system default icon?")) {
      handleUpdateSetting('logoBase64', undefined);
    }
  };

  const saveAllSettings = () => {
    setSaveStatus('saving');
    try {
      db.updateSettings(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const handleUpdateAuth = async (type: 'email' | 'password') => {
    if (type === 'password' && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setSaveStatus('saving');
    try {
      const { error } = await supabase.auth.updateUser(
        type === 'email' ? { email: newEmail } : { password: newPassword }
      );
      if (error) throw error;
      setSaveStatus('success');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      alert(e.message);
      setSaveStatus('error');
    }
  };

  const sectionClass = `w-full text-left flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${isCompact ? 'py-3' : 'py-4'}`;
  const inputGroup = "space-y-2";
  const labelClass = "block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1";
  const inputClass = "w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none";

  return (
    <div className={`max-w-[1200px] mx-auto ${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      
      {/* Master Save Header */}
      <div className="bg-slate-900 dark:bg-emerald-900/20 text-white rounded-[2.5rem] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl border border-white/5 no-print sticky top-20 z-40 backdrop-blur-md">
         <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
               <Settings size={24} className="text-emerald-400" />
            </div>
            <div>
               <h2 className="text-lg font-black uppercase tracking-tight">System Control Panel</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Settings & Security Architecture</p>
            </div>
         </div>
         <button 
           onClick={saveAllSettings}
           disabled={saveStatus === 'saving'}
           className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all flex items-center gap-2 hover:scale-[1.05] active:scale-95 disabled:opacity-50"
         >
           {/* Fix: RefreshCw is now imported from lucide-react */}
           {saveStatus === 'saving' ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
           Save All Changes
         </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 space-y-2 shrink-0 no-print">
          <button 
            onClick={() => setActiveSection('branding')}
            className={`${sectionClass} ${activeSection === 'branding' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <ImageIcon size={18} /> Branding & Logo
          </button>
          <button 
            onClick={() => setActiveSection('office')}
            className={`${sectionClass} ${activeSection === 'office' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <MapPin size={18} /> Office Details
          </button>
          <button 
            onClick={() => setActiveSection('financial')}
            className={`${sectionClass} ${activeSection === 'financial' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Landmark size={18} /> Financial Config
          </button>
          <button 
            onClick={() => setActiveSection('security')}
            className={`${sectionClass} ${activeSection === 'security' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <ShieldAlert size={18} /> Login & Password
          </button>

          {saveStatus === 'success' && (
            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-widest animate-in fade-in zoom-in">
              <CheckCircle2 size={16} /> Changes Applied
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 lg:p-12 overflow-hidden min-h-[600px]">
          
          {activeSection === 'branding' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Global Identity</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Logo, Name, and Slogan Settings</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={inputGroup}>
                    <label className={labelClass}>Application Display Name</label>
                    <input className={inputClass} value={settings.appName} onChange={e => handleUpdateSetting('appName', e.target.value)} placeholder="TravelLedger Pro" />
                  </div>
                  <div className={inputGroup}>
                    <label className={labelClass}>Invoice Legal Title</label>
                    <input className={inputClass} value={settings.corporateName} onChange={e => handleUpdateSetting('corporateName', e.target.value)} placeholder="NEEM TREE TRAVEL SERVICES" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Tagline / Sub-heading</label>
                    <input className={inputClass} value={settings.tagline} onChange={e => handleUpdateSetting('tagline', e.target.value)} placeholder="Agency Accounting Core" />
                  </div>

                  <div className="md:col-span-2 shadow-inner bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <label className={labelClass}>Corporate Logo Mark</label>
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-8">
                       <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                          {settings.logoBase64 ? (
                            <img src={settings.logoBase64} className="max-w-full max-h-full object-contain p-2" alt="Preview" />
                          ) : (
                            <ImageIcon size={40} className="text-slate-300" />
                          )}
                       </div>
                       <div className="space-y-4 text-center sm:text-left flex-1">
                          <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-md">
                            Upload a high-resolution PNG or JPG. This logo will appear on all vouchers, invoices, and the sidebar. Best resolution: 512x512.
                          </p>
                          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            <label className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-600 transition-all shadow-lg">
                              <ImageIcon size={14} /> Upload New Logo
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                            {settings.logoBase64 && (
                              <button 
                                onClick={resetLogo}
                                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                              >
                                <RotateCcw size={14} /> Reset Default
                              </button>
                            )}
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'office' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Office & Communication</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Public details used on financial documents</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Registered Physical Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input className={inputClass + " pl-12"} value={settings.address} onChange={e => handleUpdateSetting('address', e.target.value)} />
                    </div>
                  </div>
                  <div className={inputGroup}>
                    <label className={labelClass}>Primary Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input className={inputClass + " pl-12"} value={settings.phone} onChange={e => handleUpdateSetting('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className={inputGroup}>
                    <label className={labelClass}>Mobile / WhatsApp</label>
                    <input className={inputClass} value={settings.cell} onChange={e => handleUpdateSetting('cell', e.target.value)} />
                  </div>
                  <div className={inputGroup}>
                    <label className={labelClass}>Accounts Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input className={inputClass + " pl-12"} value={settings.email} onChange={e => handleUpdateSetting('email', e.target.value)} />
                    </div>
                  </div>
                  <div className={inputGroup}>
                    <label className={labelClass}>Corporate Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input className={inputClass + " pl-12"} value={settings.website} onChange={e => handleUpdateSetting('website', e.target.value)} />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'financial' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Financial Configuration</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Engine defaults and bank records</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-600 rounded-xl text-white"><Landmark size={20} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-400">Default Bank for Vouchers</span>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className={inputGroup}>
                          <label className={labelClass}>Bank Name</label>
                          <input className={inputClass + " dark:bg-slate-900"} value={settings.bankName} onChange={e => handleUpdateSetting('bankName', e.target.value)} />
                        </div>
                        <div className={inputGroup}>
                          <label className={labelClass}>Account Title</label>
                          <input className={inputClass + " dark:bg-slate-900"} value={settings.bankAccountTitle} onChange={e => handleUpdateSetting('bankAccountTitle', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>IBAN / Account Number</label>
                          <input className={inputClass + " dark:bg-slate-900 font-black text-blue-600 tracking-wider"} value={settings.bankIBAN} onChange={e => handleUpdateSetting('bankIBAN', e.target.value)} />
                        </div>
                     </div>
                  </div>

                  <div className={inputGroup}>
                    <label className={labelClass}>Standard ROE (SAR/PKR)</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="number" step="0.01" className={inputClass + " pl-12 text-emerald-600 font-black"} value={settings.defaultROE} onChange={e => handleUpdateSetting('defaultROE', Number(e.target.value))} />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Login & Password</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Manage Admin IDs and Security Keys</p>
               </div>

               <div className="space-y-8">
                  {/* Password Update Card */}
                  <div className="bg-slate-950 p-8 sm:p-12 rounded-[3rem] text-white space-y-10 relative overflow-hidden group shadow-2xl border border-white/5">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <KeyRound size={200} />
                     </div>
                     
                     <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                           <div className="p-3 bg-white/10 rounded-2xl text-emerald-400">
                              <Lock size={24} />
                           </div>
                           <div>
                              <h4 className="text-lg font-black uppercase tracking-tight">Security Key Rotation</h4>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Change your master password</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className={inputGroup}>
                              <label className={labelClass + " text-slate-500"}>New Password</label>
                              <div className="relative">
                                 <input 
                                   type={showPass ? 'text' : 'password'} 
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                                   value={newPassword}
                                   onChange={e => setNewPassword(e.target.value)}
                                   placeholder="Minimum 6 characters"
                                 />
                                 <button 
                                   onClick={() => setShowPass(!showPass)}
                                   className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                 >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                              </div>
                           </div>

                           <div className={inputGroup}>
                              <label className={labelClass + " text-slate-500"}>Confirm Password</label>
                              <div className="relative">
                                 <input 
                                   type={showPass ? 'text' : 'password'} 
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                                   value={confirmPassword}
                                   onChange={e => setConfirmPassword(e.target.value)}
                                   placeholder="Must match exactly"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                           <div className="text-center sm:text-left">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Operator</p>
                              <p className="text-sm font-bold text-emerald-400 mt-1">{currentUser?.email}</p>
                           </div>
                           <button 
                              onClick={() => handleUpdateAuth('password')}
                              disabled={!newPassword || newPassword.length < 6 || newPassword !== confirmPassword || saveStatus === 'saving'}
                              className="w-full sm:w-auto bg-white hover:bg-emerald-400 text-slate-900 px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                           >
                              <ShieldCheck size={18} /> Save Password
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Email Update Card */}
                  <div className="bg-white dark:bg-slate-800/50 p-8 sm:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                           <Mail size={24} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Admin Identity (Email)</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update your login email address</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className={inputGroup}>
                           <label className={labelClass}>Registered System Email</label>
                           <input 
                             type="email" 
                             className={inputClass + " py-4"} 
                             value={newEmail} 
                             onChange={e => setNewEmail(e.target.value)}
                             placeholder="name@agency.com"
                           />
                        </div>
                        <button 
                           onClick={() => handleUpdateAuth('email')}
                           disabled={newEmail === currentUser?.email || !newEmail || saveStatus === 'saving'}
                           className="bg-slate-900 dark:bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-30"
                        >
                           Save New Email
                        </button>
                     </div>
                     <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold italic leading-relaxed uppercase tracking-tight">
                           IMPORTANT: Changing the system email requires immediate verification of the new address. Access will be restricted until the link in your new inbox is clicked.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CPanel;
