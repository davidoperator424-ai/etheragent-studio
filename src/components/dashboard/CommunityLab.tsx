import { useState } from 'react';
import { MessageSquare, Send, Radio, PenTool, Loader2 } from 'lucide-react';

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

const sentimentEmoji = {
  positive: '🟢',
  neutral: '🟡',
  negative: '🔴',
};

export default function CommunityLab() {
  const [topic, setTopic] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Community Lab</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DRAFT STUDIO */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <PenTool className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Draft Studio</h2>
            </div>
            
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic: e.g., EtherAgent OS features"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 mb-4 focus:border-blue-500 focus:outline-none"
            />
            
            <button
              onClick={handleGenerate}
              disabled={loading === 'generate'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg py-3 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Generate Thread
            </button>

            {drafts.length > 0 && (
              <div className="mt-6 space-y-4">
                {drafts.map((draft, i) => (
                  <div key={i} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                    <h3 className="font-medium mb-2 text-sm text-neutral-300">{draft.title}</h3>
                    <p className="text-xs text-neutral-400 mb-3 line-clamp-3">{draft.body}</p>
                    <button
                      onClick={() => handlePublish(draft)}
                      disabled={loading === 'publish'}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded py-2 text-sm flex items-center justify-center gap-2"
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
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Sentiment Radar</h2>
              </div>
              <button
                onClick={handleListen}
                disabled={loading === 'listen'}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:text-neutral-500"
              >
                {loading === 'listen' ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">Click Refresh to load comments</p>
              ) : (
                comments.map((comment) => (
                  <button
                    key={comment.id}
                    onClick={() => setSelectedComment(comment)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedComment?.id === comment.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-300">{comment.author}</span>
                      <span>{sentimentEmoji[comment.sentiment]}</span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">{comment.body}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* SNIPER UI */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold">Sniper UI</h2>
            </div>

            {!selectedComment ? (
              <p className="text-neutral-500 text-center py-8">Select a comment from Radar</p>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                  <p className="text-sm text-neutral-300 mb-2 font-medium">{selectedComment.author} says:</p>
                  <p className="text-sm text-neutral-400">{selectedComment.body}</p>
                </div>

                <button
                  onClick={() => handleReply(selectedComment)}
                  disabled={loading === 'reply'}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-lg py-2 text-sm"
                >
                  {loading === 'reply' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate AI Reply'}
                </button>

                {replyText && (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-orange-500 focus:outline-none resize-none"
                      placeholder="Edit your reply..."
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={loading === 'send'}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 rounded-lg py-3 font-medium flex items-center justify-center gap-2"
                    >
                      {loading === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Approve & Send
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