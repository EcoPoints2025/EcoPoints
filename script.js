const storageKey = 'ecopoints_users';
let currentUser = null;
let currentQuestion = 0;

const questions = [
  {
    q: "¿Qué material es reciclable?",
    options: ["Papel", "Comida", "Ropa mojada", "Aceite usado"],
    answer: 0
  },
  {
    q: "¿Cuántos litros de agua se ahorran reciclando 1kg de papel?",
    options: ["10", "50", "100", "200"],
    answer: 3
  },
  {
    q: "¿Qué color representa el reciclaje del vidrio?",
    options: ["Rojo", "Verde", "Amarillo", "Negro"],
    answer: 1
  },
  {
    q: "¿Qué tipo de bolsa es mejor para el medio ambiente?",
    options: ["Plástica", "Papel", "Tela reutilizable", "Ninguna"],
    answer: 2
  },
  {
    q: "¿Cuál es el objetivo del reciclaje?",
    options: ["Ganar dinero", "Reducir residuos y proteger el planeta", "Aumentar la basura", "Quemar más plástico"],
    answer: 1
  }
];

function loadUsers() {
  return JSON.parse(localStorage.getItem(storageKey)) || [];
}

function saveUsers(users) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}

function registerUser() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const role = document.getElementById('reg-role').value;
  if (!username || !password) return alert('Completa todos los campos');

  const users = loadUsers();
  if (users.find(u => u.username === username)) return alert('Usuario ya existe');

  users.push({ username, password, role, pounds: 0, points: 0 });
  saveUsers(users);
  alert('Registro exitoso. Ahora puedes iniciar sesión');
  toggleRegister(false);
}

function loginUser() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return alert('Usuario o contraseña incorrectos');
  currentUser = user;
  if (user.role === 'student') showStudentPanel(user);
  else showTeacherPanel();
}

function showStudentPanel(user) {
  hideAll();
  document.getElementById('student-name').textContent = user.username;
  document.getElementById('student-pounds').textContent = user.pounds;
  document.getElementById('student-points').textContent = user.points;
  document.getElementById('student-bonus').textContent = Math.floor(user.points / 40) * 5;
  document.getElementById('student-screen').classList.remove('hidden');
}

function showTeacherPanel() {
  hideAll();
  const users = loadUsers().filter(u => u.role === 'student');
  const container = document.getElementById('teacher-students');
  container.innerHTML = '<h3>Estudiantes registrados:</h3>';
  users.forEach(u => {
    container.innerHTML += `<p>${u.username} - Libras: ${u.pounds}, Puntos: ${u.points}, Extra: ${Math.floor(u.points / 40) * 5}</p>`;
  });
  document.getElementById('teacher-screen').classList.remove('hidden');
}

function logout() {
  currentUser = null;
  hideAll();
  document.getElementById('login-screen').classList.remove('hidden');
}

function toggleRegister(show) {
  document.getElementById('login-screen').classList.toggle('hidden', show);
  document.getElementById('register-screen').classList.toggle('hidden', !show);
}

function hideAll() {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
}

function startGame() {
  currentQuestion = 0;
  hideAll();
  document.getElementById('game-screen').classList.remove('hidden');
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById('question').textContent = q.q;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(i);
    optionsDiv.appendChild(btn);
  });
  document.getElementById('game-result').textContent = '';
}

function checkAnswer(index) {
  const correct = questions[currentQuestion].answer;
  const result = document.getElementById('game-result');
  if (index === correct) {
    result.textContent = '¡Correcto! +5 puntos';
    currentUser.points += 5;
    const users = loadUsers();
    const i = users.findIndex(u => u.username === currentUser.username);
    users[i] = currentUser;
    saveUsers(users);
    document.getElementById('student-points').textContent = currentUser.points;
    document.getElementById('student-bonus').textContent = Math.floor(currentUser.points / 40) * 5;
  } else {
    result.textContent = 'Incorrecto. Intenta otra pregunta';
  }
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    alert('¡Has completado el juego!');
    exitGame();
  }
}

function exitGame() {
  showStudentPanel(currentUser);
}

function addPoundsToStudent() {
  const username = document.getElementById('input-username').value.trim();
  const pounds = parseFloat(document.getElementById('input-pounds').value);
  if (!username || isNaN(pounds) || pounds <= 0) return alert('Datos inválidos');

  const users = loadUsers();
  const i = users.findIndex(u => u.username === username && u.role === 'student');
  if (i === -1) return alert('Estudiante no encontrado');

  users[i].pounds += pounds;
  users[i].points += pounds * 5;
  saveUsers(users);
  alert('Libras registradas correctamente');
  showTeacherPanel();
}
