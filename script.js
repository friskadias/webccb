async function processImage() {
  const fileInput = document.getElementById("screenshot");
  const messageBox = document.getElementById("message");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  progressBar.style.width = "0%";
  progressText.innerText = "0%";

  if (fileInput.files && fileInput.files[0]) {
    const imageFile = fileInput.files[0];

    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => {
          if (m.status === "recognizing text") {
            const progress = Math.round(m.progress * 100);
            progressBar.style.width = progress + "%";
            progressText.innerText = progress + "%";
          }
        }
      });

      messageBox.value = result.data.text;
      progressText.innerText = "Scan selesai!";
    } catch (err) {
      console.error("OCR gagal:", err);
      messageBox.value = "Gagal membaca teks dari gambar. Pastikan gambar jelas dan coba lagi.";
      progressText.innerText = "Gagal";
    }
  }
}

async function checkJobOffer() {
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value;
  const validatePhone = document.getElementById("validatePhoneToggle").checked;
  const resultDiv = document.getElementById("result");
  const scoreDiv = document.getElementById("score");

  // Bobot penilaian
  const contactWeight = 60;
  const contentWeight = 40;
  let score = 0;

  // === Validasi Email ===
  const suspiciousEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com"];
  let isEmailValid = false;
  if (email.includes("@")) {
    const emailDomain = email.split("@")[1];
    isEmailValid = !suspiciousEmailDomains.includes(emailDomain);
  }

  // === Validasi Nomor Telepon ===
  let isPhoneValid = false;
  let suspiciousTags = [];
  if (phone) {
    isPhoneValid = /^\d{10,15}$/.test(phone);

    if (validatePhone && isPhoneValid) {
      try {
        const response = await fetch(`https://api.getcontact.com/checkNumber?phone=${phone}`, {
          method: "GET",
          headers: {
            "Authorization": "Bearer YOUR_API_KEY", // Ganti dengan kunci API valid
          },
        });
        if (response.ok) {
          const data = await response.json();
          suspiciousTags = data.tags.filter(tag =>
            tag.toLowerCase().includes("penipuan") || tag.toLowerCase().includes("scam")
          );
        }
      } catch (error) {
        console.warn("Gagal memeriksa nomor telepon:", error);
      }
    }
  }

  // === Skor Kontak ===
  let contactValid = false;

  if (isEmailValid || (validatePhone && isPhoneValid) || (!validatePhone && phone)) {
    contactValid = true;
    score += contactWeight;
  }

  // === Validasi Isi Pesan ===
  const suspiciousWords = ["transfer", "biaya", "uang", "hadiah", "pembayaran"];
  const messageWords = message.toLowerCase().split(/\s+/);
  const foundSuspiciousWords = messageWords.filter(word => suspiciousWords.includes(word));

  if (foundSuspiciousWords.length === 0) {
    score += contentWeight;
  }

  // === Tampilkan Hasil ===
  let resultMessage = "";

  if (email) {
    resultMessage += isEmailValid
      ? "✅ Email terlihat aman.<br>"
      : "⚠️ Email menggunakan domain umum.<br>";
  }

  if (phone) {
    if (!validatePhone) {
      resultMessage += "ℹ️ Validasi nomor telepon dinonaktifkan.<br>";
    } else {
      resultMessage += isPhoneValid
        ? "✅ Nomor telepon terlihat valid.<br>"
        : "⚠️ Format nomor telepon tidak valid.<br>";
      
      if (suspiciousTags.length > 0) {
        resultMessage += `⚠️ Nomor mencurigakan (tagar): ${suspiciousTags.join(", ")}.<br>`;
      }
    }
  }

  if (!email && !phone) {
    resultMessage += "⚠️ Harap isi setidaknya satu: email atau nomor telepon.<br>";
  }

  if (foundSuspiciousWords.length > 0) {
    resultMessage += `⚠️ Ditemukan kata mencurigakan: ${foundSuspiciousWords.join(", ")}.<br>`;
  } else {
    resultMessage += "✅ Isi surat terlihat aman.<br>";
  }

  resultDiv.innerHTML = resultMessage;
  scoreDiv.innerHTML = `Score: ${score}%`;
}
