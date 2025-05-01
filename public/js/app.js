document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      errorMsg.textContent = data.message || 'Error en el inicio de sesión';
      errorMsg.classList.remove('hidden');
      return;
    }
    // Save token and role in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    // Redirect based on role
    if (data.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'user.html';
    }
  } catch (error) {
    errorMsg.textContent = 'Error de conexión';
    errorMsg.classList.remove('hidden');
  }
});
