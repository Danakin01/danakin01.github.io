// ─── Theme ───
const toggle = document.getElementById('themeToggle');
const html = document.documentElement;

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}

const saved = localStorage.getItem('theme');
if (saved) setTheme(saved);
// else default from HTML attribute

if (toggle) {
  toggle.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

// ─── Mobile Menu ───
const burger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-nav a');

if (burger && mobileNav) {
  burger.addEventListener('click', e => {
    e.stopPropagation();
    burger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  mobileLinks.forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
  }));
}

// ─── Scroll Reveal ───
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if (revealEls.length) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObs.observe(el));
}

// ─── Nav scroll style ───
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 10
      ? 'var(--c-border)' : 'transparent';
  });
}

// ─── Chatbot ───
const chatToggle = document.getElementById('chatbotToggleBtn');
const chatWindow = document.getElementById('chatbotWindow');
const chatClose = document.getElementById('chatCloseBtn');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSendBtn');

let API_KEY = '';
if (typeof CONFIG !== 'undefined' && CONFIG.OPENROUTER_API_KEY) {
  API_KEY = CONFIG.OPENROUTER_API_KEY;
}

// In production, use the Cloudflare Worker proxy (key stays server-side).
// Locally, fall back to direct API calls using config.js.
const PROXY_URL = (typeof CONFIG !== 'undefined' && CONFIG.PROXY_URL)
  ? CONFIG.PROXY_URL
  : '';

if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('open');
    chatToggle.style.display = 'none';
  });
}
if (chatClose) {
  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('open');
    chatToggle.style.display = 'flex';
  });
}

const systemPrompt = `You are a concise, helpful assistant on Daniel Akinwande George's portfolio website.
Answer questions about Daniel using ONLY this information:

BACKGROUND: First Class Computer Engineering graduate (CGPA 4.57/5.00) from Olabisi Onabanjo University, Ogun State, Nigeria. Best Graduating Student 2025.

CURRENT ROLE: AI Engineer at VDL Technologies. (If anyone asks what Daniel is currently doing, tell them he is currently an AI Engineer at VDL Technologies).

EXPERIENCE:
- AI Engineer at VDL Technologies (Current): Building advanced AI solutions, fine-tuning ML models, and deploying production-grade systems.
- Technical Intern at VDL Technologies, Lagos (May–Oct 2024): Built APIs, fine-tuned ML models for a production chatbot, QA tested 30+ bugs, built data pipeline processing 190,000+ records.
- Data Onboarding Intern at 5TS Feelsafe Children School (Apr–Oct 2022): Digitised 70+ records, trained 10+ staff on SAFSIMS, increased adoption by 80%.
- Data Science Practitioner (SWEP) at OOU (Nov–Dec 2023): Applied 3 ML models for house price prediction, achieved >70% accuracy.

LEADERSHIP:
- AI & ML Lead at Google Developer Student Clubs OOU (2023–2025): Led workshops for 60+ students, directed 8-person team on 3 projects, 150+ GitHub stars.
- Departmental Tech Lead at OOU-Tech Community (2023–2025): Onboarded 120+ students, ran 4 bootcamps.
- Campus Ambassador at Ingressive for Good (2022–2023).

SKILLS: Python, TensorFlow, Keras, Scikit-Learn, OpenCV, dlib, NLP, Pandas, NumPy, FastAPI, Docker, SQL, C++, Java, MATLAB, Git.

PROJECTS: Face Drowsiness Detection (OpenCV, 30+ FPS), Social Media Sentiment Pipeline (82% accuracy, 10k+ posts), Email Spam Classifier (>95% precision), Library Resource Management System (FYP), ML for Flexural Strength Prediction (ongoing research), Traffic Sign Recognition (GDSC, 150+ stars), Database Chatbot (VDL, production), Automatic Door Lock with Passkey Encryption (Top 3 dept project).

RESEARCH: Library Resource Management System (FYP, in preparation for publication). ML Approaches for Flexural Strength Prediction in Concrete Beams (ongoing collaboration).

Keep answers to 1-2 sentences. Be direct. If you don't have the info, say so honestly.`;

let messages = [{ role: 'system', content: systemPrompt }];

function addMsg(text, who) {
  const d = document.createElement('div');
  d.className = 'chat-msg ' + who;
  d.textContent = text;
  chatBody.appendChild(d);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Typewriter effect for bot messages
function typeMsg(text) {
  return new Promise(resolve => {
    const d = document.createElement('div');
    d.className = 'chat-msg bot';
    d.textContent = '';
    chatBody.appendChild(d);
    let i = 0;
    const speed = 18; // ms per character
    function tick() {
      if (i < text.length) {
        d.textContent += text[i];
        i++;
        chatBody.scrollTop = chatBody.scrollHeight;
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    }
    tick();
  });
}

async function send() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMsg(text, 'user');
  chatInput.value = '';
  messages.push({ role: 'user', content: text });

  if (!PROXY_URL && !API_KEY) {
    await typeMsg('Chat is unavailable — API key or Proxy not configured.');
    return;
  }

  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.textContent = '...';
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;

  const requestBody = JSON.stringify({
    model: 'meta-llama/llama-3.3-70b-instruct',
    messages: messages
  });

  try {
    let res;
    if (PROXY_URL) {
      // PRODUCTION: Use proxy — API key stays on the server
      res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });
    } else {
      // LOCAL DEV: Direct call using config.js key
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Daniel Portfolio'
        },
        body: requestBody
      });
    }

    const data = await res.json();
    if (chatBody.contains(typing)) chatBody.removeChild(typing);

    if (data.error) {
      await typeMsg('Error: ' + (data.error.message || 'Something went wrong.'));
    } else if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content;
      await typeMsg(reply);
      messages.push({ role: 'assistant', content: reply });
    } else {
      await typeMsg('No response received. Try again.');
    }
  } catch (err) {
    if (chatBody.contains(typing)) chatBody.removeChild(typing);
    await typeMsg('Connection error — check your internet.');
  }
}

if (chatSend) chatSend.addEventListener('click', send);
if (chatInput) chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') send(); });
