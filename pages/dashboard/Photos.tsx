import React from 'react';

export const Photos = () => {
  const photos = [
    'https://images.unsplash.com/photo-1511632765486-a01980978a63?auto=format&fit=crop&w=500&q=60', // Community
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=500&q=60', // Group
    'https://images.unsplash.com/photo-1529070538774-32973fcf5223?auto=format&fit=crop&w=500&q=60', // Guitar
    'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=500&q=60', // Nature
    'https://images.unsplash.com/photo-1511649475669-e288648b2339?auto=format&fit=crop&w=500&q=60', // Concert
    'https://images.unsplash.com/photo-1609234656388-0aa3c5c4fe97?auto=format&fit=crop&w=500&q=60', // Bible
    'https://images.unsplash.com/photo-1510590337019-5ef2d3977e9e?auto=format&fit=crop&w=500&q=60', // Forest/People
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=500&q=60', // Music
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=500&q=60', // Service
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=500&q=60', // Kids
    'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=500&q=60', // Talk
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=60', // Party
  ];

  return (
    <div className="space-y-8">
       <div className="border-b border-gray-200 pb-6">
         <h1 className="text-4xl font-serif font-bold text-charcoal">Gallery</h1>
         <p className="text-neutral mt-1">Moments captured.</p>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((src, i) => (
            <div key={i} className="group relative break-inside-avoid rounded-[8px] overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow">
                <img 
                    src={src} 
                    alt="Gallery" 
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gold/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply"></div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white font-serif italic text-lg border-b border-white pb-1">View</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};