import React, { useState, useEffect } from 'react';

// Ganti dengan URL API .NET Anda (cek port-nya)
const API_URL = 'https://localhost:7123/api/auth';

function App() {
  // State untuk form login LDAP
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk menampilkan pesan
  const [message, setMessage] = useState('Silakan login...');


  useEffect(() => {
    // Cek apakah URL saat ini mengandung "code="
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode) {
      setMessage('Mendapat kode dari Google, menukar token...');
      // Hapus 'code' dari URL agar tidak diproses lagi
      window.history.pushState({}, null, '/'); 
      
      // Kirim 'code' ke backend .NET kita
      sendCodeToBackend(authCode);
    }
  }, []); // [] berarti ini hanya berjalan sekali saat app dimuat

  // Fungsi untuk mengirim 'code' ke .NET
  const sendCodeToBackend = async (code) => {
    try {
      const response = await fetch(`${API_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Login Google Berhasil! (Token diterima oleh backend)');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error koneksi ke backend.');
    }
  };

  // --- LOGIKA LOGIN LDAP ---
  const handleLdapLogin = async (e) => {
    e.preventDefault();
    setMessage('Mencoba login LDAP...');

    try {
      const response = await fetch(`${API_URL}/ldap-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // "Login LDAP berhasil!"
      } else {
        setMessage(data.message); // "Login LDAP gagal..."
      }
    } catch (error) {
      setMessage('Error koneksi ke backend.');
    }
  };

  // --- LOGIKA LOGIN OAUTH (Redirect) ---
  const handleGoogleLogin = () => {
    // GANTI DENGAN CLIENT ID ANDA
    const CLIENT_ID = 'ID_CLIENT_GOOGLE_ANDA.apps.googleusercontent.com';
    const REDIRECT_URI = 'http://localhost:3000'; // Halaman ini sendiri
    const SCOPE = 'email profile';
    
    // Alihkan pengguna ke halaman login Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
    window.location.href = authUrl;
  };


  return (
    <div style={{ padding: '20px' }}>
      <h1>Aplikasi Login Sederhana (Tugas Jarkom)</h1>
      <p><strong>Status:</strong> {message}</p>
      
      <hr />
      
      <h3>1. Test Login LDAP</h3>
      <form onSubmit={handleLdapLogin}>
        <div>
          Username:
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Login LDAP</button>
      </form>
      
      <hr />
      
      <h3>2. Test Login OAuth</h3>
      <button onClick={handleGoogleLogin}>Login dengan Google</button>
    </div>
  );
}

export default App;