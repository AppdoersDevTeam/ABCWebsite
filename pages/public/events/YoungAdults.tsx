import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { Users, Clock, MapPin, ArrowLeft, Coffee, Heart } from 'lucide-react';

export const YoungAdults = () => {
  return (
    <div className="pb-32">
      <PageHeader title="YOUNG ADULTS" subtitle="Connect. Grow. Serve." />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl">
        {/* Back Button */}
        <Link to="/events" className="inline-flex items-center gap-2 text-gold hover:text-charcoal mb-8 transition-colors font-bold animate-fade-in-up">
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Hero Section */}
          <VibrantCard className="p-8 md:p-12 text-center border-t-4 border-t-gold animate-fade-in-up delay-200">
            <div className="bg-gold/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Users size={48} className="text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">Young Adults</h2>
            <p className="text-xl text-neutral leading-relaxed">
              A space for 18-30 year olds to connect, grow in faith, and build meaningful relationships. 
              Whether you're studying, working, or figuring out life, you're welcome here.
            </p>
          </VibrantCard>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-400">
            <VibrantCard className="p-6 bg-white/80 hover-lift">
              <div className="flex items-start gap-4">
                <Clock className="text-gold flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">When We Meet</h3>
                  <p className="text-neutral mb-2"><strong className="text-charcoal">Every Wednesday</strong></p>
                  <p className="text-neutral text-lg font-bold text-gold">7:00 PM</p>
                </div>
              </div>
            </VibrantCard>

            <VibrantCard className="p-6 bg-white/80 hover-lift">
              <div className="flex items-start gap-4">
                <MapPin className="text-gold flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Location</h3>
                  <p className="text-neutral mb-2">284 Havelock Street</p>
                  <p className="text-neutral">Ashburton 7700</p>
                </div>
              </div>
            </VibrantCard>
          </div>

          {/* What We Do */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-600">
            <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">What We Do</h3>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                Our Young Adults group is a vibrant community where you can be yourself, ask questions, 
                and explore faith in a safe and welcoming environment. We gather weekly to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Study the Bible together and discuss how it applies to our lives</li>
                <li>Worship and pray together</li>
                <li>Build genuine friendships and support each other</li>
                <li>Serve our community and make a difference</li>
                <li>Have fun together through social events and activities</li>
              </ul>
            </div>
          </VibrantCard>

          {/* Community & Connection */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-700">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="text-gold flex-shrink-0 mt-1" size={32} />
              <h3 className="font-serif text-3xl font-bold text-charcoal">Community & Connection</h3>
            </div>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                Life in your 20s can be challenging - navigating studies, careers, relationships, and 
                figuring out who you are and what you believe. Our Young Adults group is a place where 
                you don't have to have it all figured out.
              </p>
              <p>
                We're a diverse group of people from different backgrounds, but we share a common desire 
                to grow, learn, and support each other. Whether you're new to faith or have been following 
                Jesus for years, you'll find a place here.
              </p>
            </div>
          </VibrantCard>

          {/* Social Events */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-800">
            <div className="flex items-start gap-4 mb-6">
              <Coffee className="text-gold flex-shrink-0 mt-1" size={32} />
              <h3 className="font-serif text-3xl font-bold text-charcoal">Social Events</h3>
            </div>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                Beyond our weekly gatherings, we regularly organize social events including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>BBQs and outdoor activities</li>
                <li>Game nights and movie nights</li>
                <li>Service projects in the community</li>
                <li>Weekend retreats and camps</li>
                <li>Social outings and adventures</li>
              </ul>
              <p>
                These events are great opportunities to build friendships and have fun together outside 
                of our regular meeting times.
              </p>
            </div>
          </VibrantCard>

          {/* CTA */}
          <div className="text-center pt-8 animate-fade-in-up delay-900">
            <Link to="/contact">
              <GlowingButton variant="gold" size="lg">
                Get In Touch
              </GlowingButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


