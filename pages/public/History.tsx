import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, Building, Flame, Heart } from 'lucide-react';

export const History = () => {
  const timeline = [
    {
      year: '1882',
      title: 'The Beginning',
      icon: <Calendar size={32} />,
      content: 'In 1882, it was recognised within the wider Ashburton Community that there was a call to pursue the possibility of starting a local Baptist Church under the guidance of the wider Canterbury Association. On the 1st Sunday in October 1882, the very first Baptist Church service was held in Templar Hall, conducted by Rev. T. Bray. The Canterbury Association provided regular speakers for the following 3 years, until Mr J W Sawle was appointed as the first-ever Pastor in March of 1886.'
    },
    {
      year: '1885-1887',
      title: 'The First Building',
      icon: <Building size={32} />,
      content: 'In August of 1885, a plot of land was purchased in Peter Street for the sum of £75. Just two years later in April 1887, the Church building was completed and opened its doors to the community. Although the building itself was small, it served its purpose short term and was eventually used as the schoolroom for the Church.'
    },
    {
      year: '1896',
      title: 'The Tabernacle',
      icon: <Building size={32} />,
      content: 'Probably the most exciting development in the life of the Church was with the building of a new, much larger church. The Tabernacle seated 250 people and opened in November 1896. The completion of The Tabernacle was due to the astute efforts of Rev. Albert Agar, the Pastor at the time and also the lead architect for the project. Originally from Australia, Rev Agar had arrived in Ashburton in 1893 and as the dynamic leader of the Church drove not only the promotion of the financing scheme but also the building project to fruition.'
    },
    {
      year: '1925',
      title: 'The Tabernacle Fire',
      icon: <Flame size={32} />,
      content: 'Sadly, on 4th March 1925, the Tabernacle was burnt to the ground. It was a devastating loss and the building held many memories for the older members of the congregation. Many were baptised and married here as well as farewelling many loved ones into God\'s care. Undeterred, church members continued to meet at the Tancred Street Hall.'
    },
    {
      year: '1926',
      title: 'Havelock Street Building',
      icon: <Building size={32} />,
      content: 'In due course, a new church building commenced, on land purchased on the corner of Cass and Havelock Street, where it stands today. The Havelock Street building was opened on 14th August 1926. Built at a cost of £5000 with a £850 mortgage, becoming debt-free in 1933.'
    },
    {
      year: '1985-2011',
      title: 'Growth & Rebuilding',
      icon: <Building size={32} />,
      content: 'In the mid-1980s, the Church was altered and extended to accommodate a growing congregation. Over the following 20 years the Church family continued to grow and areas of the building underwent considerable wear and tear. With the view to build a new Church in a different location, another property was purchased in Alford Forest Road. But after much prayer and consideration, this property was sold and the current site was extended instead. This building is now finished and officially opened on 1st May 2011. Sadly the old church building was irrevocably damaged by an earthquake on 22nd February 2011. After much prayer and consideration, it was decided to demolish the old building and make room to rebuild in the future. In its place we now have a car park, but plans are in place to extend the building.'
    }
  ];

  return (
    <div className="pb-32">
      <PageHeader title="HISTORY" subtitle="Our Story" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-charcoal mb-6">
            Ashburton Baptist Church
          </h2>
          <p className="text-2xl md:text-3xl text-gold font-bold mb-4">Est. 1882</p>
          <p className="text-lg text-neutral max-w-3xl mx-auto leading-relaxed">
            Over 140 years of faithful service to our community, built on the foundation of Jesus Christ.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-12">
          {timeline.map((item, i) => (
            <div key={i} className="relative animate-fade-in-up hover-lift" style={{ animationDelay: `${200 + i * 150}ms` }}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-32 flex-shrink-0">
                  <div className="flex items-center gap-4 md:flex-col md:items-start">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal transition-all duration-300">
                      {item.icon}
                    </div>
                    <div className="md:mt-4">
                      <span className="text-2xl md:text-3xl font-serif font-bold text-charcoal block">{item.year}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <VibrantCard className="p-8 md:p-10 bg-white/80">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mb-4">{item.title}</h3>
                    <p className="text-neutral leading-relaxed text-lg">{item.content}</p>
                  </VibrantCard>
                </div>
              </div>
              {i < timeline.length - 1 && (
                <div className="hidden md:block absolute left-8 top-24 w-0.5 h-12 bg-gold/30"></div>
              )}
            </div>
          ))}
        </div>

        {/* Gratitude Section */}
        <section className="mt-20 md:mt-32 animate-fade-in-up delay-1100">
          <VibrantCard className="p-8 md:p-12 text-center bg-white/80 border-l-4 border-l-gold">
            <Heart className="text-gold mx-auto mb-6 animate-float" size={48} />
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-8">Gratitude and Thanks</h3>
            <div className="space-y-6 text-neutral leading-relaxed text-lg max-w-4xl mx-auto">
              <p>
                We want to acknowledge the large number of church members from the past who have poured their lives into our Church to bring glory to God's name during their time here. Their commitment and dedication in seeking and pursuing God's will for this Church, ensures that their work will continue to thrive.
              </p>
              <p>
                The Church has always been a family with many unofficial church "Grandparents" in our congregation. These are those wonderful people that show abundant love and support to the children within the Church family. We are so proud in knowing that genuine love and compassion have always been a hallmark of this Church.
              </p>
              <p>
                We are grateful for the faithful prayers of so many of God's people in our Church. All of those faithful members from past generations who diligently prayed with vision for the future of our Church, through to the faithfulness of the prayer warriors of today.
              </p>
              <p className="text-charcoal font-bold text-xl mt-8">
                We have, by the grace of God, built a building, but God reminds us that we are the living stones of His temple. Built on the everlasting foundation stone, Jesus Christ. Let us live our lives as his Chosen, proclaiming His wonderful acts to the community around us.
              </p>
            </div>
          </VibrantCard>
        </section>
      </div>
    </div>
  );
};

