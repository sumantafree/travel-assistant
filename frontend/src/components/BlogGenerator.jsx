import { useState } from 'react'
import { generateBlog } from '../lib/api.js'
import ReactMarkdown from 'react-markdown'

export default function BlogGenerator() {
  const [destination, setDestination] = useState('')
  const [details, setDetails] = useState('')
  const [save, setSave] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('blog')
  const [copied, setCopied] = useState('')

  const QUICK_DEST = ['Darjeeling', 'Dooars', 'Mandarmani', 'Purulia', 'Sikkim', 'Bishnupur']

  const submit = async () => {
    if (!destination.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await generateBlog(destination, details, save)
      if (res.data.error) throw new Error(res.data.error)
      setResult(res.data)
    } catch (err) {
      setError(err.message || 'Failed to generate blog.')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const CopyBtn = ({ text, id }) => (
    <button className="copy-btn" onClick={() => copy(text, id)}>
      {copied === id ? '✅ Copied!' : '📋 Copy'}
    </button>
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1>✍️ Blog Generator</h1>
        <p>Generate SEO-optimized travel blogs, Instagram captions, hashtags & YouTube scripts instantly</p>
      </div>

      <div className="card mb-24">
        <div className="form-group">
          <label className="form-label">Destination</label>
          <input className="form-input" placeholder="e.g. Darjeeling, West Bengal" value={destination} onChange={e => setDestination(e.target.value)} />
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'16px'}}>
          {QUICK_DEST.map(d => (
            <button key={d} className="btn btn-outline btn-sm" onClick={() => setDestination(d)}>{d}</button>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Extra Details (optional)</label>
          <textarea className="form-textarea" style={{minHeight:'70px'}} placeholder="e.g. 3-day solo trip, visited in October, loved tea gardens and toy train" value={details} onChange={e => setDetails(e.target.value)} />
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
          <label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',cursor:'pointer'}}>
            <input type="checkbox" checked={save} onChange={e => setSave(e.target.checked)} />
            Save to My Blogs
          </label>
          <button className="btn btn-accent btn-lg" onClick={submit} disabled={loading || !destination.trim()}>
            {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}></div> Generating...</> : '✍️ Generate Content'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="loading-box">
          <div className="spinner" style={{width:36,height:36,borderWidth:3}}></div>
          <p>Writing your blog post, captions & scripts...</p>
          <p style={{fontSize:'12px'}}>This takes 15-25 seconds</p>
        </div>
      )}

      {result && !result.error && (
        <div>
          {/* SEO Summary */}
          <div className="card mb-20">
            <div className="flex-between mb-12">
              <div className="card-title">📝 {result.title}</div>
              <CopyBtn text={result.title} id="title" />
            </div>
            <div style={{fontSize:'13px',color:'#64748B',marginBottom:'12px'}}>{result.meta_description}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {(result.keywords || []).map((k, i) => <span key={i} className="badge badge-blue">{k}</span>)}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:'#F1F5F9',borderRadius:'10px',padding:'4px'}}>
            {['blog','instagram','youtube','reels'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{flex:1,padding:'8px',border:'none',cursor:'pointer',borderRadius:'8px',fontWeight:600,fontSize:'13px',
                  background:tab===t?'white':'transparent',
                  color:tab===t?'#10B981':'#64748B',
                  boxShadow:tab===t?'0 1px 3px rgba(0,0,0,.1)':'none'}}>
                {t==='blog'?'📰 Blog':t==='instagram'?'📸 Instagram':t==='youtube'?'▶️ YouTube':'🎬 Reels'}
              </button>
            ))}
          </div>

          {tab === 'blog' && (
            <div className="card">
              <div className="flex-between mb-16">
                <div className="card-title">Full Blog Post</div>
                <CopyBtn text={result.content} id="blog" />
              </div>
              <div className="blog-content">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {tab === 'instagram' && (
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div className="social-box">
                <div className="flex-between mb-8">
                  <h4>📸 Instagram Caption</h4>
                  <CopyBtn text={result.instagram_caption} id="ig" />
                </div>
                <div style={{fontSize:'14px',lineHeight:'1.7',whiteSpace:'pre-line'}}>{result.instagram_caption}</div>
              </div>
              <div className="social-box">
                <div className="flex-between mb-8">
                  <h4>#️⃣ Hashtags</h4>
                  <CopyBtn text={(result.hashtags||[]).join(' ')} id="tags" />
                </div>
                <div>{(result.hashtags||[]).map((h, i) => <span key={i} className="hashtag">{h}</span>)}</div>
              </div>
            </div>
          )}

          {tab === 'youtube' && (
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div className="social-box">
                <div className="flex-between mb-8">
                  <h4>▶️ YouTube Title</h4>
                  <CopyBtn text={result.youtube_title} id="ytt" />
                </div>
                <div style={{fontSize:'15px',fontWeight:700}}>{result.youtube_title}</div>
              </div>
              <div className="social-box">
                <div className="flex-between mb-8">
                  <h4>📋 YouTube Description</h4>
                  <CopyBtn text={result.youtube_description} id="ytd" />
                </div>
                <div style={{fontSize:'13.5px',lineHeight:'1.7',whiteSpace:'pre-line'}}>{result.youtube_description}</div>
              </div>
            </div>
          )}

          {tab === 'reels' && (
            <div className="card">
              <div className="card-title mb-12">🎬 Reel / Short Video Ideas</div>
              {(result.reel_ideas || []).map((idea, i) => (
                <div key={i} style={{display:'flex',gap:'12px',padding:'12px',background:'#F8FAFC',borderRadius:'8px',marginBottom:'8px'}}>
                  <span style={{background:'#F97316',color:'white',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700,flexShrink:0}}>Reel {i+1}</span>
                  <span style={{fontSize:'13.5px'}}>{idea}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
