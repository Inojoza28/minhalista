// Seleção do botão de alternância
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Verificar se há preferência salva no localStorage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

// Alternar entre os modos ao clicar
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  // Alternar o ícone
  const icon = darkModeToggle.querySelector('i');
  if (document.body.classList.contains('dark-mode')) {
    icon.classList.replace('fa-moon', 'fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
    localStorage.setItem('theme', 'light');
  }
});