import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { Calendar, Clock, MapPin, ArrowLeft, UtensilsCrossed, Heart, Users } from 'lucide-react';

export const CommunityLunch = () => {
  return (
    <div className="pb-32">
      <PageHeader title="COMMUNITY LUNCH" subtitle="Serving Our Neighbors" />
      
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
              <UtensilsCrossed size={48} className="text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">Community Lunch</h2>
            <p className="text-xl text-neutral leading-relaxed">
              A free lunch for our neighbors. Every first Sunday of the month, we open our doors 
              to serve a hot meal and build community with those around us.
            </p>
          </VibrantCard>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-400">
            <VibrantCard className="p-6 bg-white/80 hover-lift">
              <div className="flex items-start gap-4">
                <Clock className="text-gold flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">When We Serve</h3>
                  <p className="text-neutral mb-2"><strong className="text-charcoal">First Sunday of Each Month</strong></p>
                  <p className="text-neutral text-lg font-bold text-gold">12:00 PM</p>
                  <p className="text-neutral text-sm mt-2">Following our morning service</p>
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

          {/* Our Mission */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-600">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="text-gold flex-shrink-0 mt-1" size={32} />
              <h3 className="font-serif text-3xl font-bold text-charcoal">Our Mission</h3>
            </div>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                Community Lunch is one of the ways we live out our mission to love and serve our neighbors. 
                We believe that sharing a meal together is one of the most powerful ways to build community 
                and show God's love in a practical way.
              </p>
              <p>
                This is a free event open to everyone in our community - whether you're part of our church 
                family or not. We welcome singles, families, seniors, and anyone who would like to join us 
                for good food and good company.
              </p>
            </div>
          </VibrantCard>

          {/* What to Expect */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-700">
            <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">What to Expect</h3>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                When you arrive, you'll be welcomed by our team and shown to a seat. We serve a hot, 
                home-cooked meal that's prepared with care by our volunteers. The atmosphere is warm and 
                friendly, and there's always plenty of food.
              </p>
              <p>
                After the meal, we often have time for conversation, games, or simply enjoying each other's 
                company. It's a relaxed, informal gathering where everyone is welcome.
              </p>
            </div>
          </VibrantCard>

          {/* Get Involved */}
          <VibrantCard className="p-8 md:p-12 bg-white/80 animate-fade-in-up delay-800">
            <div className="flex items-start gap-4 mb-6">
              <Users className="text-gold flex-shrink-0 mt-1" size={32} />
              <h3 className="font-serif text-3xl font-bold text-charcoal">Get Involved</h3>
            </div>
            <div className="space-y-4 text-neutral leading-relaxed">
              <p>
                Community Lunch is made possible by our amazing team of volunteers who help with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Food preparation and cooking</li>
                <li>Serving and hospitality</li>
                <li>Setup and cleanup</li>
                <li>Welcoming and connecting with guests</li>
              </ul>
              <p>
                If you'd like to get involved in serving at Community Lunch, we'd love to have you! 
                Whether you can help once or regularly, your contribution makes a difference.
              </p>
            </div>
          </VibrantCard>

          {/* CTA */}
          <div className="text-center pt-8 animate-fade-in-up delay-900">
            <Link to="/contact">
              <GlowingButton variant="gold" size="lg">
                Contact Us to Volunteer
              </GlowingButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


