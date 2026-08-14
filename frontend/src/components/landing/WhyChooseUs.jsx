import React from 'react';
import { ShieldCheck, BarChart3, Clock, Target } from 'lucide-react';

export const WhyChooseUs = () => {
  const cards = [
    {
      icon: ShieldCheck,
      title: 'Protect emergency response times',
      description: 'Pre-clears conflicting junctions before the ambulance arrives, cutting average transit delays by up to 52%.'
    },
    {
      icon: BarChart3,
      title: 'Smooth out density spikes',
      description: 'Real-time adaptive green allocation reduces peak junction queues without fixed timer penalties.'
    },
    {
      icon: Clock,
      title: 'Reduce driver waiting ambiguity',
      description: 'Roadside countdown boards eliminate driver frustration and dramatically increase lane yielding compliance.'
    },
    {
      icon: Target,
      title: 'Recognize risky movement',
      description: 'Computer vision trajectory analytics detect aggressive lane cutting, sudden swerving, and unsafe lane violations.'
    }
  ];

  return (
    <section id="why-us" className="py-20 px-10 max-w-7xl mx-auto text-center">
      <h2 className="text-4xl font-extrabold mb-4 text-slate-900 font-['Outfit']">
        Why Choose Us
      </h2>

      <p className="text-base text-slate-600 max-w-xl mx-auto mb-12">
        ASI provides municipal control rooms with end-to-end adaptive intelligence from density sensors to emergency triage.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-white border border-slate-200 rounded-2xl p-7 text-left shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
                <Icon size={20} />
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-slate-900 mb-2 font-['Outfit']">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
