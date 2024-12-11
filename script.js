document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("urlInput");
  const generateBtn = document.getElementById("generateBtn");
  const qrContainer = document.getElementById("qrcode");
  const downloadBtn = document.getElementById("downloadBtn");
  const themeToggle = document.getElementById("themeToggle");

  let currentQR = null;

  generateBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();

    if (url === "") {
      alert("Please enter a valid URL.");
      return;
    }

    // Clear previous QR code if any
    qrContainer.innerHTML = "";

    currentQR = new QRCode(qrContainer, {
      text: url,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Show download button
    downloadBtn.style.display = "inline-block";
  });

  downloadBtn.addEventListener("click", () => {
    if (!currentQR) return;

    const img =
      qrContainer.querySelector("img") || qrContainer.querySelector("canvas");
    if (img) {
      const link = document.createElement("a");
      link.href = img.src;
      link.download = "qrcode.png";
      link.click();
    }
  });

  // Theme toggle
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  });
});
