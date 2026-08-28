'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ChevronLeft } from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const gaugeNumRef = useRef<HTMLDivElement>(null);
  const gaugeCircleRef = useRef<SVGCircleElement>(null);
  const scoreBigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;

    const onMove = (e: PointerEvent) => {
      if (!scene || !card) return;
      const r = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translate(-50%,-50%) rotateY(${-18 + px * 22}deg) rotateX(${8 - py * 18}deg)`;
    };
    const onLeave = () => {
      if (!card) return;
      card.style.transform = 'translate(-50%,-50%) rotateY(-18deg) rotateX(8deg)';
    };

    scene?.addEventListener('pointermove', onMove);
    scene?.addEventListener('pointerleave', onLeave);

    const revealEls = Array.from(document.querySelectorAll('.landing .reveal'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));

    // gauge + score counters
    const animateCount = (el: HTMLElement, target: number) => {
      let cur = 0;
      const step = () => {
        cur += (target - cur) * 0.09 + 0.4;
        if (cur >= target) cur = target;
        el.childNodes[0].nodeValue = String(Math.round(cur));
        if (cur < target) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const gTimer = setTimeout(() => {
      const gn = gaugeNumRef.current;
      const gc = gaugeCircleRef.current;
      const sb = scoreBigRef.current;
      if (gn) animateCount(gn, 87);
      if (gc) {
        gc.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)';
        gc.style.strokeDashoffset = String(314 - 314 * 0.87);
      }
      if (sb) animateCount(sb, 87);
    }, 500);

    // animate bars when in view
    const bars = Array.from(document.querySelectorAll('.landing [data-w]')) as HTMLElement[];
    const barIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const target = e.target.getAttribute('data-w');
            if (target) (e.target as HTMLElement).style.width = target;
            barIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((b) => barIo.observe(b));

    return () => {
      scene?.removeEventListener('pointermove', onMove);
      scene?.removeEventListener('pointerleave', onLeave);
      io.disconnect();
      barIo.disconnect();
      clearTimeout(gTimer);
    };
  }, []);

  const pipeline = [
    { num: '01', title: 'Parse', desc: 'PDF, DOCX, TXT, PNG or JPEG in — OCR and text extraction run locally, offline.' },
    { num: '02', title: 'Extract', desc: 'The job description is broken into required vs. preferred keywords, auto-categorized.' },
    { num: '03', title: 'Score', desc: 'TF-IDF cosine similarity blends with AI semantic scoring for a weighted fit %.' },
    { num: '04', title: 'De-bias', desc: 'Names, contacts and schools are anonymized, then re-scored to check the delta.' },
    { num: '05', title: 'Report', desc: 'Evidence, confidence and suggestions are exported as PDF or CSV.' },
  ];

  return (
    <div className="landing">
      <div className="bg-grid" aria-hidden></div>
      <div className="bg-glow" aria-hidden></div>

      <nav>
        <div className="wrap">
          <Link href="/app" className="logo">
            <span className="logo-mark">AI</span> RESUME_SCREENER
          </Link>
          <div className="navlinks">
            <a href="#pipeline">Pipeline</a>
            <a href="#modes">Modes</a>
            <a href="#parsing">Features</a>
            <a href="#bias">Fairness</a>
            <a href="#stack">Stack</a>
          </div>
          <Link href="/app" className="nav-cta">Get your fit score →</Link>
        </div>
      </nav>

      <header className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow"><span className="dot"></span> Hybrid local + AI scoring</span>
          <h1>Know your fit score <span className="accent">before</span> you hit apply.</h1>
          <p className="lede">
            A resume screener that reads a job description like a recruiter would — extracting, categorizing, and weighing every
            keyword — then scores any resume against it with <b>evidence, confidence, and zero silent failures.</b>
          </p>
          <div className="hero-actions">
            <Link href="/app" className="btn btn-primary">Score a resume <ArrowRight className="h-3.5 w-3.5" /></Link>
            <a href="#pipeline" className="btn btn-ghost">See the pipeline ↓</a>
          </div>
          <div className="hero-stats">
            <div className="hstat"><div className="n"><span className="u">40</span>/<span className="u">60</span></div><div className="l">local / AI blend</div></div>
            <div className="hstat"><div className="n">10<span className="u">/10</span></div><div className="l">vitest tests passing</div></div>
            <div className="hstat"><div className="n">20</div><div className="l">candidates per batch</div></div>
            <div className="hstat"><div className="n">0</div><div className="l">lint errors</div></div>
          </div>
        </div>

        <div className="scene" id="scene" ref={sceneRef}>
          <div className="orbit-ring" aria-hidden></div>
          <div className="card3d" id="card3d" ref={cardRef}>
            <div className="resume-face">
              <div className="rname"></div>
              <div className="rrole"></div>
              <div className="rline" style={{ width: '88%' }}></div>
              <div className="rline hit" style={{ width: '72%' }}></div>
              <div className="rline" style={{ width: '94%' }}></div>
              <div className="rline hit2" style={{ width: '64%' }}></div>
              <div className="rline" style={{ width: '80%' }}></div>
              <div className="rline hit" style={{ width: '58%' }}></div>
              <div className="rline" style={{ width: '90%' }}></div>
              <div className="rline" style={{ width: '70%' }}></div>
              <div className="rline hit2" style={{ width: '82%' }}></div>
              <div className="rline" style={{ width: '60%' }}></div>
              <div className="scanbeam" aria-hidden></div>
            </div>
            <div className="chip3d matched" style={{ top: '14%', left: '-58px' }}><Check className="h-3 w-3" /> React</div>
            <div className="chip3d matched" style={{ top: '46%', right: '-70px', animationDelay: '.6s' }}><Check className="h-3 w-3" /> 5+ yrs</div>
            <div className="chip3d missing" style={{ top: '72%', left: '-64px', animationDelay: '1.2s' }}>Kubernetes</div>
            <div className="chip3d matched" style={{ top: '88%', right: '-56px', animationDelay: '1.8s' }}><Check className="h-3 w-3" /> AWS</div>
            <div className="gauge-wrap">
              <svg width="118" height="118" viewBox="0 0 118 118">
                <circle cx="59" cy="59" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                <circle
                  ref={gaugeCircleRef}
                  cx="59"
                  cy="59"
                  r="50"
                  fill="none"
                  stroke="url(#g1)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset="314"
                />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff9142" />
                    <stop offset="100%" stopColor="#5eead4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="gauge-num" ref={gaugeNumRef}>0<span>%</span></div>
            </div>
          </div>
        </div>
      </header>

      <section id="pipeline">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">01 — The pipeline</span>
            <h2>Five stages, start to finish</h2>
            <p>Every score traces back through the same deterministic chain — parse, extract, score, de-bias, report — so you always know why a number is what it is.</p>
          </div>
          <div className="pipeline">
            {pipeline.map((s) => (
              <div className="pstep reveal" key={s.num}>
                <div className="pnum">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modes">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">02 — Two operating modes</span>
            <h2>Built for both sides of the desk</h2>
            <p>The same scoring engine, pointed in either direction.</p>
          </div>
          <div className="modes">
            <div className="mode-card reveal">
              <span className="mode-tag">Job Seeker</span>
              <h3>Score your own resume</h3>
              <p>Upload one resume, paste a job description, and see exactly where you match — and where you don&apos;t — before you apply.</p>
              <ul className="mode-list">
                <li>Auto re-scores the instant a new resume or keyword lands</li>
                <li>Per-category breakdown with matched, missing, and evidence</li>
                <li>Concrete suggestions like <em>&quot;Add React to skills&quot;</em></li>
              </ul>
            </div>
            <div className="mode-card reveal">
              <span className="mode-tag">Recruiter</span>
              <h3>Bulk-rank up to 20 resumes</h3>
              <p>Drop a stack of candidate resumes against the same job description and get a ranked leaderboard in seconds.</p>
              <ul className="mode-list">
                <li>Fast (instant local) vs. Deep AI scoring toggle</li>
                <li>Leaderboard ranked by fit %, expandable per candidate</li>
                <li>One-click CSV export of the full ranking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="parsing">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">03 — Resume parsing</span>
            <h2>Reads almost anything you throw at it</h2>
            <p>Every format is parsed locally — nothing leaves the browser until it&apos;s actual text.</p>
          </div>

          <div className="feature-row reveal">
            <div className="feature-text">
              <span className="ftag">Ingestion</span>
              <h3>Multi-format upload, server-validated</h3>
              <ul>
                <li>Accepts <b>PDF, DOCX, TXT, PNG, JPEG</b> up to 10MB, validated server-side</li>
                <li>OCR on images via <code>Tesseract.js</code> — runs in a local worker, works fully offline</li>
                <li>PDF text extraction via a local <code>pdfjs</code> build, no CDN round-trip</li>
                <li>DOCX parsed with <code>Mammoth</code>; plain text is read directly</li>
                <li>Auto-re-scores the moment a new resume or keyword set arrives</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-bar"><span></span><span></span><span></span><div className="lbl">upload.tsx</div></div>
              <div className="panel-body">
                <div className="drop">
                  <div className="ic"><ChevronLeft className="h-3 w-3 inline -rotate-90" /> drop resume or click to browse</div>
                  <div className="fmt-row">
                    <span className="fmt">.PDF</span><span className="fmt">.DOCX</span><span className="fmt">.TXT</span><span className="fmt">.PNG</span><span className="fmt">.JPEG</span>
                  </div>
                </div>
                <ul className="checklist">
                  <li><span className="ok"><Check className="h-3 w-3" /></span> jordan_ramirez_resume.pdf — 412KB</li>
                  <li><span className="ok"><Check className="h-3 w-3" /></span> pdfjs text layer extracted</li>
                  <li><span className="ok"><Check className="h-3 w-3" /></span> OCR worker idle — no image fallback needed</li>
                  <li><span className="ok"><Check className="h-3 w-3" /></span> re-scored against current keyword set</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="feature-row rev reveal">
            <div className="feature-text">
              <span className="ftag">Keyword intelligence</span>
              <h3>The job description becomes structured data</h3>
              <ul>
                <li>AI keyword extraction from the JD via <code>Groq · gpt-oss-120b</code></li>
                <li>Auto-categorized into <b>Technical, Experience, Education, Soft Skills</b></li>
                <li>Importance tagging: <b>required</b> vs. <b>preferred</b> (nice-to-have) per keyword</li>
                <li>Fully editable — rename, re-categorize, toggle required/preferred, add or remove</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-bar"><span></span><span></span><span></span><div className="lbl">keywords.tsx</div></div>
              <div className="panel-body">
                <div className="kw-cols">
                  <div>
                    <div className="kw-col-title">Technical</div>
                    <div className="kw-chip-row">
                      <span className="kw-chip req">TypeScript</span>
                      <span className="kw-chip req">React</span>
                      <span className="kw-chip pref">GraphQL</span>
                    </div>
                  </div>
                  <div>
                    <div className="kw-col-title">Experience</div>
                    <div className="kw-chip-row">
                      <span className="kw-chip req">5+ years</span>
                      <span className="kw-chip pref">Fintech</span>
                    </div>
                  </div>
                  <div>
                    <div className="kw-col-title">Education</div>
                    <div className="kw-chip-row">
                      <span className="kw-chip pref">BS Computer Science</span>
                    </div>
                  </div>
                  <div>
                    <div className="kw-col-title">Soft skills</div>
                    <div className="kw-chip-row">
                      <span className="kw-chip pref">Cross-functional</span>
                      <span className="kw-chip pref">Mentorship</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-row reveal">
            <div className="feature-text">
              <span className="ftag">Scoring engine — hybrid</span>
              <h3>Local math, checked by AI reasoning</h3>
              <ul>
                <li><b>Local TF-IDF:</b> cosine similarity, alias handling (<code>JS≈JavaScript</code>), stemming, sentence-level evidence</li>
                <li><b>AI scoring</b> via Groq — semantic understanding, evidence quotes, confidence reasoning</li>
                <li>Blended <b>40% local / 60% AI</b>, configurable via environment variables</li>
                <li>Required keywords weighted heavier than preferred ones</li>
                <li>Confidence level (high / medium / low) with plain-language reasoning</li>
                <li>Never fails silently — AI outages surface a visible warning banner and fall back to local scoring</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-bar"><span></span><span></span><span></span><div className="lbl">score-result.tsx</div></div>
              <div className="panel-body">
                <div className="score-top">
                  <div className="score-big" ref={scoreBigRef}>0<span className="pct">%</span></div>
                  <div className="conf-badge">High confidence</div>
                </div>
                <div className="bar-row"><div className="bl"><span>Technical</span><span>9/10 matched</span></div><div className="bar-track"><div className="bar-fill" data-w="90%"></div></div></div>
                <div className="bar-row"><div className="bl"><span>Experience</span><span>4/5 matched</span></div><div className="bar-track"><div className="bar-fill" data-w="80%"></div></div></div>
                <div className="bar-row"><div className="bl"><span>Education</span><span>2/2 matched</span></div><div className="bar-track"><div className="bar-fill" data-w="100%"></div></div></div>
                <div className="bar-row"><div className="bl"><span>Soft skills</span><span>3/6 matched</span></div><div className="bar-track"><div className="bar-fill" data-w="50%"></div></div></div>
                <div className="blend-note">40% local TF-IDF · 60% AI semantic — suggestion: &quot;Add Kubernetes to skills&quot;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="bias">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">04 — Bias / fairness check</span>
            <h2>Scores the resume, not the name on it</h2>
            <p>Every resume is re-scored anonymized to see whether identity leaks into the fit score.</p>
          </div>
          <div className="feature-row reveal">
            <div className="feature-text">
              <span className="ftag">Anonymization</span>
              <h3>Strips identity, keeps substance</h3>
              <ul>
                <li>Anonymizes name, email, phone (incl. international formats), URLs, school names</li>
                <li>Two modes: <b>Fast</b> (keyword-only) vs. <b>Deep AI</b> (AI-assisted diff)</li>
                <li>Re-scores original vs. anonymized, reports delta and impact — negligible, moderate, or significant</li>
                <li>Flags any keyword whose match status flipped after anonymization</li>
                <li>Full preview of the anonymized resume before you trust the number</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-bar"><span></span><span></span><span></span><div className="lbl">fairness-diff.tsx</div></div>
              <div className="panel-body">
                <div className="diff-cols">
                  <div className="diff-box">
                    <div className="dt">Original</div>
                    <div className="diff-line">Jordan Ramirez</div>
                    <div className="diff-line">jordan@ramirez.dev</div>
                    <div className="diff-line">Stanford University</div>
                  </div>
                  <div className="diff-box">
                    <div className="dt">Anonymized</div>
                    <div className="diff-line"><span className="redact">████ ███████</span></div>
                    <div className="diff-line"><span className="redact">████████████</span></div>
                    <div className="diff-line"><span className="redact">██████████████</span></div>
                  </div>
                </div>
                <div className="delta-badge">Δ fit score: −1.2% — negligible impact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recruiter">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">05 — Recruiter bulk mode</span>
            <h2>One job description, twenty candidates, one leaderboard</h2>
            <p>Drop a stack of resumes and rank them against the same criteria in one pass.</p>
          </div>
          <div className="feature-row rev reveal">
            <div className="feature-text">
              <span className="ftag">Bulk ranking</span>
              <h3>Sorted by fit, expandable per candidate</h3>
              <ul>
                <li>Bulk dropzone — up to 20 resumes at once</li>
                <li>Fast (instant local) vs. Deep AI scoring toggle, same as single mode</li>
                <li>Leaderboard ranked by fit %, each row expands into full per-candidate detail</li>
                <li>CSV export of the entire ranked list</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-bar"><span></span><span></span><span></span><div className="lbl">leaderboard.tsx</div></div>
              <div className="panel-body">
                <div className="lb-row"><div className="lb-rank">01</div><div className="lb-name">A. Chen<span className="sub">Senior Frontend Engineer</span><div className="lb-bar-track"><div className="lb-bar-fill" data-w="94%"></div></div></div><div className="lb-pct">94%</div></div>
                <div className="lb-row"><div className="lb-rank">02</div><div className="lb-name">J. Ramirez<span className="sub">Frontend Engineer II</span><div className="lb-bar-track"><div className="lb-bar-fill" data-w="87%"></div></div></div><div className="lb-pct">87%</div></div>
                <div className="lb-row"><div className="lb-rank">03</div><div className="lb-name">P. Okafor<span className="sub">Full-Stack Engineer</span><div className="lb-bar-track"><div className="lb-bar-fill" data-w="79%"></div></div></div><div className="lb-pct">79%</div></div>
                <div className="lb-row"><div className="lb-rank">04</div><div className="lb-name">M. Song<span className="sub">Software Engineer</span><div className="lb-bar-track"><div className="lb-bar-fill" data-w="63%"></div></div></div><div className="lb-pct">63%</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stack">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">06 — Tech stack &amp; guardrails</span>
            <h2>Built to fail loudly, not silently</h2>
            <p>Every AI call is optional infrastructure, not a dependency the app collapses without.</p>
          </div>
          <div className="stack-strip reveal">
            <div className="stack-pill"><span className="dot"></span><b>Next.js 16.3.3</b> (Turbopack)</div>
            <div className="stack-pill"><span className="dot"></span>TypeScript</div>
            <div className="stack-pill"><span className="dot"></span>Tailwind CSS</div>
            <div className="stack-pill"><span className="dot"></span>shadcn-style Radix UI</div>
            <div className="stack-pill"><span className="dot"></span>Groq inference</div>
            <div className="stack-pill"><span className="dot"></span>Vitest</div>
          </div>
          <div className="guardrails reveal">
            <div className="grail"><div className="gt">npm test</div><div className="gd">10 vitest unit tests covering scoring and anonymization logic.</div></div>
            <div className="grail"><div className="gt">npm run lint / build</div><div className="gd">0 errors, 0 warnings on lint; build passes clean every time.</div></div>
            <div className="grail"><div className="gt">Server-validated routes</div><div className="gd">Groq calls lazy-initialize; every API route validates input server-side.</div></div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <h2>See your fit score in under a minute.</h2>
          <p>No sign-up walls, no hidden weighting — just a resume, a job description, and a number you can trust.</p>
          <div className="hero-actions">
            <Link href="/app" className="btn btn-primary">Score my resume <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link href="/app?mode=recruiter" className="btn btn-ghost">Try recruiter mode</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="f-left">AI RESUME SCREENER — hybrid local + AI fit scoring</div>
          <div className="f-right">
            <span>Next.js · TypeScript · Groq</span>
            <span>Built with vitest guardrails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}