import React, { useState } from 'react';
import { X, Code, MessageCircle, MessageSquare, Mail, Copy, Check, Download } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, shareUrl, onDownload }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    ...(onDownload ? [{
      name: 'Download',
      icon: <Download size={24} />,
      color: 'bg-violet-500 text-white hover:bg-violet-600',
      action: () => {
        onDownload();
        onClose();
      }
    }] : []),
    {
      name: 'Embed',
      icon: <Code size={24} />,
      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      action: () => handleCopy() // For now just copy link
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      color: 'bg-green-500 text-white hover:bg-green-600',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Messages',
      icon: <MessageSquare size={24} />,
      color: 'bg-blue-500 text-white hover:bg-blue-600',
      action: () => window.open(`sms:?body=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-700 text-white hover:bg-blue-800',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'X',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-black text-white hover:bg-slate-800',
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Email',
      icon: <Mail size={24} />,
      color: 'bg-slate-500 text-white hover:bg-slate-600',
      action: () => window.open(`mailto:?body=${encodeURIComponent(shareUrl)}`, '_blank')
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-[17px] font-semibold text-slate-800 ml-2">Share</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-start gap-4 overflow-x-auto pb-4 mb-4 custom-scrollbar">
            {shareOptions.map((opt, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group" 
                onClick={opt.action}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${opt.color}`}>
                  {opt.icon}
                </div>
                <span className="text-xs text-slate-600 font-medium tracking-tight">{opt.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1.5 pl-4 bg-slate-50 rounded-xl border border-slate-200">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-700 truncate"
            />
            <button 
              onClick={handleCopy}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${copied ? 'bg-[#5D34F7] text-white' : 'bg-slate-200/80 text-slate-800 hover:bg-slate-300'}`}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
