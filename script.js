// Seleção de elementos
const itemInput = document.getElementById('item-input');
const addButton = document.getElementById('add-button');
const list = document.getElementById('shopping-list');
const downloadButton = document.getElementById('download-button');
const printButton = document.getElementById('print-button');
const microphoneButton = document.getElementById('microphone-button');
const emptyMessage = document.getElementById('empty-message');
const removeAllButton = document.getElementById('remove-all-button'); // Botão para remover todos

// Configuração do reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'pt-BR'; // Configurar idioma
recognition.interimResults = false;
recognition.continuous = false;

// Função para adicionar item
function addItem(text) {
  if (!text.trim()) return alert('Por favor, insira um item.');

  const listItem = document.createElement('li');
  listItem.classList.add('list-item'); // Classe para animação
  listItem.innerHTML = `
    <span>${text}</span>
    <button class="delete-button">
      <i class="fas fa-trash"></i>
    </button>
  `;

  // Adiciona animação e item à lista
  list.appendChild(listItem);

  // Adiciona evento ao botão de excluir
  listItem.querySelector('.delete-button').addEventListener('click', () => removeItem(listItem));

  updateEmptyMessage();
  updateRemoveAllButton(); // Atualiza o botão de "Remover Todos"
  saveToLocalStorage();
}

// Função para remover item
function removeItem(listItem) {
  listItem.classList.add('removing'); // Adiciona classe de animação para remoção
  setTimeout(() => {
    listItem.remove();
    updateEmptyMessage();
    updateRemoveAllButton(); // Atualiza o botão de "Remover Todos"
    saveToLocalStorage();
  }, 300); // Tempo igual ao da animação CSS
}

// Função para remover todos os itens
function removeAllItems() {
  const confirmRemoval = confirm('Tem certeza de que deseja remover todos os itens da lista?');
  if (confirmRemoval) {
    list.innerHTML = ''; // Remove todos os itens da lista
    updateEmptyMessage();
    updateRemoveAllButton(); // Atualiza o botão de "Remover Todos"
    saveToLocalStorage();
  }
}

// Função para salvar lista no localStorage
function saveToLocalStorage() {
  const items = Array.from(list.children).map(item => item.querySelector('span').textContent);
  localStorage.setItem('shoppingList', JSON.stringify(items));
}

// Função para carregar lista do localStorage
function loadFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
  items.forEach(addItem);
}

// Função para baixar lista aprimorada
function downloadList() {
    const items = Array.from(list.children).map((item, index) => {
      const text = item.querySelector('span').textContent;
      return `${index + 1}. ${text}`; // Adiciona numeração aos itens
    });
  
    if (items.length === 0) {
      alert('A lista está vazia! Adicione itens antes de baixar.');
      return;
    }
  
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  
    const header = `Lista de Compras\nCriada em: ${formattedDate}\nTotal de Itens: ${items.length}\n\nItens:\n`;
    const content = header + items.join('\n');
  
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista_de_compras.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
  

// Função para imprimir lista
function printList() {
  window.print();
}

// Função para atualizar mensagem de lista vazia
function updateEmptyMessage() {
  emptyMessage.style.display = list.children.length === 0 ? 'block' : 'none';
}

// Função para exibir ou ocultar o botão "Remover Todos"
function updateRemoveAllButton() {
  removeAllButton.style.display = list.children.length >= 3 ? 'inline-block' : 'none';
}

// Eventos
addButton.addEventListener('click', () => {
  addItem(itemInput.value);
  itemInput.value = '';
  itemInput.focus(); // Mantém o foco no campo de entrada
});

list.addEventListener('click', (event) => {
  if (event.target.closest('.delete-button')) {
    const listItem = event.target.closest('li');
    removeItem(listItem);
  }
});

removeAllButton.addEventListener('click', removeAllItems); // Evento para remover todos os itens

downloadButton.addEventListener('click', downloadList);
printButton.addEventListener('click', printList);

microphoneButton.addEventListener('click', () => {
  recognition.start();
  microphoneButton.classList.add('listening');
});

recognition.addEventListener('result', (event) => {
  const spokenText = event.results[0][0].transcript.trim();
  if (spokenText) addItem(spokenText);
  microphoneButton.classList.remove('listening');
});

recognition.addEventListener('error', () => {
  alert('Erro ao reconhecer fala. Por favor, tente novamente.');
  microphoneButton.classList.remove('listening');
});

recognition.addEventListener('end', () => {
  microphoneButton.classList.remove('listening');
});

// Inicialização
loadFromLocalStorage();
updateEmptyMessage();
updateRemoveAllButton(); // Atualiza o botão "Remover Todos" ao carregar a página
