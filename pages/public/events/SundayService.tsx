import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { Music, Clock, MapPin, Users, ArrowLeft, Calendar } from 'lucide-react';

export const SundayService = () => {
  return (
    <div className="pb-32">
      <PageHeader title="SUNDAY SERVICE" subtitle="Join Us for Worship" />
      
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
              <Music size={48} className="text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">Sunday Service</h2>
            <p className="text-xl text-neutral leading-relaxed">
              Join us every Sunday for a time of worship, teaching, and community. 
              We gather together to encounter God, connect with each other, and be equipped to impact our world.
            </p>
          </VibrantCard>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-400">
            <VibrantCard className="p-6 bg-white/80 hover-lift">
              <div className="flex items-start gap-4">
                <Clock className="text-gold flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Service Times</h3>
                  <p className="text-neutral mb-2"><strong className="text-charcoal">Every Sunday</strong></p>
                  <p className="text-neutral text-lg font-bold text-gold">10:00 AM</p>
                  <p className="text-neutral text-sm mt-2">Service duration: 90 minutes</p>
                </div>
              </div>
            </VibrantCard>

            <VibrantCard className="p-6 bg-white/80 hover-lift">
              <div className="flex items-start gap-4">
                <MapPin className="text-gold flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Location</h3>
                  <p className="text-neutral mb-2">284 Havelock Street</p>
                  <p className="text-neutral mb-4">Ashburton 7700</p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=284+Havelock+Street+Ashburton+7700" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold hover:text-charcoal font-bold transition-colors text-sm"
                  >
                    View on Map →
                  </a>
                </div>
              </div>
            </VibrantCard>
          </div>

          {/* What to Expect */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-600">
            <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">What to Expect</h3>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                Our Sunday service is a vibrant gathering where people of all ages come together to worship God. 
                We begin with a time of contemporary and traditional worship music, led by our worship team.
              </p>
              <p>
                Following worship, we share announcements and updates about church life, then hear a message 
                from God's Word that is practical, relevant, and applicable to everyday life.
              </p>
              <p>
                After the service, we invite you to stay for refreshments in our Connect Café, where you can 
                meet others and build relationships.
              </p>
            </div>
          </VibrantCard>

          {/* Music & Worship */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-700">
            <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">Music & Worship</h3>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                We enjoy a wide range of praise and worship music, from traditional hymns to contemporary songs. 
                Our worship is sensitive to the Holy Spirit and sometimes includes times of free worship that 
                flow naturally from our songs.
              </p>
              <p>
                Our worship team is made up of talented musicians and vocalists who lead us in authentic, 
                heartfelt worship. We believe worship is not just about the music, but about connecting with 
                God and expressing our love and gratitude to Him.
              </p>
            </div>
          </VibrantCard>

          {/* Children's Programs */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-800">
            <div className="flex items-start gap-4 mb-6">
              <Users className="text-gold flex-shrink-0 mt-1" size={32} />
              <h3 className="font-serif text-3xl font-bold text-charcoal">Children's Programs</h3>
            </div>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                We are a family-friendly church and welcome children of all ages. During the service, we offer:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-charcoal">Kids Church</strong> - Fun and engaging programs for school-aged children (runs during school term)</li>
                <li><strong className="text-charcoal">Parents Room</strong> - A comfortable space for parents with babies and toddlers</li>
                <li><strong className="text-charcoal">Nursery</strong> - Care for the littlest ones</li>
              </ul>
              <p>
                All our children's programs are run by trained, background-checked volunteers who love 
                working with kids and helping them grow in their faith.
              </p>
            </div>
          </VibrantCard>

          {/* Parking */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-900">
            <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">Parking</h3>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                We have a dedicated car park on church grounds on Havelock Street. There is also ample 
                free off-street parking available close to and in the vicinity of the church auditorium.
              </p>
              <p className="text-sm text-neutral/80">
                <strong>Note:</strong> There may be roadworks happening around the church and in the 
                Town Centre, so please plan your time to allow for extra time to find parking.
              </p>
            </div>
          </VibrantCard>

          {/* CTA */}
          <div className="text-center pt-8 animate-fade-in-up delay-1000">
            <Link to="/im-new">
              <GlowingButton variant="gold" size="lg">
                I'm New - Learn More
              </GlowingButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

