<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rishabh Pal</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0d1117; color: #e6edf3; min-height: 100vh; padding: 48px 0 80px; }
  .container { max-width: 680px; margin: 0 auto; padding: 0 24px; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .header { margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #21262d; }
  .terminal-line { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #3fb950; margin-bottom: 14px; letter-spacing: 0.02em; }
  .terminal-line .prompt { color: #58a6ff; }
  .terminal-line .at { color: #7d8590; }
  .name { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 500; color: #e6edf3; letter-spacing: -0.02em; margin-bottom: 8px; }
  .role { font-size: 14px; color: #7d8590; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace; }
  .role .accent { color: #58a6ff; }
  .bio { font-size: 15px; color: #8d96a0; line-height: 1.7; max-width: 560px; margin-bottom: 20px; }
  .links { display: flex; gap: 20px; flex-wrap: wrap; }
  .link { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #58a6ff; text-decoration: none; font-family: 'JetBrains Mono', monospace; }
  .link:hover { color: #79c0ff; text-decoration: underline; }
  .link svg { width: 14px; height: 14px; flex-shrink: 0; }
  .section { margin-bottom: 40px; }
  .section-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #3fb950; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
  .project { padding: 18px 0; border-bottom: 1px solid #21262d; }
  .project:last-child { border-bottom: none; }
  .project-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .project-name { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 500; color: #58a6ff; text-decoration: none; }
  .project-name:hover { color: #79c0ff; text-decoration: underline; }
  .project-repo { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #484f58; white-space: nowrap; padding-top: 3px; }
  .project-desc { font-size: 14px; color: #8d96a0; line-height: 1.65; margin-bottom: 12px; }
  .tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; background: #161b22; border: 1px solid #30363d; color: #8b949e; padding: 3px 8px; border-radius: 20px; }
  .tag.lang { color: #e3b341; border-color: #e3b34130; }
  .tag.ai { color: #bc8cff; border-color: #bc8cff30; }
  .tag.db { color: #3fb950; border-color: #3fb95030; }
  .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .skill-row { display: flex; padding: 10px 0; border-bottom: 1px solid #21262d; gap: 12px; align-items: flex-start; }
  .skill-row:nth-child(odd) { padding-right: 24px; }
  .skill-row:nth-child(even) { padding-left: 24px; border-left: 1px solid #21262d; }
  .skill-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #484f58; min-width: 64px; padding-top: 1px; flex-shrink: 0; }
  .skill-value { font-size: 13px; color: #8d96a0; line-height: 1.5; }
  .achievements { display: flex; flex-direction: column; gap: 10px; }
  .achievement { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #21262d; }
  .achievement:last-child { border-bottom: none; }
  .ach-icon { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e3b341; min-width: 16px; padding-top: 2px; }
  .ach-text { font-size: 14px; color: #8d96a0; line-height: 1.5; }
  .ach-text strong { color: #e6edf3; font-weight: 500; }
  .edu { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .edu-name { font-size: 14px; color: #e6edf3; font-weight: 500; margin-bottom: 4px; }
  .edu-sub { font-size: 13px; color: #7d8590; }
  .edu-cgpa { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #3fb950; white-space: nowrap; text-align: right; }
  .edu-year { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #484f58; text-align: right; margin-top: 4px; }
  .cursor { display: inline-block; width: 8px; height: 14px; background: #3fb950; margin-left: 2px; vertical-align: middle; animation: blink 1s step-end infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .intern-block { display: flex; justify-content: space-between; align-items: flex-start; }
  .intern-role { font-size: 14px; font-weight: 500; color: #e6edf3; margin-bottom: 4px; }
  .intern-company { font-size: 13px; color: #58a6ff; margin-bottom: 8px; }
  .intern-date { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #484f58; text-align: right; }
  .intern-desc { font-size: 14px; color: #8d96a0; line-height: 1.65; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="terminal-line">
      <span class="prompt">rishabh</span><span class="at">@github</span>:~$<span class="cursor"></span>
    </div>
    <h1 class="name">Rishabh Pal</h1>
    <p class="role">CS undergrad &middot; <span class="accent">B.Tech '28</span> &middot; RKGIT Ghaziabad</p>
    <p class="bio">Building things with Python, TypeScript, and a growing obsession with how AI fits into real engineering systems. Interested in full-stack apps, MLOps, and anything that ships.</p>
    <div class="links">
      <a class="link" href="https://github.com/risbh19" target="_blank">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        risbh19
      </a>
      <a class="link" href="https://linkedin.com/in/rishabhpal19" target="_blank">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
        rishabhpal19
      </a>
      <a class="link" href="mailto:palrishabh989@gmail.com">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/></svg>
        palrishabh989@gmail.com
      </a>
    </div>
  </div>

  <div class="section">
    <p class="section-label">// projects</p>
    <div class="project">
      <div class="project-top">
        <a class="project-name" href="https://github.com/risbh19/careflow" target="_blank">CareFlow</a>
        <span class="project-repo">risbh19/careflow</span>
      </div>
      <p class="project-desc">Role-based hospital management system with isolated Doctor, Nurse, and Patient portals. Real-time cross-portal sync via SSE streaming. Includes a paperless prescription system, task lifecycle management, and AI-powered clinical logic via Llama 3.1 8B.</p>
      <div class="tags">
        <span class="tag lang">TypeScript</span>
        <span class="tag lang">Python</span>
        <span class="tag">Next.js 14</span>
        <span class="tag">FastAPI</span>
        <span class="tag db">MongoDB Atlas</span>
        <span class="tag ai">Llama 3.1</span>
        <span class="tag ai">Groq</span>
        <span class="tag">JWT auth</span>
        <span class="tag">SSE</span>
      </div>
    </div>
    <div class="project">
      <div class="project-top">
        <a class="project-name" href="https://github.com/risbh19/git-grader" target="_blank">Git Grader</a>
        <span class="project-repo">risbh19/git-grader</span>
      </div>
      <p class="project-desc">AI-powered GitHub repo evaluator. Ingests any public repo via the GitHub REST API and scores it across code quality, architecture, commit history, and documentation — then generates a recruiter-perspective summary and improvement roadmap.</p>
      <div class="tags">
        <span class="tag lang">Python</span>
        <span class="tag">GitHub REST API</span>
        <span class="tag ai">LLM</span>
        <span class="tag ai">NLP</span>
        <span class="tag">Static analysis</span>
      </div>
    </div>
    <div class="project">
      <div class="project-top">
        <a class="project-name" href="https://github.com/risbh19/customer-retention-sql" target="_blank">Decoding Customer Value</a>
        <span class="project-repo">risbh19/customer-retention-sql</span>
      </div>
      <p class="project-desc">SQL + Python pipeline to segment ~3,900 retail customers by loyalty vs. promo dependency. Engineers composite value scores, behavioral loyalty flags, and churn risk indicators.</p>
      <div class="tags">
        <span class="tag lang">Python</span>
        <span class="tag lang">SQL</span>
        <span class="tag">pandas</span>
        <span class="tag">DuckDB</span>
        <span class="tag">Power BI</span>
      </div>
    </div>
  </div>

  <div class="section">
    <p class="section-label">// experience</p>
    <div class="intern-block">
      <div>
        <p class="intern-role">Software Testing Intern</p>
        <p class="intern-company">R-Cube Green Technology LLP</p>
      </div>
      <div>
        <p class="intern-date">Jun 2026 – present</p>
        <p class="intern-date" style="color:#3fb950; margin-top:4px;">● active</p>
      </div>
    </div>
    <p class="intern-desc" style="margin-top: 12px;">Functional and regression testing on AcadShree School ERP. API validation via Postman, defect documentation, bug triage with the dev team.</p>
  </div>

  <div class="section">
    <p class="section-label">// stack</p>
    <div class="skills-grid">
      <div class="skill-row"><span class="skill-label">languages</span><span class="skill-value">Python, C++, TypeScript, JavaScript</span></div>
      <div class="skill-row"><span class="skill-label">backend</span><span class="skill-value">FastAPI, Next.js 14, React</span></div>
      <div class="skill-row"><span class="skill-label">ai / llm</span><span class="skill-value">Groq, Gemini Flash, HuggingFace, Llama 3</span></div>
      <div class="skill-row"><span class="skill-label">databases</span><span class="skill-value">MongoDB Atlas</span></div>
      <div class="skill-row"><span class="skill-label">infra</span><span class="skill-value">Docker, AWS, Git, Linux, Vercel, Render</span></div>
      <div class="skill-row"><span class="skill-label">apis</span><span class="skill-value">GitHub REST, NewsAPI, Reddit API</span></div>
    </div>
  </div>

  <div class="section">
    <p class="section-label">// achievements</p>
    <div class="achievements">
      <div class="achievement"><span class="ach-icon">★</span><p class="ach-text"><strong>Global Finalist</strong> — Strategy Storm 2026, IIT Guwahati</p></div>
      <div class="achievement"><span class="ach-icon">★</span><p class="ach-text"><strong>Top 8 Teams</strong> — Investomania 2026, IIT Hyderabad</p></div>
      <div class="achievement"><span class="ach-icon">★</span><p class="ach-text"><strong>First Runner-Up</strong> — Hackwarts, college hackathon</p></div>
    </div>
  </div>

  <div class="section">
    <p class="section-label">// education</p>
    <div class="edu">
      <div>
        <p class="edu-name">B.Tech in Computer Science Engineering</p>
        <p class="edu-sub">Raj Kumar Goel Institute of Technology, Ghaziabad</p>
      </div>
      <div>
        <p class="edu-cgpa">8.03 GPA</p>
        <p class="edu-year">2024 – 2028</p>
      </div>
    </div>
  </div>

</div>
</body>
</html>
