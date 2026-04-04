
import React, { useState } from 'react';
import { Community } from '../types';
import { COMMUNITIES } from '../constants';
import { ChevronLeft, Search, Filter, Globe, Shield, Sparkles } from 'lucide-react';

interface DiscoverCommunitiesViewProps {
  onBack: () => void;
  onSelectCommunity: (community: Community) => void;
}

const CATEGORIES = ['All', 'Development', 'Startup', 'AI & ML', 'Marketing', 'Fintech'];

const DiscoverCommunitiesView: React.FC<DiscoverCommunitiesViewProps> = ({ onBack, onSelectCommunity }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set(['c1', 'c2']));

  const toggleJoin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJoinedCommunities(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCommunities = COMMUNITIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || 
      (activeCategory === 'Development' && c.name.includes('React')) ||
      (activeCategory === 'Startup' && c.name.includes('SaaS')) ||
      (activeCategory === 'AI & ML' && c.name.includes('AI'));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="md:col-span-12 lg:col-span-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors border border-slate-200 dark:border-white/10 md:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Explore Communities</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Find your tribe in the tech ecosystem.</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <button className="px-4 py-3 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Categories Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
              activeCategory === cat 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' 
              : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
        {filteredCommunities.map(community => (
          <div 
            key={community.id}
            onClick={() => onSelectCommunity(community)}
            className="group bg-white dark:bg-white/10 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-5 hover:shadow-xl hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden duration-300"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe className="w-12 h-12 text-blue-500" />
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                {community.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{community.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold mt-0.5">{community.members} Members</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <div className="flex -space-x-2">
                     <img src="https://picsum.photos/id/10/20/20" className="w-5 h-5 rounded-full border border-white dark:border-slate-900" />
                     <img src="https://picsum.photos/id/11/20/20" className="w-5 h-5 rounded-full border border-white dark:border-slate-900" />
                     <img src="https://picsum.photos/id/12/20/20" className="w-5 h-5 rounded-full border border-white dark:border-slate-900" />
                   </div>
                   <span className="text-[10px] text-slate-400 font-bold">+ {Math.floor(Math.random() * 100)} active</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
              The premier space for {community.name} professionals. Share, build, and grow together.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
              <div className="flex gap-2">
                <div className="p-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg"><Shield className="w-3 h-3" /></div>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg"><Sparkles className="w-3 h-3" /></div>
              </div>
              <button 
                onClick={(e) => toggleJoin(community.id, e)}
                className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${
                  joinedCommunities.has(community.id)
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {joinedCommunities.has(community.id) ? 'Joined' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverCommunitiesView;
