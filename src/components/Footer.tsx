import React from 'react';
import { Smartphone, Monitor, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="civic-footer print:hidden">
      <div className="civic-container space-y-4">
        <div className="civic-footer-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <strong className="text-white font-serif text-base block">CivicBridge</strong>
            <span className="text-xs text-stone-300">Community Resource Directory · Forsyth County, Georgia</span>
          </div>

          {/* Displays tested device form-factor badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-400 font-mono text-[11px] uppercase mr-1">Responsive on:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 border border-stone-700 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>iPhone</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 border border-stone-700 font-medium">
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>PC Browser</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 border border-stone-700 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile Phone</span>
            </span>
          </div>

          <div>
            <a
              href="https://github.com/robogoli/Website-Design-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors border border-stone-700 shadow-xs"
            >
              <Github className="w-4 h-4 text-stone-300" />
              <span>GitHub: robogoli/Website-Design-Project</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-400 gap-2">
          <div>
            &copy; {new Date().getFullYear()} CivicBridge · Serving Cumming and Forsyth County residents · Dedicated to equitable community wayfinding
          </div>
          <div>
            Built with Semantic HTML5, Handcrafted CSS3 &amp; React 19
          </div>
        </div>
      </div>
    </footer>
  );
};
