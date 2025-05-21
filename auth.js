let isLogin = true;

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById("form-title").textContent = isLogin ? "Masuk ke Call-up Career" : "Daftar Akun Baru";
  document.getElementById("submit-btn").textContent = isLogin ? "Masuk" : "Daftar";
  document.getElementById("toggle-text").innerHTML = isLogin
    ? 'Belum punya akun? <a href="#" onclick="toggleForm()">Daftar di sini</a>'
    : 'Sudah punya akun? <a href="#" onclick="toggleForm()">Masuk di sini</a>';
}
// Tambahkan di awal <script> dalam home.html
if (!localStorage.getItem("loggedIn")) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = "login.html";
}


function handleSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Silakan isi semua data.");
    return;
  }

  if (isLogin) {
    // Proses Login
    const savedUser = localStorage.getItem(email);
    if (!savedUser) {
      alert("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
      return;
    }

    const userData = JSON.parse(savedUser);
    if (userData.password === password) {
      alert("Login berhasil!");
      window.location.href = "home.html";
    } else {
      alert("Kata sandi salah.");
    }
  } else {
    // Proses Daftar
    if (localStorage.getItem(email)) {
      alert("Email sudah terdaftar.");
      return;
    }

    const userData = { email, password };
    localStorage.setItem(email, JSON.stringify(userData));
    alert("Pendaftaran berhasil! Silakan masuk.");
    toggleForm();
  }
}
