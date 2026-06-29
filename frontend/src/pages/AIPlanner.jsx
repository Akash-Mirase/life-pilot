import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Textarea } from '../components/ui/index';
import api from '../utils/api';
import { RiRobot2Line, RiSendPlane2Line, RiSparklingLine, RiTimeLine, RiMagicLine, RiAlarmLine, RiRefreshLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const AGENTS = [
  { id: 'planner', label: 'AI Planner', icon: RiRobot2Line, desc: 'Generate full roadmaps & schedules', color: '#7c3aed',
    placeholder: 'E.g. "I want to crack software engineering interviews in 30 days"' },
  { id: 'priority', label: 'Priority Agent', icon: RiSparklingLine, desc: 'Smart priority analysis for your tasks', color: '#06b6d4',
    placeholder: 'Describe your tasks and I\'ll prioritize them for you...' },
  { id: 'procrastination', label: 'Procrastination Agent', icon: RiTimeLine, desc: 'Predict & prevent task delays', color: '#f97316',
    placeholder: 'Tell me about tasks you\'ve been putting off...' },
  { id: 'rescue', label: 'Rescue Agent', icon: RiAlarmLine, desc: 'Emergency plans for tight deadlines', color: '#ef4444',
    placeholder: 'E.g. "My project is due in 6 hours and I\'m 40% done"' },
  { id: 'reflection', label: 'Reflection Agent', icon: RiMagicLine, desc: 'Daily insights & tomorrow\'s plan', color: '#22c55e',
    placeholder: 'Tell me about your day and I\'ll generate insights...' },
];

function MarkdownContent({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h3 key={i} className="text-base font-semibold text-slate-100 mt-3 mb-1" style={{ fontFamily: 'Space Grotesk' }}>{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold gradient-text mt-4 mb-2" style={{ fontFamily: 'Space Grotesk' }}>{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={i} className="flex gap-2 text-sm text-slate-300">
            <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
        if (line.match(/^\d+\./)) return (
          <div key={i} className="flex gap-2 text-sm text-slate-300">
            <span className="text-purple-400 font-medium flex-shrink-0">{line.match(/^\d+/)[0]}.</span>
            <span>{line.replace(/^\d+\./, '').trim()}</span>
          </div>
        );
        if (line.startsWith('**') && line.endsWith('**')) return (
          <p key={i} className="text-sm font-semibold text-slate-100">{line.slice(2, -2)}</p>
        );
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-slate-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export default function AIPlanner() {
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const responseRef = useRef(null);

  useEffect(() => {
    if (responseRef.current) responseRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [response]);

  const runAgent = async () => {
    if (!prompt.trim()) return toast.error('Enter a prompt first');
    setLoading(true);
    setResponse('');

    const userMsg = { role: 'user', content: prompt, agent: activeAgent.id };
    setHistory(p => [...p, userMsg]);

    try {
      const endpoint = activeAgent.id === 'planner' ? '/ai/plan' :
                       activeAgent.id === 'priority' ? '/ai/prioritize' :
                       activeAgent.id === 'procrastination' ? '/ai/procrastination' :
                       activeAgent.id === 'rescue' ? '/ai/rescue' : '/ai/reflection';

      const { data } = await api.post(endpoint, { prompt });
      const result = data.result || data.plan || data.analysis || data.reflection || 'No response generated';
      setResponse(result);
      setHistory(p => [...p, { role: 'assistant', content: result, agent: activeAgent.id }]);
    } catch (e) {
      const err = e.response?.data?.message || 'Agent unavailable. Check your API configuration.';
      setResponse(`❌ ${err}`);
      toast.error('Agent error');
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>AI Agents</h1>
        <p className="text-slate-400 text-sm">Seven specialized agents working for you 24/7</p>
      </div>

      {/* Agent selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {AGENTS.map(agent => {
          const Icon = agent.icon;
          return (
            <button key={agent.id} onClick={() => { setActiveAgent(agent); setResponse(''); }}
              className={`p-3 rounded-xl text-left transition-all ${activeAgent.id === agent.id ? 'ring-2' : 'glass glass-hover'}`}
              style={activeAgent.id === agent.id ? {
                background: `${agent.color}15`,
                border: `1px solid ${agent.color}40`,
                ringColor: agent.color,
                boxShadow: `0 0 20px ${agent.color}20`
              } : {}}>
              <Icon className="text-xl mb-2" style={{ color: agent.color }} />
              <div className="text-xs font-semibold text-slate-200 leading-tight mb-1">{agent.label}</div>
              <div className="text-xs text-slate-500 leading-tight">{agent.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Input panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${activeAgent.color}20` }}>
                <activeAgent.icon style={{ color: activeAgent.color }} className="text-base" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">{activeAgent.label}</div>
                <div className="text-xs text-slate-500">{activeAgent.desc}</div>
              </div>
            </div>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={activeAgent.placeholder}
              rows={6}
              className="mb-3"
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') runAgent(); }}
            />
            <Button onClick={runAgent} loading={loading} icon={<RiSendPlane2Line />} className="w-full justify-center">
              {loading ? 'Thinking...' : 'Run Agent'}
            </Button>
            <p className="text-xs text-slate-600 text-center mt-2">Ctrl+Enter to run</p>
          </Card>

          {/* Quick prompts */}
          <Card>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Prompts</h4>
            <div className="space-y-2">
              {activeAgent.id === 'planner' && [
                'Learn Python in 30 days', 'Prepare for job interview next week', 'Build a SaaS product in 90 days'
              ].map(p => (
                <button key={p} onClick={() => setPrompt(p)}
                  className="w-full text-left text-xs text-slate-400 hover:text-purple-300 py-2 px-3 rounded-lg hover:bg-purple-500/10 transition-all border border-transparent hover:border-purple-500/20">
                  "{p}"
                </button>
              ))}
              {activeAgent.id === 'rescue' && [
                'Project due in 3 hours, 60% complete', 'Exam tomorrow, barely studied', 'Presentation in 2 hours, not prepared'
              ].map(p => (
                <button key={p} onClick={() => setPrompt(p)}
                  className="w-full text-left text-xs text-slate-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                  "{p}"
                </button>
              ))}
              {!['planner', 'rescue'].includes(activeAgent.id) && (
                <p className="text-xs text-slate-600 text-center py-2">Type your own prompt above</p>
              )}
            </div>
          </Card>
        </div>

        {/* Response panel */}
        <div className="lg:col-span-3">
          <Card className="min-h-96">
            <div className="flex items-center gap-2 mb-4">
              <RiSparklingLine className="text-purple-400" />
              <h3 className="font-semibold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>Agent Response</h3>
              {response && (
                <button onClick={() => setResponse('')} className="ml-auto text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                  <RiRefreshLine /> Clear
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${activeAgent.color}15`, border: `1px solid ${activeAgent.color}30` }}>
                      <activeAgent.icon style={{ color: activeAgent.color }} className="text-3xl animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 animate-ping" style={{ borderColor: `${activeAgent.color}30` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-300 text-sm font-medium">{activeAgent.label} is working...</p>
                    <p className="text-slate-500 text-xs mt-1">Analyzing your request with Gemini AI</p>
                  </div>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: activeAgent.color }}
                        animate={{ y: [-4, 4, -4] }} transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }} />
                    ))}
                  </div>
                </motion.div>
              ) : response ? (
                <motion.div key="response" ref={responseRef} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-auto max-h-[600px] pr-1">
                  <MarkdownContent text={response} />
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
                  <activeAgent.icon className="text-4xl text-slate-700" />
                  <p className="text-slate-500 text-sm">Enter a prompt and run the agent</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.filter(h => h.role === 'user').slice(-5).map((h, i) => (
                  <button key={i} onClick={() => setPrompt(h.content)}
                    className="w-full text-left text-xs text-slate-400 py-2 px-3 rounded-xl glass glass-hover truncate">
                    {h.content}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
