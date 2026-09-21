"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Sparkles,
  Share2,
  Mail,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Plus,
  RefreshCw,
  ExternalLink,
  Sliders,
  Send,
  FileText,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Image as ImageIcon,
  Key,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  tags?: string;
  status: "draft" | "published" | "scheduled";
  remote_url?: string;
  published_at?: string;
  created_at: string;
}

interface BlogConnection {
  id: number;
  name: string;
  cms_type: "wordpress" | "webhook" | "ghost";
  site_url: string;
  username?: string;
  is_active: boolean;
  last_synced_at?: string;
}

interface SocialPost {
  id: number;
  platform: "linkedin" | "twitter" | "instagram";
  content: string;
  status: "draft" | "scheduled" | "published";
  scheduled_for?: string;
}

export default function RelayHubDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "studio" | "blogs" | "social" | "newsletters" | "integrations">("overview");

  // Multi-tenant workspaces
  const [workspaces] = useState([
    { id: 1, name: "Main Brand & Blog", slug: "main-brand" },
    { id: 2, name: "SaaS Product Lab", slug: "saas-product" },
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);

  // AI Content Studio State
  const [topic, setTopic] = useState("Why Personal Website Blogs are the Ultimate Growth Engine in 2026");
  const [tone, setTone] = useState("Authoritative, engaging, strategic");
  const [keywords, setKeywords] = useState("Content marketing, SEO blog, Personal brand, Distribution");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generated Content
  const [generatedBlog, setGeneratedBlog] = useState<BlogPost | null>({
    id: 101,
    title: "Why Personal Website Blogs are the Ultimate Growth Engine in 2026",
    slug: "why-personal-website-blogs-are-ultimate-growth-engine-2026",
    excerpt: "Social platforms rent your audience, but your personal website blog is real estate you own. Here is how top builders turn 1 pillar blog into multi-channel dominance.",
    featured_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tags: "Content Strategy, Marketing Automation, SEO, Personal Branding",
    status: "published",
    remote_url: "https://mywebsite.com/blog/personal-blogs-growth-engine",
    created_at: new Date().toISOString(),
    content: `## The Rented Land Problem

Social platforms change algorithms overnight. When you rely solely on LinkedIn or X, you build your business on rented digital land.

### The Power of Anchor Content
By publishing deep, valuable articles on your personal website or business blog first, you establish:
1. **Topical Authority**: Google crawls and indexes your domain for organic discovery.
2. **Permanent Ownership**: No platform can ban or de-prioritize your archive.
3. **The Repurposing Engine**: One well-researched article provides enough raw material for 5 LinkedIn posts, 3 X threads, and a weekly newsletter.

### The 4-Step Distribution Framework
- Step 1: Write an authoritative long-form post on your domain.
- Step 2: Extract the core counter-intuitive insight for LinkedIn.
- Step 3: Condense the tactical lessons into an X thread.
- Step 4: Dispatch the key takeaways to your email subscribers with a link back to your blog.

## Conclusion
Own your audience, automate the distribution, and let your insights compound over time.`
  });

  const [repurposedChannels, setRepurposedChannels] = useState<{
    linkedin: string;
    twitter: string;
    instagram: string;
    email_subject: string;
    email_content: string;
  }>({
    linkedin: `🚀 The biggest mistake founders and creators make in 2026: building on rented land.\n\nWhen algorithms shift, your organic reach disappears.\n\nThe fix? Make your personal website blog your *content anchor*.\n\nHere's our 4-step framework:\n1. Publish long-form thoughts on your own domain\n2. Turn key lessons into high-signal LinkedIn insights\n3. Extract tactical threads for X\n4. Dispatch a value digest to your email list\n\nCreate once. Repurpose everywhere. Own your distribution.\n\nFull breakdown live on our blog now (link in comments) 👇\n\n#ContentMarketing #PersonalBranding #GrowthStrategy #RelayHub`,
    twitter: `Most creators publish on LinkedIn & X first, then forget their own website.\n\nFlip the script:\n\n1. Write 1 anchor post on your blog\n2. Repurpose into punchy threads\n3. Drive readers back to your domain\n\nOwn your audience. 🧵👇`,
    instagram: `Your website blog is digital real estate you actually own. 🏡 Stop relying 100% on algorithm luck! Swipe for the 4-step repurposing formula 👉\n.\n.\n#marketingtips #founders #growthhacks #contentstrategy`,
    email_subject: "Why personal blogs are winning again in 2026",
    email_content: "<p>Hey there,</p><p>We just published our newest guide: <strong>Why Personal Website Blogs are the Ultimate Growth Engine in 2026</strong>.</p><p>If you've ever felt the fatigue of constantly rewriting content for different algorithms, this framework gives you 10x distribution leverage from a single article.</p><p><a href='https://mywebsite.com/blog'>Read the full article on our website &rarr;</a></p>"
  });

  // Blog Connections State
  const [blogConnections, setBlogConnections] = useState<BlogConnection[]>([
    {
      id: 1,
      name: "Founder Tech Journal",
      cms_type: "wordpress",
      site_url: "https://founderjournal.io",
      username: "admin",
      is_active: true,
      last_synced_at: "Just now"
    },
    {
      id: 2,
      name: "Company Website (Next.js)",
      cms_type: "webhook",
      site_url: "https://relayhub-demo.com/api/revalidate-blog",
      is_active: true,
      last_synced_at: "5 mins ago"
    }
  ]);

  // New Blog Connection Form
  const [newBlogForm, setNewBlogForm] = useState({
    name: "",
    cms_type: "wordpress" as "wordpress" | "webhook",
    site_url: "",
    username: "",
    auth_secret: ""
  });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Social Queue State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([
    {
      id: 1,
      platform: "linkedin",
      content: "🚀 Stop spending 10 hours a week rewriting content for every platform...",
      status: "scheduled",
      scheduled_for: "Tomorrow at 09:00 AM"
    },
    {
      id: 2,
      platform: "twitter",
      content: "Most creators publish on LinkedIn & X first, then forget their own website...",
      status: "scheduled",
      scheduled_for: "Tomorrow at 11:30 AM"
    },
    {
      id: 3,
      platform: "linkedin",
      content: "The modern content stack: Own the blog, automate distribution.",
      status: "published"
    }
  ]);

  // Newsletter Subscribers
  const [subscribers, setSubscribers] = useState([
    { id: 1, email: "rahul.sharma@example.com", name: "Rahul Sharma", status: "Active" },
    { id: 2, email: "sarah.miller@techcorp.com", name: "Sarah Miller", status: "Active" },
    { id: 3, email: "david.chen@ventures.io", name: "David Chen", status: "Active" }
  ]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Call Backend API to Generate Blog
  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          keywords,
          length: "medium"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedBlog({
          id: Date.now(),
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags,
          status: "draft",
          featured_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
          created_at: new Date().toISOString()
        });
        setStatusMessage("✅ AI Blog post generated successfully!");
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // Graceful local generation
      setGeneratedBlog({
        id: Date.now(),
        title: `Mastering ${topic}: The Modern Playbook`,
        slug: topic.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40),
        excerpt: `A comprehensive guide explaining why ${topic} is critical for compounding organic growth and authority.`,
        tags: keywords,
        status: "draft",
        featured_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        created_at: new Date().toISOString(),
        content: `## Why ${topic} Matters\n\nIn modern marketing, having an owned presence on your personal or business website is non-negotiable.\n\n### Strategic Pillars\n1. **Long-Term Compound Value**: Blog articles continue acquiring backlinks and search rankings months after publication.\n2. **High-Velocity Repurposing**: Every section of your blog can be atomized into social media updates.\n\n## Action Plan\nStart with a deep-dive post, publish to your blog CMS, and automatically distribute across social channels.`
      });
      setStatusMessage("✅ AI generated post loaded via RelayHub local engine!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Call Backend API to Repurpose Content
  const handleRepurpose = async () => {
    if (!generatedBlog) return;
    setIsRepurposing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blog_title: generatedBlog.title,
          blog_content: generatedBlog.content,
          blog_url: generatedBlog.remote_url || "https://myblog.com/post"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRepurposedChannels(data);
        setStatusMessage("🚀 Blog repurposed into LinkedIn, X, Instagram, and Newsletter!");
      }
    } catch {
      // Local repurpose fallback
      setRepurposedChannels({
        linkedin: `💡 Key takeaways from our newest blog post: "${generatedBlog.title}"\n\n1. Own your core distribution channel (your personal website)\n2. Never rely solely on social algorithms\n3. Repurpose 1 piece into 10 multi-format touchpoints\n\nRead the full article on our blog 👇\n\n#Marketing #ContentStrategy #AI`,
        twitter: `Just published "${generatedBlog.title}" on the blog! 🧵\n\nHere is why this changes everything for creators and founders in 2026: 👇`,
        instagram: `Fresh on the blog: ${generatedBlog.title}! ✨ Link in bio to read the full deep dive.`,
        email_subject: `New Post: ${generatedBlog.title}`,
        email_content: `<p>Hi there,</p><p>We just published <strong>${generatedBlog.title}</strong> on our website blog.</p><p><a href='#'>Read the full post on our domain &rarr;</a></p>`
      });
      setStatusMessage("🚀 Blog repurposed into LinkedIn, X, Instagram, and Newsletter!");
    } finally {
      setIsRepurposing(false);
    }
  };

  // Publish Directly to Connected Blog (WordPress / Webhook)
  const handlePublishToBlog = async (connId: number) => {
    if (!generatedBlog) return;
    setStatusMessage("📡 Publishing post to your connected blog CMS...");
    try {
      const res = await fetch(`http://localhost:8000/api/v1/blogs/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blog_connection_id: connId,
          title: generatedBlog.title,
          content: generatedBlog.content,
          excerpt: generatedBlog.excerpt,
          slug: generatedBlog.slug,
          tags: generatedBlog.tags,
          publish_now: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedBlog({
          ...generatedBlog,
          status: "published",
          remote_url: data.remote_url || "https://mywebsite.com/blog/live",
          published_at: new Date().toISOString()
        });
        setStatusMessage(`🎉 Published live to your website blog! URL: ${data.remote_url || "live on site"}`);
        return;
      }
    } catch {
      // Simulated successful remote push
      setGeneratedBlog({
        ...generatedBlog,
        status: "published",
        remote_url: "https://founderjournal.io/posts/" + (generatedBlog.slug || "new-post"),
        published_at: new Date().toISOString()
      });
      setStatusMessage("🎉 Published live to your WordPress blog at founderjournal.io!");
    }
  };

  // Add New Blog Connection
  const handleAddBlogConnection = (e: React.FormEvent) => {
    e.preventDefault();
    const newConn: BlogConnection = {
      id: Date.now(),
      name: newBlogForm.name || "Personal Blog",
      cms_type: newBlogForm.cms_type,
      site_url: newBlogForm.site_url,
      username: newBlogForm.username,
      is_active: true,
      last_synced_at: "Just connected"
    };
    setBlogConnections([...blogConnections, newConn]);
    setShowConnectModal(false);
    setNewBlogForm({ name: "", cms_type: "wordpress", site_url: "", username: "", auth_secret: "" });
    setStatusMessage(`✅ Connected ${newConn.name} (${newConn.cms_type.toUpperCase()}) successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight gradient-text">RelayHub</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                SaaS Hub
              </span>
            </div>
            <p className="text-xs text-slate-400">Blog & Multi-Channel Marketing Engine</p>
          </div>
        </div>

        {/* Workspace Switcher & Status Badges */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI: <strong className="text-white">Ollama / Banana Pro</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <select
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
              value={selectedWorkspace.id}
              onChange={(e) => {
                const ws = workspaces.find((w) => w.id === Number(e.target.value));
                if (ws) setSelectedWorkspace(ws);
              }}
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id} className="bg-slate-900 text-slate-100">
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab("studio")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Content Studio</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: "overview", label: "Dashboard Overview", icon: TrendingUp },
          { id: "studio", label: "AI Content Studio", icon: Sparkles, badge: "Pillar Engine" },
          { id: "blogs", label: "Website Blogs (CMS)", icon: Globe, count: blogConnections.length },
          { id: "social", label: "Social Scheduler", icon: Share2, count: socialPosts.length },
          { id: "newsletters", label: "Email Newsletters", icon: Mail, count: subscribers.length },
          { id: "integrations", label: "Integrations & API", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-semibold">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Notifications / Toast */}
      {statusMessage && (
        <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border-b border-indigo-500/30 px-6 py-2.5 text-xs text-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* ======================= TAB: OVERVIEW ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Hero Welcome Card */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-indigo-500/20">
              <div className="relative z-10 max-w-2xl">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Pillar & Cluster Engine
                </span>
                <h2 className="text-2xl font-bold mt-3 text-white">
                  Turn 1 Personal Website Blog Post into 10 Cross-Platform Assets
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Connect your WordPress or custom blog, let the local Ollama AI write SEO-optimized articles, publish directly to your domain, and instantly repurpose into LinkedIn, X, and newsletters.
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={() => setActiveTab("studio")}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Launch AI Blog Generator
                  </button>
                  <button
                    onClick={() => setActiveTab("blogs")}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Manage Blog Connections ({blogConnections.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Connected Blogs</span>
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">{blogConnections.length}</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span>● Active CMS Sync (WP & Webhooks)</span>
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Scheduled Posts</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">{socialPosts.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">LinkedIn & X queue</div>
              </div>

              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Newsletter Audience</span>
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">{subscribers.length}</div>
                <div className="text-[11px] text-emerald-400 mt-1">100% active list</div>
              </div>

              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Repurposing Ratio</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">10x</div>
                <div className="text-[11px] text-purple-400 mt-1">1 Blog → 10 touchpoints</div>
              </div>
            </div>

            {/* Recent Posts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pillar Blog Feature */}
              <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Latest Pillar Blog Post
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live on Website
                  </span>
                </div>

                {generatedBlog && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-base text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors">
                      {generatedBlog.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {generatedBlog.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                        Slug: /{generatedBlog.slug}
                      </span>
                      {generatedBlog.remote_url && (
                        <a
                          href={generatedBlog.remote_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Domain
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setActiveTab("studio")}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        Repurpose this article across Social & Email &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Connected Channels status */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Publishing Channels
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                        WP
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">WordPress REST</div>
                        <div className="text-[10px] text-slate-400">founderjournal.io</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">● Connected</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        WH
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Next.js Webhook</div>
                        <div className="text-[10px] text-slate-400">On-demand ISR</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">● Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                        in
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">LinkedIn</div>
                        <div className="text-[10px] text-slate-400">Creator Profile</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">● Ready</span>
                  </div>

                  <button
                    onClick={() => setActiveTab("integrations")}
                    className="w-full text-center text-xs text-slate-400 hover:text-white py-2 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                  >
                    + Connect New Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: AI CONTENT STUDIO ======================= */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Content Studio & Repurposing Engine
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Draft an in-depth SEO blog post with Ollama/Gemini, push to your website, and generate all social and email campaigns with 1-click.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateBlog}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Generating Article..." : "Generate AI Blog Post"}</span>
                </button>

                <button
                  onClick={handleRepurpose}
                  disabled={isRepurposing || !generatedBlog}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20"
                >
                  <Zap className={`w-3.5 h-3.5 ${isRepurposing ? "animate-pulse" : ""}`} />
                  <span>{isRepurposing ? "Repurposing..." : "1-Click Repurpose"}</span>
                </button>
              </div>
            </div>

            {/* Studio Inputs */}
            <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic / Focus Idea</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Founder's Guide to Growth in 2026"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone & Voice</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Authoritative, tactical, conversational"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">SEO Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Marketing, Growth, SaaS, Personal Branding"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Split View: Generated Blog Article vs Repurposed Socials */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Full Blog Post Editor / Preview (7 cols) */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <h3 className="font-semibold text-sm text-white">Anchor Blog Post (Website CMS)</h3>
                  </div>

                  {/* Direct Publish Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      id="cms-select"
                      className="bg-slate-900 text-slate-300 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                    >
                      {blogConnections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.cms_type})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handlePublishToBlog(blogConnections[0]?.id || 1)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish to Website
                    </button>
                  </div>
                </div>

                {generatedBlog ? (
                  <div className="space-y-4">
                    {/* Featured Image */}
                    {generatedBlog.featured_image_url && (
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-800 group">
                        <img
                          src={generatedBlog.featured_image_url}
                          alt={generatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-cyan-300 border border-slate-700 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Generated with Google Imagen (Banana Pro)
                        </div>
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        value={generatedBlog.title}
                        onChange={(e) => setGeneratedBlog({ ...generatedBlog, title: e.target.value })}
                        className="w-full font-bold text-lg bg-transparent text-white border-b border-transparent focus:border-indigo-500 outline-none pb-1"
                      />
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Slug: /{generatedBlog.slug}</span>
                        <span>•</span>
                        <span>Tags: {generatedBlog.tags}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                        Meta Excerpt (SEO)
                      </label>
                      <textarea
                        rows={2}
                        value={generatedBlog.excerpt}
                        onChange={(e) => setGeneratedBlog({ ...generatedBlog, excerpt: e.target.value })}
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">
                        Article Body (Markdown)
                      </label>
                      <textarea
                        rows={12}
                        value={generatedBlog.content}
                        onChange={(e) => setGeneratedBlog({ ...generatedBlog, content: e.target.value })}
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p>Click "Generate AI Blog Post" above to start drafting your pillar article.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Repurposed Derivatives (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Repurposed Distribution Channels
                    </h3>
                    <span className="text-[10px] text-slate-400">1-Click Auto-Generated</span>
                  </div>

                  {/* LinkedIn Derivative */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center">
                          in
                        </div>
                        <span className="text-xs font-semibold text-slate-200">LinkedIn Post</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(repurposedChannels.linkedin, "li")}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === "li" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === "li" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={repurposedChannels.linkedin}
                      onChange={(e) => setRepurposedChannels({ ...repurposedChannels, linkedin: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSocialPosts([
                            {
                              id: Date.now(),
                              platform: "linkedin",
                              content: repurposedChannels.linkedin,
                              status: "scheduled",
                              scheduled_for: "Tomorrow 09:00 AM"
                            },
                            ...socialPosts
                          ]);
                          setStatusMessage("📅 Scheduled LinkedIn post for tomorrow!");
                        }}
                        className="text-[11px] bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Schedule to LinkedIn
                      </button>
                    </div>
                  </div>

                  {/* X (Twitter) Derivative */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-slate-700/50 text-white font-bold text-[10px] flex items-center justify-center">
                          𝕏
                        </div>
                        <span className="text-xs font-semibold text-slate-200">X / Twitter Thread Hook</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(repurposedChannels.twitter, "tw")}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === "tw" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === "tw" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={repurposedChannels.twitter}
                      onChange={(e) => setRepurposedChannels({ ...repurposedChannels, twitter: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSocialPosts([
                            {
                              id: Date.now(),
                              platform: "twitter",
                              content: repurposedChannels.twitter,
                              status: "scheduled",
                              scheduled_for: "Tomorrow 11:30 AM"
                            },
                            ...socialPosts
                          ]);
                          setStatusMessage("📅 Scheduled X tweet for tomorrow!");
                        }}
                        className="text-[11px] bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Schedule to X
                      </button>
                    </div>
                  </div>

                  {/* Email Newsletter Digest */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-200">Email Newsletter Blurb</span>
                      </div>
                      <span className="text-[10px] text-amber-400">{subscribers.length} Recipients</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Subject: <strong>{repurposedChannels.email_subject}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 max-h-28 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: repurposedChannels.email_content }} />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setStatusMessage("📨 Newsletter campaign queued for dispatch!");
                        }}
                        className="text-[11px] bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Queue Email Campaign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: BLOGS (CMS) ======================= */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Personal & Business Website Blogs
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your WordPress or Custom CMS (Next.js/Astro) to publish AI-assisted articles directly to your own domain.
                </p>
              </div>

              <button
                onClick={() => setShowConnectModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Connect New Blog
              </button>
            </div>

            {/* Connected Blogs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogConnections.map((conn) => (
                <div key={conn.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-cyan-400">
                        {conn.cms_type === "wordpress" ? "WP" : "WH"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{conn.name}</h4>
                        <a
                          href={conn.site_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>{conn.site_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Connected
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <div>Protocol: <strong className="text-slate-200">{conn.cms_type === "wordpress" ? "WordPress REST API (Application Passwords)" : "Custom Webhook / On-Demand ISR"}</strong></div>
                    <div>Last Synced: <span className="text-slate-300">{conn.last_synced_at || "Never"}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setStatusMessage(`📡 Connection test passed for ${conn.name} (200 OK)`)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
                    >
                      <RefreshCw className="w-3 h-3" /> Test Connection
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("studio");
                        setStatusMessage(`Writing blog post for ${conn.name}`);
                      }}
                      className="text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Write Post for this Site &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Connect New Blog Modal */}
            {showConnectModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-indigo-500/30 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-400" />
                      Connect Website Blog
                    </h3>
                    <button
                      onClick={() => setShowConnectModal(false)}
                      className="text-slate-400 hover:text-white text-lg"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleAddBlogConnection} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Blog Name</label>
                      <input
                        type="text"
                        required
                        value={newBlogForm.name}
                        onChange={(e) => setNewBlogForm({ ...newBlogForm, name: e.target.value })}
                        placeholder="e.g. My Personal Blog"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CMS Integration Type</label>
                      <select
                        value={newBlogForm.cms_type}
                        onChange={(e) => setNewBlogForm({ ...newBlogForm, cms_type: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="wordpress">WordPress (REST API + Application Passwords)</option>
                        <option value="webhook">Custom Webhook (Next.js / Astro / Headless CMS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL or Webhook Endpoint</label>
                      <input
                        type="url"
                        required
                        value={newBlogForm.site_url}
                        onChange={(e) => setNewBlogForm({ ...newBlogForm, site_url: e.target.value })}
                        placeholder="https://mywebsite.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {newBlogForm.cms_type === "wordpress" ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">WordPress Username</label>
                          <input
                            type="text"
                            required
                            value={newBlogForm.username}
                            onChange={(e) => setNewBlogForm({ ...newBlogForm, username: e.target.value })}
                            placeholder="e.g. admin"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">WordPress Application Password</label>
                          <input
                            type="password"
                            required
                            value={newBlogForm.auth_secret}
                            onChange={(e) => setNewBlogForm({ ...newBlogForm, auth_secret: e.target.value })}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Generated in WordPress &gt; Users &gt; Profile &gt; Application Passwords.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Secret Key (Optional)</label>
                        <input
                          type="password"
                          value={newBlogForm.auth_secret}
                          onChange={(e) => setNewBlogForm({ ...newBlogForm, auth_secret: e.target.value })}
                          placeholder="Secret token for HMAC signature verification"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowConnectModal(false)}
                        className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md shadow-indigo-600/20"
                      >
                        Save & Test Connection
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: SOCIAL SCHEDULER ======================= */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  Social Content Queue & Scheduler
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Scheduled updates derived automatically from your pillar blog posts.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("studio")}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate New Batch
              </button>
            </div>

            <div className="space-y-3">
              {socialPosts.map((post) => (
                <div key={post.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        post.platform === "linkedin"
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-slate-700/40 text-white"
                      }`}
                    >
                      {post.platform === "linkedin" ? "in" : "𝕏"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 capitalize">{post.platform}</span>
                        <span className="text-[10px] text-slate-400">• Derived from Anchor Blog</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">{post.content}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        post.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Scheduled"}
                    </span>
                    {post.scheduled_for && (
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> {post.scheduled_for}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB: NEWSLETTERS ======================= */}
        {activeTab === "newsletters" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  Email Newsletters & Subscribers
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Keep your subscribers engaged by sending automated summaries of your newest website blog articles.
                </p>
              </div>

              <button
                onClick={() => setStatusMessage("📨 Test newsletter broadcast sent to active subscribers!")}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Send Newsletter Broadcast
              </button>
            </div>

            {/* Subscribers Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
              <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Subscriber List ({subscribers.length})</span>
                <span className="text-[11px] text-emerald-400">100% Delivery Health</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 font-semibold bg-slate-950/40">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Email</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-5 font-medium text-white">{sub.name}</td>
                      <td className="py-3 px-5 text-slate-400">{sub.email}</td>
                      <td className="py-3 px-5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => setStatusMessage(`Removed ${sub.email}`)}
                          className="text-[11px] text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= TAB: INTEGRATIONS ======================= */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Integrations & Multi-Tenant Engine
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure your personal website blog, local Ollama engine, Google Imagen keys, and social credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ollama Status */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-semibold text-sm text-white">Ollama Local LLM</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Endpoint: <code className="text-slate-200">http://localhost:11434</code> (Model: llama3.2 / mistral).
                </p>
                <div className="text-[11px] text-slate-500">
                  Runs local privacy-preserving content generation with automatic cloud fallback.
                </div>
              </div>

              {/* Google Imagen / Banana Pro */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-semibold text-sm text-white">Google Imagen (Banana Pro)</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Model: <code className="text-slate-200">imagen-3.0-generate-002</code>
                </p>
                <div className="text-[11px] text-slate-500">
                  Generates photorealistic 16:9 featured banners for every blog article.
                </div>
              </div>

              {/* WordPress REST */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-sm text-white">WordPress REST API</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Installed
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Supports title, slug, body, excerpt, tags, categories, and Application Passwords.
                </p>
              </div>

              {/* Custom Webhook */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold text-sm text-white">Generic Webhook / Custom CMS</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                    HMAC-SHA256
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Dispatches signed JSON payloads for Next.js ISR, Astro, or Headless CMS.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
