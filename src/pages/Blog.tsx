import { useState } from 'react';
import { Search, ChevronRight, Calendar, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_POSTS = [
  {
    title: "How to Close More $50K Kitchen Remodeling Jobs",
    excerpt: "Learn the specific sales techniques that top-tier remodelers use to build trust and close high-ticket projects without competing on price.",
    category: "Contractor Sales",
    date: "March 15, 2026",
    author: "James Miller",
    image: "https://picsum.photos/seed/blog1/800/500",
    readTime: "7 min read"
  },
  {
    title: "5 Ways AI is Changing the Remodeling Industry in 2026",
    excerpt: "From visualization to project management, AI is no longer a luxury. Here's how to use it to stay ahead of your competition.",
    category: "AI for Remodelers",
    date: "March 10, 2026",
    author: "Sarah Chen",
    image: "https://picsum.photos/seed/blog2/800/500",
    readTime: "5 min read"
  },
  {
    title: "The Ultimate Guide to Remodeling Lead Generation",
    excerpt: "Stop buying junk leads. Learn how to build a predictable lead generation engine that brings high-intent customers directly to you.",
    category: "Remodeling Leads",
    date: "March 5, 2026",
    author: "James Miller",
    image: "https://picsum.photos/seed/blog3/800/500",
    readTime: "9 min read"
  },
  {
    title: "Why Your Contractor Website Isn't Converting (And How to Fix It)",
    excerpt: "Is your website just a digital brochure? Learn the 3 conversion elements every remodeling website needs to drive demo bookings.",
    category: "Contractor Marketing",
    date: "February 28, 2026",
    author: "Elena Rodriguez",
    image: "https://picsum.photos/seed/blog4/800/500",
    readTime: "6 min read"
  },
  {
    title: "The Best CRM for Contractors: What to Look For",
    excerpt: "Not all CRMs are created equal. Discover the features that actually matter for managing a remodeling sales pipeline.",
    category: "CRM for Contractors",
    date: "February 20, 2026",
    author: "Sarah Chen",
    image: "https://picsum.photos/seed/blog5/800/500",
    readTime: "8 min read"
  },
  {
    title: "How to Scale Your Remodeling Business to $5M+ Revenue",
    excerpt: "Moving from owner-operator to CEO requires systems. Here's the roadmap for scaling your remodeling firm.",
    category: "Business Growth",
    date: "February 12, 2026",
    author: "James Miller",
    image: "https://picsum.photos/seed/blog6/800/500",
    readTime: "10 min read"
  },
  {
    title: "Text Message Follow-Up Scripts That Book More Estimates",
    excerpt: "The right follow-up message at the right time can double your estimate bookings. Here are the exact scripts our top clients use.",
    category: "Contractor Sales",
    date: "February 5, 2026",
    author: "Elena Rodriguez",
    image: "https://picsum.photos/seed/blog7/800/500",
    readTime: "4 min read"
  },
  {
    title: "Google Ads for Contractors: A Step-by-Step Beginner's Guide",
    excerpt: "Running Google Ads without a system is expensive. Learn how to set up campaigns that generate $10K+ jobs consistently.",
    category: "Contractor Marketing",
    date: "January 28, 2026",
    author: "Sarah Chen",
    image: "https://picsum.photos/seed/blog8/800/500",
    readTime: "12 min read"
  },
  {
    title: "How to Price Kitchen Remodels to Maximize Profit",
    excerpt: "Underpricing is killing your margins. Use these pricing strategies to land higher-value jobs while staying competitive.",
    category: "Business Growth",
    date: "January 20, 2026",
    author: "James Miller",
    image: "https://picsum.photos/seed/blog9/800/500",
    readTime: "7 min read"
  }
];

const POSTS_PER_PAGE = 6;

const CATEGORIES = [
  "Contractor Sales",
  "Remodeling Leads",
  "Contractor Marketing",
  "CRM for Contractors",
  "AI for Remodelers",
  "Business Growth"
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const filtered = ALL_POSTS.filter((post) => {
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === null || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategory = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setCurrentPage(1);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">The Remodeler's Growth Blog</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Expert insights on sales, marketing, and technology for the modern remodeling contractor.
          </p>
          {/* Inline search in hero */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-10 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-10 order-2 lg:order-1">
            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-navy">Categories</h3>
                {activeCategory && (
                  <button
                    onClick={() => handleCategory(activeCategory)}
                    className="text-xs text-gray-400 hover:text-blue-electric underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                        activeCategory === cat
                          ? 'bg-blue-electric text-white'
                          : 'text-gray-600 hover:text-blue-electric hover:bg-blue-electric/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight size={14} /> {cat}
                      </span>
                      <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                        activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {ALL_POSTS.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="p-8 bg-blue-electric rounded-2xl text-white space-y-4">
              <h3 className="text-xl font-bold">Get Growth Guides</h3>
              <p className="text-sm text-white/80">Latest strategies delivered to your inbox weekly.</p>
              {subscribed ? (
                <div className="text-center py-3 bg-white/20 rounded-lg text-sm font-bold">
                  You're subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/50 outline-none focus:bg-white/20 text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-blue-electric rounded-lg font-bold hover:bg-navy hover:text-white transition-all text-sm"
                  >
                    Subscribe Free
                  </button>
                </form>
              )}
            </div>

            {/* Popular Articles */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Popular Articles</h3>
              <div className="space-y-4">
                {ALL_POSTS.slice(0, 3).map((post, i) => (
                  <div key={i} className="flex gap-3 group cursor-pointer">
                    <span className="text-2xl font-black text-gray-100 leading-none w-8 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm font-bold text-navy group-hover:text-blue-electric transition-colors leading-snug">
                      {post.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Blog Grid */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-8">
            {/* Active filters */}
            {(searchQuery || activeCategory) && (
              <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                  {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
                  {activeCategory && <span> in <strong>{activeCategory}</strong></span>}
                </span>
                <button
                  onClick={() => { handleSearch(''); setActiveCategory(null); }}
                  className="text-xs text-gray-400 hover:text-red-500 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {paginated.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {paginated.map((post, i) => (
                  <article key={i} className="group cursor-pointer">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-gray-100 shadow-sm">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCategory(post.category)}
                          className="inline-block px-3 py-1 rounded-full bg-blue-electric/10 text-blue-electric text-xs font-bold uppercase tracking-wider hover:bg-blue-electric hover:text-white transition-all"
                        >
                          {post.category}
                        </button>
                        <span className="text-xs text-gray-400">{post.readTime}</span>
                      </div>
                      <h2 className="text-xl font-bold text-navy group-hover:text-blue-electric transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-5 pt-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} /> {post.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={13} /> {post.author}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <p className="text-4xl">🔍</p>
                <h3 className="text-xl font-bold text-navy">No articles found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or clearing the category filter.</p>
                <button
                  onClick={() => { handleSearch(''); setActiveCategory(null); }}
                  className="btn-primary mt-4 inline-block"
                >
                  View All Articles
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-gray-100 flex items-center justify-center gap-2">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      page === safePage
                        ? 'bg-blue-electric text-white shadow-md'
                        : 'border border-gray-200 text-navy hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-navy">Want to Close More Jobs?</h2>
          <p className="text-lg text-gray-600">
            See how our platform can implement these growth strategies for your business automatically.
          </p>
          <Link to="/book-demo" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-2">
            Book My Demo <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
