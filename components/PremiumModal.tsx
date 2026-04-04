
import React from 'react';
import { X, Check, Sparkles, Zap, Shield, Cpu } from 'lucide-react';

const PremiumModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-slate-900/90 backdrop-blur-xl w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-10 text-white">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-amber-300 fill-current" />
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight">NEXEN <span className="text-amber-300 underline decoration-4 underline-offset-4">PREMIUM</span></h2>
            <p className="text-blue-100 font-medium leading-relaxed">Join 50k+ founders scaling their network and ventures with elite tools.</p>
            
            <div className="mt-10 space-y-4">
              <Feature icon={<Shield className="w-4 h-4" />} text="Verified Founder Badge" />
              <Feature icon={<Cpu className="w-4 h-4" />} text="Unlimited AI Refinement" />
              <Feature icon={<Zap className="w-4 h-4" />} text="Priority Post Visibility" />
              <Feature icon={<Shield className="w-4 h-4" />} text="Investor Access Network" />
            </div>
          </div>
          
          <div className="p-10 flex flex-col justify-center bg-slate-900/50">
             <div className="mb-8">
               <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Monthly Plan</span>
               <div className="flex items-baseline gap-1 mt-1">
                 <span className="text-4xl font-black text-white">$19</span>
                 <span className="text-slate-400 font-bold">/month</span>
               </div>
               <p className="text-xs text-green-400 font-bold mt-2">Try 7 days for free • Cancel anytime</p>
             </div>
             
             <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 mb-4">
               Upgrade Now
             </button>
             <p className="text-[10px] text-slate-500 text-center font-medium px-4 leading-relaxed">
               By upgrading, you agree to Nexen's Terms & Privacy Policy. Subscriptions renew automatically.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="text-amber-300">{icon}</div>
    <span className="text-sm font-bold opacity-90">{text}</span>
  </div>
);

export default PremiumModal;
