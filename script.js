document.addEventListener("DOMContentLoaded", () => {
  // Global state
  let currentQR = null;
  let qrHistory = [];
  let sessionCount = 0;
  let totalCount = parseInt(localStorage.getItem('qrTotalCount') || '0');
  let isAdvancedMode = false;
  
  // DOM Elements
  const urlInput = document.getElementById("urlInput");
  const generateBtn = document.getElementById("generateBtn");
  const qrContainer = document.getElementById("qrcode");
  const qrPlaceholder = document.getElementById("qrPlaceholder");
  const downloadBtn = document.getElementById("downloadBtn");
  const shareBtn = document.getElementById("shareBtn");
  const copyBtn = document.getElementById("copyBtn");
  const actionButtons = document.getElementById("actionButtons");
  const modeBtn = document.getElementById("modeBtn");
  const advancedOptions = document.getElementById("advancedOptions");
  const historySection = document.getElementById("historySection");
  const historyGrid = document.getElementById("historyGrid");
  const statsCard = document.querySelector(".stats-card");
  const totalGenerated = document.getElementById("totalGenerated");
  const currentSession = document.getElementById("currentSession");
  
  // Advanced options
  const sizeSlider = document.getElementById("sizeSlider");
  const sizeValue = document.getElementById("sizeValue");
  const errorCorrection = document.getElementById("errorCorrection");
  const colorDark = document.getElementById("colorDark");
  const colorLight = document.getElementById("colorLight");
  
  // Initialize
  initCursor();
  initParticles();
  updateStats();
  loadHistory();
  
  // Custom Cursor
  function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.5;
      cursorY += (mouseY - cursorY) * 0.5;
      if (cursor) {
        cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
      }
      
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      if (follower) {
        follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
      }
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    const interactiveElements = document.querySelectorAll('button, input, a, .history-item, select, .slider');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px) scale(1.5)`;
        if (follower) follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px) scale(1.2)`;
      });
      el.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px) scale(1)`;
        if (follower) follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px) scale(1)`;
      });
    });
    
    document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    document.addEventListener('mouseup', () => document.body.classList.remove('clicking'));
  }
  
  // Particle Background
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = `hsla(${Math.random() * 60 + 200}, 70%, 60%, ${this.opacity})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      ctx.save();
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.globalAlpha = (1 - distance / 150) * 0.2;
            ctx.strokeStyle = p1.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      ctx.restore();
      
      requestAnimationFrame(animate);
    }
    animate();
  }
  
  // Event Listeners
  if (generateBtn) {
    generateBtn.addEventListener("click", generateQR);
  }
  if (urlInput) {
    urlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") generateQR();
    });
  }
  
  if (downloadBtn) downloadBtn.addEventListener("click", downloadQR);
  if (shareBtn) shareBtn.addEventListener("click", shareQR);
  if (copyBtn) copyBtn.addEventListener("click", copyURL);
  
  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      isAdvancedMode = !isAdvancedMode;
      if (advancedOptions) advancedOptions.classList.toggle("show", isAdvancedMode);
      if (historySection) historySection.classList.toggle("show", isAdvancedMode);
      modeBtn.querySelector('.mode-text').textContent = isAdvancedMode ? 'Simple' : 'Advanced';
      
      if (isAdvancedMode && statsCard) {
        setTimeout(() => statsCard.classList.add("show"), 500);
      } else if (statsCard) {
        statsCard.classList.remove("show");
      }
    });
  }
  
  if (sizeSlider) {
    sizeSlider.addEventListener("input", (e) => {
      if (sizeValue) sizeValue.textContent = `${e.target.value}px`;
    });
  }
  
  function generateQR() {
    const url = urlInput.value.trim();
    
    if (url === "") {
      showToast("Please enter a valid URL", "error");
      shakeElement(urlInput);
      return;
    }
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-text">Generating...</span><span class="btn-icon">⏳</span>';
    
    if (qrContainer) {
      qrContainer.innerHTML = "";
      qrContainer.classList.remove("show");
    }
    if (qrPlaceholder) qrPlaceholder.classList.remove("hide");
    if (actionButtons) actionButtons.classList.remove("show");
    
    const size = parseInt(sizeSlider.value);
    const errorCorrectionLevel = QRCode.CorrectLevel[errorCorrection.value];
    const darkColor = colorDark.value;
    const lightColor = colorLight.value;
    
    setTimeout(() => {
      try {
        currentQR = new QRCode(qrContainer, {
          text: url,
          width: size,
          height: size,
          colorDark: darkColor,
          colorLight: lightColor,
          correctLevel: errorCorrectionLevel,
        });
        
        setTimeout(() => {
          if (qrPlaceholder) qrPlaceholder.classList.add("hide");
          if (qrContainer) qrContainer.classList.add("show");
          if (actionButtons) actionButtons.classList.add("show");
          
          sessionCount++;
          totalCount++;
          localStorage.setItem('qrTotalCount', totalCount);
          updateStats();
          addToHistory(url);
          createParticleBurst(window.innerWidth / 2, qrContainer.getBoundingClientRect().top + size / 2);
          showToast("QR Code generated successfully!", "success");
          
          generateBtn.disabled = false;
          generateBtn.innerHTML = '<span class="btn-text">Generate</span><span class="btn-icon">⚡</span>';
        }, 300);
        
      } catch (error) {
        console.error("QR Code Generation Error:", error);
        showToast("Error generating QR code", "error");
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-text">Generate</span><span class="btn-icon">⚡</span>';
      }
    }, 500);
  }
  
  function downloadQR() {
    const canvas = qrContainer.querySelector("canvas");
    const img = qrContainer.querySelector("img");
    let downloadLinkSource = null;

    if (canvas) {
        downloadLinkSource = canvas.toDataURL("image/png");
    } else if (img) {
        downloadLinkSource = img.src;
    }

    if(downloadLinkSource) {
        const link = document.createElement("a");
        link.download = `qrcode-${Date.now()}.png`;
        link.href = downloadLinkSource;
        link.click();
        showToast("QR Code downloaded!", "success");
    } else {
        showToast("Could not find QR Code to download.", "error");
    }
  }
  
  async function shareQR() {
    if (!navigator.share) {
      showToast("Your browser doesn't support sharing.", "info");
      return;
    }

    try {
      const canvas = qrContainer.querySelector("canvas");
      const img = qrContainer.querySelector("img");
      let blob;
      
      if (canvas) {
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      } else if (img) {
        const response = await fetch(img.src);
        blob = await response.blob();
      } else {
        showToast("Could not find QR Code to share.", "error");
        return;
      }
      
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'QR Code',
        text: `QR Code for: ${urlInput.value}`,
        files: [file]
      });
      
      showToast("Shared successfully!", "success");
    } catch (error) {
      if (error.name !== 'AbortError') {
         showToast("Sharing failed or was cancelled.", "error");
      }
    }
  }
  
  async function copyURL() {
    if (!navigator.clipboard) {
        showToast("Clipboard access is not available.", "error");
        return;
    }
    try {
      await navigator.clipboard.writeText(urlInput.value);
      showToast("URL copied to clipboard!", "success");
      
      copyBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        copyBtn.style.transform = 'scale(1)';
      }, 200);
    } catch (error) {
      showToast("Failed to copy URL.", "error");
    }
  }
  
  function addToHistory(url) {
    const canvas = qrContainer.querySelector("canvas");
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    const historyItem = {
      url: url,
      image: dataURL,
      timestamp: Date.now()
    };
    
    qrHistory.unshift(historyItem);
    if (qrHistory.length > 10) qrHistory.pop();
    
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
    renderHistory();
  }
  
  function loadHistory() {
    const saved = localStorage.getItem('qrHistory');
    if (saved) {
      qrHistory = JSON.parse(saved);
      renderHistory();
    }
  }
  
  function renderHistory() {
    if (!historyGrid) return;
    historyGrid.innerHTML = '';
    
    qrHistory.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <img src="${item.image}" alt="QR Code for ${item.url}">
        <div class="history-item-url">${item.url}</div>
      `;
      
      div.addEventListener('click', () => {
        urlInput.value = item.url;
        generateQR();
      });
      
      historyGrid.appendChild(div);
    });
  }
  
  function updateStats() {
    if (!totalGenerated || !currentSession) return;
    animateNumber(totalGenerated, totalCount);
    animateNumber(currentSession, sessionCount);
  }
  
  function animateNumber(element, target) {
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    if (start === target) return;
    const duration = 1000;
    const frameRate = 60;
    const totalFrames = duration / (1000 / frameRate);
    const increment = (target - start) / totalFrames;
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString().padStart(3, '0');
    }, 1000 / frameRate);
  }
  
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add("show"), 10);
    
    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  }

  function shakeElement(element) {
    if(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }
  }
  
  function createParticleBurst(x, y) {
    const container = document.getElementById("particleContainer");
    if(!container) return;

    const colors = ['#667eea', '#764ba2', '#f687b3', '#fbbf24'];
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      
      const size = Math.random() * 8 + 4;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 150 + 50;
      
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = color;
      particle.style.borderRadius = '50%';
      particle.style.position = 'absolute';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);

      container.appendChild(particle);

      setTimeout(() => {
          particle.remove();
      }, 2000);
    }
  }

});