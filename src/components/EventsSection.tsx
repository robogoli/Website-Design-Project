import React, { useState } from 'react';
import { MapPin, PhoneCall, Users, Coffee, Baby, Calendar, ShieldCheck } from 'lucide-react';
import { CommunityEvent, DistrictType } from '../types';
import { COMMUNITY_EVENTS } from '../data/mockData';

interface EventsSectionProps {
  onCall: (phone: string, title: string) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ onCall }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType | 'all'>('all');

  const districts: Array<DistrictType | 'all'> = [
    'all',
    'Central Cumming',
    'North Forsyth',
    'South Forsyth',
    'East Forsyth',
    'West Forsyth'
  ];

  const filteredEvents = COMMUNITY_EVENTS.filter((evt) => {
    if (selectedDistrict !== 'all' && evt.district !== selectedDistrict) {
      return false;
    }
    return true;
  });

  return (
    <div className="civic-container space-y-6">
      <header>
        <div className="flex items-center gap-2 text-amber-800 text-xs font-mono uppercase font-bold tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Forsyth County Community Gatherings</span>
        </div>
        <h1 className="hero-title">
          Local Gatherings &amp; Community Events
        </h1>
        <p className="hero-desc">
          Upcoming community drives, food box distributions, and family nights around Cumming and Forsyth County. Every listed event has had its schedule and contact details independently verified with the organizer.
        </p>

        {/* District filter */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          <span className="text-xs text-stone-500 font-medium mr-1">District:</span>
          {districts.map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setSelectedDistrict(dist)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedDistrict === dist
                  ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {dist === 'all' ? 'All Districts' : dist}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <article
            key={evt.id}
            className="event-card bg-white border border-stone-200 hover:border-amber-700/50 rounded-2xl p-5 shadow-2xs transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="event-badge-datetime inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <time dateTime={evt.date}>{evt.date}</time>
                    <span>·</span>
                    <span>{evt.time}</span>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {evt.district}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    {evt.verificationDate || 'Verified Event'}
                  </span>

                  {evt.freeRefreshments && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                      <Coffee className="w-3 h-3 text-emerald-600" /> Free Snacks
                    </span>
                  )}

                  {evt.childcareAvailable && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-medium">
                      <Baby className="w-3 h-3 text-sky-600" /> Childcare On-Site
                    </span>
                  )}
                </div>

                <h2 className="event-title text-base sm:text-lg font-bold font-serif text-stone-900">
                  {evt.title}
                </h2>
                <p className="event-description text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {evt.description}
                </p>

                <address className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1 not-italic">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
                  <span className="text-stone-700 font-medium">{evt.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>Organized by {evt.organizer}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3 text-stone-400" />
                    <span>{evt.attendeeCount} / {evt.maxCapacity} registered</span>
                  </span>
                </address>
              </div>

              <a
                href={`tel:${evt.contactPhone.replace(/[^\d+]/g, '')}`}
                onClick={(e) => {
                  e.preventDefault();
                  onCall(evt.contactPhone, evt.title);
                }}
                className="btn btn-primary text-xs whitespace-nowrap self-start sm:self-center inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Call organizer</span>
              </a>
            </div>
          </article>
        ))}

        {filteredEvents.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500 text-xs">
            No events found in {selectedDistrict}. Try selecting &ldquo;All Districts&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
};
