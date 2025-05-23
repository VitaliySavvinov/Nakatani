document.getElementById('showLogin').onclick = () => {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('showLogin').classList.add('active');
  document.getElementById('showRegister').classList.remove('active');
};

document.getElementById('showRegister').onclick = () => {
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('showRegister').classList.add('active');
  document.getElementById('showLogin').classList.remove('active');
};

async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorDiv = document.getElementById('registerError');

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  errorDiv.style.color = data.success ? 'green' : 'red';
  errorDiv.textContent = data.message;
}

async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem('loggedInUser', data.username); // или можно использовать cookie/token
    window.location.href = 'Profile.html';
  } else {
    errorDiv.textContent = data.message;
  }
}
