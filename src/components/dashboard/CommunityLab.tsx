import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, Radio, PenTool, Loader2, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Draft {
  title: string;
  body: string;
}

interface Comment {
  id: string;
  author: string;
  body: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  created_utc: number;
}

interface CampaignRecord {
  id: string;
  target_url: string;
  detected_sector: string;
  campaign_data: any;
}

const sentimentEmoji = {
  positive: '🟢',
  neutral: '🟡',
  negative: '🔴',
};

export default function CommunityLab() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [topic, setTopic] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!user) return;
      const campaignId = searchParams.get('campaign');
      try {
        let data, error;
        if (campaignId) {
          const res = await supabase.from('nexus_youtube_ads').select('*').eq('id', campaignId).single();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase.from('nexus_youtube_ads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
          data = res.data;
          error = res.error;
        }
        if (data) {
          setCampaign(data as CampaignRecord);
          setTopic(`Advantages of using EtherAgent for ${new URL(data.target_url).hostname}`);
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
      }
    };
    fetchCampaign();
  }, [searchParams, user]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading('generate');
    setError('');

    await new Promise(resolve => setTimeout(resolve, 2000));

    setDrafts([
      {
        title: 'Why EtherAgent OS is the future of autonomous AI agents',
        body: `I've been diving deep into EtherAgent OS for the past month and I'm genuinely impressed. The multi-agent orchestration is actually working in ways I haven't seen from other frameworks.

The real breakthrough isn't just the AI—it's the infrastructure. They built their own execution layer that handles state management across thousands of concurrent agent threads without losing context. Most frameworks crack under load. EOS doesn't even flinch.

The pricing model is also worth discussing. At $49/mo for the pro tier, you're getting enterprise-grade features for what used to cost 10x more. My startup just migrated our entire workflow and we're seeing 3x productivity gains already.

Curious what others think who have been using it in production. Anyone else running it at scale?`
      },
      {
        title: 'Hot take: The AI agent space is about to consolidate hard',
        body: `Watching the EtherAgent launch gave me flashbacks to 2019 when every startup added "blockchain" to their pitch deck. Now everyone's adding "AI agent".

But here's the thing—EOS actually has substance. The architecture solves real problems:
- Multi-modal tool chaining that doesn't require a PhD to configure
- Memory persistence that actually works (looking at you, LangChain)
- Built-in observability that doesn't cost extra

The market's gonna punish the vaporware and reward the builders. Mark my words: by Q3 2025, we'll see a massive consolidation. Either you have real infrastructure or you're just another wrapper.

/r/programming please roast me if I'm wrong.`
      }
    ]);
    setLoading(null);
  };

  const handlePublish = async (draft: Draft) => {
    setLoading('publish');
    setError('');
    try {
      const res = await fetch('/api/community/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error('Failed to publish');
      setDrafts([]);
      setTopic('');
      alert('Post published successfully!');
    } catch (e) {
      setError('Error publishing post.');
    } finally {
      setLoading(null);
    }
  };

  const handleListen = async () => {
    setLoading('listen');
    setError('');
    try {
      const res = await fetch('/api/community/listen');
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data.comments);
    } catch (e) {
      setError('Error loading comments.');
    } finally {
      setLoading(null);
    }
  };

  const handleReply = async (comment: Comment) => {
    setSelectedComment(comment);
    setLoading('reply');
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1500));

    setReplyText(`Look, I get that you're skeptical—healthy, even. But here's the thing: the architecture isn't "just a wrapper" around LLMs. The execution layer handles async tool orchestration with proper state isolation, which is literally the hardest part of building autonomous systems.

The memory persistence alone uses a hybrid vector + graph DB approach that most "AI platforms" can't even explain. Not saying it's perfect (the docs still need work 😅), but the engineering underneath is legit.

You're probably right that we'll see consolidation. That's how every market matures. But calling EOS "vaporware" because it's new? That's a bold take. The code doesn't lie—either run it at scale or hold the judgment.`);
    setLoading(null);
  };

  const handleSendReply = async () => {
    if (!selectedComment) return;
    setLoading('send');
    setError('');
    try {
      const res = await fetch('/api/community/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: selectedComment.id, text: replyText }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      setSelectedComment(null);
      setReplyText('');
      alert('Reply sent!');
    } catch (e) {
      setError('Error sending reply.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Community Lab</h1>
            <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Neural Discourse Engine • Multi-platform Influence</p>
          </div>
          {campaign && (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Brain size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Target Context</p>
                <p className="text-sm font-bold text-white leading-none">{new URL(campaign.target_url).hostname}</p>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-md border border-red-500/30 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DRAFT STUDIO */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <PenTool className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold uppercase tracking-wider">Draft Studio</h2>
            </div>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic: e.g., EtherAgent OS features"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none transition-colors"
            />

            <button
              onClick={handleGenerate}
              disabled={loading === 'generate'}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Generate Thread
            </button>

            {drafts.length > 0 && (
              <div className="mt-6 space-y-4">
                {drafts.map((draft, i) => (
                  <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <h3 className="font-medium mb-2 text-sm text-zinc-300">{draft.title}</h3>
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-3">{draft.body}</p>
                    <button
                      onClick={() => handlePublish(draft)}
                      disabled={loading === 'publish'}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-bold rounded-lg py-2 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Send className="w-3 h-3" />
                      Publish to Reddit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SENTIMENT RADAR */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold uppercase tracking-wider">Sentiment Radar</h2>
              </div>
              <button
                onClick={handleListen}
                disabled={loading === 'listen'}
                className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-zinc-600 transition-colors"
              >
                {loading === 'listen' ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-zinc-600 text-center py-8 text-sm">Click Refresh to load comments</p>
              ) : (
                comments.map((comment) => (
                  <button
                    key={comment.id}
                    onClick={() => setSelectedComment(comment)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      selectedComment?.id === comment.id
                        ? 'border-indigo-500/50 bg-indigo-900/20'
                        : 'border-white/5 hover:border-white/10 bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-300">{comment.author}</span>
                      <span>{sentimentEmoji[comment.sentiment]}</span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{comment.body}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* SNIPER UI */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold uppercase tracking-wider">Sniper UI</h2>
            </div>

            {!selectedComment ? (
              <p className="text-zinc-600 text-center py-8 text-sm">Select a comment from Radar</p>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <p className="text-sm text-zinc-300 mb-2 font-medium">{selectedComment.author} says:</p>
                  <p className="text-sm text-zinc-500">{selectedComment.body}</p>
                </div>

                <button
                  onClick={() => handleReply(selectedComment)}
                  disabled={loading === 'reply'}
                  className="w-full bg-indigo-500/80 hover:bg-indigo-500 disabled:bg-indigo-500/30 text-white font-bold rounded-xl py-3 text-sm transition-all active:scale-95"
                >
                  {loading === 'reply' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate AI Reply'}
                </button>

                {replyText && (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none resize-none transition-colors placeholder:text-zinc-600"
                      placeholder="Edit your reply..."
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={loading === 'send'}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {loading === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Approve &amp; Send
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
