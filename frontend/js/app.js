// Template data
const TEMPLATES = [
  {
    id: 'landing',
    name: 'Landing Page',
    icon: '🚀',
    description: 'Convert visitors into customers with a stunning single-page design',
    styles: [
      { name: 'Startup', icon: '💡', color: '#6366f1' },
      { name: 'SaaS', icon: '📈', color: '#10b981' },
      { name: 'Product', icon: '🎯', color: '#f59e0b' }
    ],
    features: ['Hero Section', 'Features Grid', 'Testimonials', 'Pricing', 'Contact Form']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Build your online store with product listings and checkout system',
    styles: [
      { name: 'Fashion', icon: '👗', color: '#ec4899' },
      { name: 'Electronics', icon: '📱', color: '#8b5cf6' },
      { name: 'Handmade', icon: '✂️', color: '#f59e0b' }
    ],
    features: ['Product Grid', 'Shopping Cart', 'Checkout System', 'Product Filters', 'Customer Reviews']
  },
  {
    id: 'blog',
    name: 'Blog',
    icon: '📝',
    description: 'Start sharing your ideas with a modern content platform',
    styles: [
      { name: 'Minimalist', icon: '🧊', color: '#3b82f6' },
      { name: 'Magazine', icon: '📰', color: '#ef4444' },
      { name: 'Personal', icon: '👤', color: '#10b981' }
    ],
    features: ['Category Filters', 'Search Function', 'Comment System', 'Newsletter', 'Author Profiles']
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: '🎨',
    description: 'Showcase your work with elegant galleries and project showcases',
    styles: [
      { name: 'Creative', icon: '🎨', color: '#8b5cf6' },
      { name: 'Grid', icon: '🔳', color: '#6366f1' },
      { name: 'Masonry', icon: '🧱', color: '#f59e0b' }
    ],
    features: ['Project Showcase', 'Skills Section', 'Testimonials', 'Contact Form', 'Case Studies']
  }
];

// DOM Elements
const templateView = document.getElementById('templateView');
const customizeView = document.getElementById('customizeView');
const templateGrid = document.querySelector('.grid');
const previewContent = document.getElementById('previewContent');
const templateName = document.getElementById('templateName');
const backButton = document.getElementById('backButton');
const generateButton = document.getElementById('generateButton');
const styleTab = document.getElementById('styleTab');
const featuresTab = document.getElementById('featuresTab');

// Current state
let currentTemplate = null;
let currentStyle = null;
let currentTemplateCode = {
    html: '',
    css: '',
    js: ''
};

let editor = {
    html: null,
    css: null,
    js: null
};

// Initialize the app
function initApp() {
  renderTemplates();
  setupEventListeners();
  initEditor();
  // Set default values for content
  document.getElementById('siteTitle').value = 'My Awesome Website';
  document.getElementById('siteTagline').value = 'A stunning website created with Netvanguard';
}

function initEditor() {
    // Initialize CodeMirror editors
    editor.html = CodeMirror(document.getElementById('htmlEditor'), {
        mode: 'htmlmixed',
        lineNumbers: true,
        theme: 'material-darker',
        autoCloseTags: true,
        matchTags: true,
        lineWrapping: true
    });
    
    editor.css = CodeMirror(document.getElementById('cssEditor'), {
        mode: 'css',
        lineNumbers: true,
        theme: 'material-darker',
        autoCloseBrackets: true,
        lineWrapping: true
    });
    
    editor.js = CodeMirror(document.getElementById('jsEditor'), {
        mode: 'javascript',
        lineNumbers: true,
        theme: 'material-darker',
        autoCloseBrackets: true,
        lineWrapping: true
    });
    
    // Set editor change handlers
    editor.html.on('change', updateLivePreview);
    editor.css.on('change', updateLivePreview);
    editor.js.on('change', updateLivePreview);
    
    // Tab switching
    document.getElementById('htmlTab').addEventListener('click', () => switchEditorTab('html'));
    document.getElementById('cssTab').addEventListener('click', () => switchEditorTab('css'));
    document.getElementById('jsTab').addEventListener('click', () => switchEditorTab('js'));
    document.getElementById('previewTab').addEventListener('click', () => switchEditorTab('preview'));
    
    // Editor navigation
    document.getElementById('editorBackButton').addEventListener('click', backToCustomize);
    document.getElementById('saveTemplateButton').addEventListener('click', saveTemplate);
    document.getElementById('downloadFinalButton').addEventListener('click', downloadFinalWebsite);
}

function switchEditorTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.code-editor').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll('.editor-tab').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected tab
    switch(tab) {
        case 'html':
            document.getElementById('htmlEditor').classList.add('active');
            document.getElementById('htmlTab').classList.add('active');
            break;
        case 'css':
            document.getElementById('cssEditor').classList.add('active');
            document.getElementById('cssTab').classList.add('active');
            break;
        case 'js':
            document.getElementById('jsEditor').classList.add('active');
            document.getElementById('jsTab').classList.add('active');
            break;
        case 'preview':
            document.getElementById('livePreview').classList.add('active');
            document.getElementById('previewTab').classList.add('active');
            updateLivePreview();
            break;
    }
}

function updateLivePreview() {
    const html = editor.html.getValue();
    const css = editor.css.getValue();
    const js = editor.js.getValue();
    
    const preview = document.getElementById('livePreview');
    const previewDoc = preview.contentDocument || preview.contentWindow.document;
    
    previewDoc.open();
    previewDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>
    `);
    previewDoc.close();
}

function backToCustomize() {
    document.getElementById('editorView').classList.add('exiting');
    
    setTimeout(() => {
        document.getElementById('editorView').style.display = 'none';
        document.getElementById('editorView').classList.remove('exiting');
        
        document.getElementById('customizeView').style.display = 'block';
        
        // Update progress indicator
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
            if (step.dataset.step === '2') step.classList.add('active');
        });
    }, 500);
}

function saveTemplate() {
    const templateName = prompt('Enter a name for your template:');
    if (!templateName) return;
    
    // Get current template code
    const template = {
        name: templateName,
        html: editor.html.getValue(),
        css: editor.css.getValue(),
        js: editor.js.getValue(),
        type: currentTemplate.id,
        style: currentStyle
    };
    
    // Save to localStorage
    let savedTemplates = JSON.parse(localStorage.getItem('userTemplates'));
    if (!savedTemplates) savedTemplates = []; 

    savedTemplates.push(template);
    localStorage.setItem('userTemplates', JSON.stringify(savedTemplates));
    
    alert(`Template "${templateName}" saved successfully!`);
}

async function downloadFinalWebsite() {
    const html = editor.html.getValue();
    const css = editor.css.getValue();
    const js = editor.js.getValue();
    
    const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${document.getElementById('siteTitle').value || 'My Website'}</title>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>
    `;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Render templates on the selection screen
function renderTemplates() {
  templateGrid.innerHTML = '';
  
  TEMPLATES.forEach(template => {
    const templateCard = document.createElement('div');
    templateCard.className = 'card template-card';
    templateCard.dataset.id = template.id;
    
    templateCard.innerHTML = `
      <div class="icon">${template.icon}</div>
      <h3>${template.name}</h3>
      <p>${template.description}</p>
    `;
    
    templateGrid.appendChild(templateCard);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Template selection with ripple effect
  templateGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.template-card');
    if (!card) return;
    
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255,255,255,0.4);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 600ms linear;
    `;
    
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    
    card.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // Select template
    selectTemplate(card.dataset.id);
  });

  // Back button from customize view
  backButton.addEventListener('click', () => {
    customizeView.classList.add('exiting');
    
    setTimeout(() => {
      customizeView.style.display = 'none';
      customizeView.classList.remove('exiting');
      
      templateView.style.display = 'block';
      
      // Update progress indicator
      document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        if (step.dataset.step === '1') step.classList.add('active');
      });
    }, 500);
  });
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === tab) content.classList.add('active');
      });
    });
  });
  
  // Device toggling
  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Add device class to preview content
      const device = btn.dataset.device;
      previewContent.className = 'preview-content';
      previewContent.classList.add(device);
    });
  });
  
  // Generate button
  generateButton.addEventListener('click', generateWebsite);
  
  // Real-time preview updates
  document.querySelectorAll('#siteTitle, #siteTagline').forEach(input => {
    input.addEventListener('input', renderPreview);
  });
  
  const colorInput = document.getElementById('primaryColor');
  if (colorInput) {
    colorInput.addEventListener('input', renderPreview);
  }
}

// Handle template selection
function selectTemplate(templateId) {
  currentTemplate = TEMPLATES.find(t => t.id === templateId);
  
  if (!currentTemplate) return;
  
  // Update UI
  templateName.textContent = currentTemplate.name;
  
  // Animate out the template view
  templateView.classList.add('exiting');
  
  setTimeout(() => {
    templateView.style.display = 'none';
    templateView.classList.remove('exiting');
    
    // Show customization view
    customizeView.style.display = 'block';
    
    // Reset tabs to style
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="style"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
      if (content.dataset.tab === 'style') content.classList.add('active');
    });
    
    // Render all content
    renderStyleOptions();
    renderFeatures();
    renderPreview();
    
    // Update progress indicator
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
      if (step.dataset.step === '2') step.classList.add('active');
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, 500);
}

// Render style options
function renderStyleOptions() {
  styleTab.innerHTML = '';
  
  if (!currentTemplate) return;
  
  currentTemplate.styles.forEach(style => {
    const styleOption = document.createElement('div');
    styleOption.className = 'style-option';
    if (currentStyle === style.name) styleOption.classList.add('active');
    styleOption.dataset.name = style.name;
    
    styleOption.innerHTML = `
      <div class="option-icon">${style.icon}</div>
      <div>
        <div class="style-name">${style.name}</div>
        <div class="style-type">${currentTemplate.name} Style</div>
      </div>
    `;
    
    styleOption.addEventListener('click', () => {
      currentStyle = style.name;
      document.querySelectorAll('.style-option').forEach(opt => {
        opt.classList.remove('active');
      });
      styleOption.classList.add('active');
      renderPreview();
    });
    
    styleTab.appendChild(styleOption);
  });
  
  // Set first style as active if none selected
  if (!currentStyle && currentTemplate.styles.length > 0) {
    currentStyle = currentTemplate.styles[0].name;
    styleTab.querySelector('.style-option').classList.add('active');
  }
}

// Render features list
function renderFeatures() {
  featuresTab.innerHTML = '';
  
  if (!currentTemplate) return;
  
  currentTemplate.features.forEach(feature => {
    const featureItem = document.createElement('div');
    featureItem.className = 'style-option';
    
    featureItem.innerHTML = `
      <div class="option-icon">✅</div>
      <div class="feature-name">${feature}</div>
    `;
    
    featuresTab.appendChild(featureItem);
  });
}

// Render live preview
function renderPreview() {
  if (!currentTemplate || !currentStyle) return;
  
  const getPreviewHTML = () => {
    const templateData = {
      title: document.getElementById('siteTitle').value || 'My Awesome Website',
      tagline: document.getElementById('siteTagline').value || 'A stunning website created with Netvanguard',
      color: document.getElementById('primaryColor').value || '#6366f1'
    };
    
    switch(currentTemplate.id) {
      case 'landing':
        return `
          <div style="font-family: 'Poppins', sans-serif; height: 100%;">
            <header style="background: linear-gradient(135deg, ${templateData.color}, #7c3aed); color: white; padding: 3rem 2rem; text-align: center;">
              <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${templateData.title}</h1>
              <p style="font-size: 1.2rem; opacity: 0.9;">${templateData.tagline}</p>
            </header>
            
            <section style="padding: 3rem; max-width: 1200px; margin: 0 auto;">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem;">
                <div style="background: #f3f4f6; border-radius: 1rem; padding: 1.5rem; text-align: center;">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;">✨</div>
                  <h3 style="font-size: 1.25rem; color: #1f2937;">Key Feature 1</h3>
                  <p style="color: #4b5563; margin-top: 0.5rem;">Description of this amazing feature</p>
                </div>
                <div style="background: #f3f4f6; border-radius: 1rem; padding: 1.5rem; text-align: center;">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;">🚀</div>
                  <h3 style="font-size: 1.25rem; color: #1f2937;">Key Feature 2</h3>
                  <p style="color: #4b5563; margin-top: 0.5rem;">Description of this amazing feature</p>
                </div>
                <div style="background: #f3f4f6; border-radius: 1rem; padding: 1.5rem; text-align: center;">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;">💎</div>
                  <h3 style="font-size: 1.25rem; color: #1f2937;">Key Feature 3</h3>
                  <p style="color: #4b5563; margin-top: 0.5rem;">Description of this amazing feature</p>
                </div>
              </div>
            </section>
          </div>
        `;
        
      case 'ecommerce':
        return `
          <div style="font-family: 'Poppins', sans-serif; height: 100%; background: #f9fafb;">
            <header style="background: white; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                <h1 style="font-size: 1.8rem; color: ${templateData.color};">${templateData.title}</h1>
                <div style="display: flex; gap: 1.5rem;">
                  <button style="background: transparent; border: none; font-size: 1.2rem;">🛒</button>
                  <button style="background: transparent; border: none; font-size: 1.2rem;">👤</button>
                </div>
              </div>
            </header>
            
            <section style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
              <h2 style="text-align: center; margin-bottom: 2rem; color: #1f2937;">Featured Products</h2>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div style="height: 180px; background: #e5e7eb;"></div>
                  <div style="padding: 1.5rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #1f2937;">Product Name</h3>
                    <p style="color: #4b5563; font-weight: bold;">$49.99</p>
                    <button style="background: ${templateData.color}; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; margin-top: 1rem; width: 100%;">Add to Cart</button>
                  </div>
                </div>
                <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div style="height: 180px; background: #e5e7eb;"></div>
                  <div style="padding: 1.5rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #1f2937;">Product Name</h3>
                    <p style="color: #4b5563; font-weight: bold;">$49.99</p>
                    <button style="background: ${templateData.color}; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; margin-top: 1rem; width: 100%;">Add to Cart</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        `;
        
      case 'blog':
        return `
          <div style="font-family: 'Poppins', sans-serif; height: 100%;">
            <header style="background: linear-gradient(135deg, ${templateData.color}, #8b5cf6); color: white; padding: 3rem 2rem; text-align: center;">
              <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${templateData.title}</h1>
              <p style="font-size: 1.2rem; opacity: 0.9;">${templateData.tagline}</p>
            </header>
            
            <section style="padding: 2rem; max-width: 800px; margin: 0 auto;">
              <article style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 2rem;">
                <div style="height: 200px; background: #e5e7eb;"></div>
                <div style="padding: 1.5rem;">
                  <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1f2937;">Blog Post Title</h2>
                  <div style="display: flex; align-items: center; gap: 1rem; color: #6b7280; margin-bottom: 1rem;">
                    <span>📅 May 27, 2023</span>
                    <span>⏱️ 5 min read</span>
                  </div>
                  <p style="color: #4b5563; line-height: 1.6;">This is an engaging introduction to the blog post that captures the reader's attention...</p>
                </div>
              </article>
            </section>
          </div>
        `;
        
      case 'portfolio':
        return `
          <div style="font-family: 'Poppins', sans-serif; height: 100%; background: #f9fafb;">
            <header style="background: white; padding: 1.5rem 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                <h1 style="font-size: 1.8rem; color: ${templateData.color};">${templateData.title}</h1>
                <nav>
                  <a href="#" style="margin-left: 1.5rem; color: #4b5563; text-decoration: none;">Work</a>
                  <a href="#" style="margin-left: 1.5rem; color: #4b5563; text-decoration: none;">About</a>
                  <a href="#" style="margin-left: 1.5rem; color: #4b5563; text-decoration: none;">Contact</a>
                </nav>
              </div>
            </header>
            
            <section style="padding: 3rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center;">
              <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #1f2937;">Featured Projects</h2>
              <p style="color: #4b5563; max-width: 600px; margin: 0 auto 2rem;">${templateData.tagline}</p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
                <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div style="height: 200px; background: #e5e7eb;"></div>
                  <div style="padding: 1.5rem;">
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #1f2937;">Project Title</h3>
                    <p style="color: #4b5563;">Brief description of the project and its impact</p>
                  </div>
                </div>
                <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <div style="height: 200px; background: #e5e7eb;"></div>
                  <div style="padding: 1.5rem;">
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #1f2937;">Project Title</h3>
                    <p style="color: #4b5563;">Brief description of the project and its impact</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        `;
        
      default:
        return `
          <div style="display: flex; justify-content: center; align-items: center; height: 100%; background: #f3f4f6; color: #4b5563;">
            <div style="text-align: center; padding: 2rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">${currentTemplate.icon}</div>
              <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${currentTemplate.name} Preview</h1>
              <p>Styled with the ${currentStyle} theme</p>
            </div>
          </div>
        `;
    }
  };
  
  previewContent.innerHTML = getPreviewHTML();
}

// Generate website function
async function generateWebsite() {
  if (!currentTemplate || !currentStyle) {
    alert('Please select a template and style first!');
    return;
  }

  const siteTitle = document.getElementById('siteTitle').value || 'My Awesome Website';
  const primaryColor = document.getElementById('primaryColor').value || '#6366f1';
  const tagline = document.getElementById('siteTagline').value || 'A stunning website created with Netvanguard';

  // Show loading state
  const originalHTML = generateButton.innerHTML;
  generateButton.innerHTML = 'Generating...';
  generateButton.disabled = true;

  try {
    const payload = {
      type: currentTemplate.id?.toLowerCase(),  // "landing"
      style: currentStyle?.toLowerCase(),       // "startup"
      title: siteTitle,
      tagline: tagline,
      color: primaryColor
    };

    // Simulate API call (replace with actual fetch)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set editor content with sample template
    editor.html.setValue(`<!DOCTYPE html>
<html>
<head>
  <title>${siteTitle}</title>
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    header {
      background: linear-gradient(135deg, ${primaryColor}, #7c3aed);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <h1>${siteTitle}</h1>
    <p>${tagline}</p>
  </header>
  <main>
    <section class="features">
      <!-- Features will go here -->
    </section>
  </main>
</body>
</html>`);
    
    editor.css.setValue(`body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
}

header {
  padding: 3rem 2rem;
  text-align: center;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.feature-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}`);
    
    editor.js.setValue('// JavaScript will go here\nconsole.log("Website loaded");');

    // Switch to editor view
    customizeView.style.display = 'none';
    document.getElementById('editorView').style.display = 'block';

    // Update progress indicator
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
      if (step.dataset.step === '3') step.classList.add('active');
    });

  } catch (error) {
    console.error('Generation error:', error);
    alert('Error: ' + error.message);
  } finally {
    generateButton.innerHTML = originalHTML;
    generateButton.disabled = false;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
