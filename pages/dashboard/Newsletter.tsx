import React from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { FileText, Download } from 'lucide-react';

export const Newsletter = () => {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
         <h1 className="text-4xl font-serif font-bold text-charcoal">Newsletters</h1>
         <p className="text-neutral mt-1">Church life updates.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* Current */}
         <div className="md:col-span-2">
            <div className="bg-gold p-1 rounded-t-[8px] w-fit"><span className="text-charcoal font-bold text-xs px-4 uppercase tracking-widest">Latest</span></div>
            <div className="glass-card p-8 md:p-16 text-center rounded-[8px] rounded-tl-none border-t-0 bg-white shadow-lg">
                <FileText size={64} className="text-gold mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-2 font-bold">October 2023</h2>
                <p className="text-neutral mb-8 font-medium">Harvest Edition</p>
                <button className="bg-charcoal text-white px-8 py-3 rounded-[4px] font-bold uppercase tracking-wider hover:bg-gold hover:text-charcoal transition-colors shadow-lg w-full md:w-auto">
                    Read Online
                </button>
            </div>
         </div>

         {/* Archive */}
         <div>
            <h3 className="text-charcoal font-bold uppercase tracking-widest text-xs mb-4">Archive</h3>
            <div className="space-y-3">
                {['September 2023', 'August 2023', 'July 2023', 'June 2023'].map((month, i) => (
                    <div key={i} className="bg-white border border-gray-200 p-4 flex justify-between items-center hover:shadow-md hover:border-gold cursor-pointer rounded-[4px] transition-all">
                        <span className="text-neutral font-medium">{month}</span>
                        <Download size={16} className="text-neutral hover:text-gold" />
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};