// Seleção de elementos principais
const itemInput = document.getElementById('item-input');
const addButton = document.getElementById('add-button');
const list = document.getElementById('shopping-list');
const downloadButton = document.getElementById('download-button');
const printButton = document.getElementById('print-button');
const microphoneButton = document.getElementById('microphone-button');
const emptyMessage = document.getElementById('empty-message');
const removeAllButton = document.getElementById('remove-all-button');
const totalItemsContainer = document.getElementById('total-items');
const totalItems = document.getElementById('item-count');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeButton = helpModal.querySelector('.close-button');

// Configuração do reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.interimResults = false;
recognition.continuous = false;

// Adicionar item à lista
function addItem(text, completed = false) {
  if (!text.trim()) {
    alert('Por favor, insira um item.');
    return;
  }

  const listItem = document.createElement('li');
  listItem.classList.add('list-item');
  if (completed) listItem.classList.add('completed');

  listItem.innerHTML = `
    <input type="checkbox" class="complete-checkbox" ${completed ? 'checked' : ''}>
    <span>${text}</span>
    <button class="delete-button">
      <i class="fas fa-trash"></i>
    </button>
  `;

  list.appendChild(listItem);

  listItem.querySelector('.delete-button').addEventListener('click', () => removeItem(listItem));
  listItem.querySelector('.complete-checkbox').addEventListener('change', (event) => toggleComplete(event, listItem));

  updateEmptyMessage();
  updateItemCount();
  updateRemoveAllButton();
  saveToLocalStorage();
}

// Alternar estado de conclusão
function toggleComplete(event, listItem) {
  listItem.classList.toggle('completed', event.target.checked);
  saveToLocalStorage();
}

// Remover item da lista
function removeItem(listItem) {
  listItem.classList.add('removing');
  setTimeout(() => {
    listItem.remove();
    updateEmptyMessage();
    updateItemCount();
    updateRemoveAllButton();
    saveToLocalStorage();
  }, 300);
}

// Remover todos os itens da lista
function removeAllItems() {
  if (confirm('Tem certeza de que deseja remover todos os itens da lista?')) {
    list.innerHTML = '';
    updateEmptyMessage();
    updateItemCount();
    updateRemoveAllButton();
    saveToLocalStorage();
  }
}

// Atualizar mensagem de lista vazia
function updateEmptyMessage() {
  emptyMessage.style.display = list.children.length === 0 ? 'block' : 'none';
}

// Atualizar contador de itens
function updateItemCount() {
  const count = list.children.length;
  totalItems.textContent = count;
  totalItemsContainer.style.display = count > 0 ? 'block' : 'none';
}

// Atualizar exibição do botão "Remover Todos"
function updateRemoveAllButton() {
  removeAllButton.style.display = list.children.length >= 3 ? 'inline-block' : 'none';
}

// Salvar lista no localStorage
function saveToLocalStorage() {
  const items = Array.from(list.children).map(item => ({
    text: item.querySelector('span').textContent,
    completed: item.querySelector('.complete-checkbox').checked,
  }));
  localStorage.setItem('shoppingList', JSON.stringify(items));
}

// Carregar lista do localStorage
function loadFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
  items.forEach(item => addItem(item.text, item.completed));
}

// Baixar lista como arquivo
function downloadList() {
  const items = Array.from(list.children).map((item) => {
    const text = item.querySelector('span').textContent;
    const completed = item.querySelector('.complete-checkbox').checked;
    return { text, completed };
  });

  if (items.length === 0) {
    alert('A lista está vazia! Adicione itens antes de baixar.');
    return;
  }

  // Data e hora formatada
  const date = new Date();
  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Separação de itens concluídos e pendentes
  const completedItems = items.filter((item) => item.completed).map((item) => `- ${item.text}`);
  const pendingItems = items.filter((item) => !item.completed).map((item) => `- ${item.text}`);

  // Cabeçalho
  const header = `Minha Lista de Compras\nCriada em: ${formattedDate} às ${formattedTime}\nTotal de Itens: ${items.length}\n\n`;

  // Conteúdo dos itens
  const completedSection = completedItems.length > 0 
    ? `Itens Concluídos:\n${completedItems.join('\n')}\n\n` 
    : 'Itens Concluídos:\nNenhum item concluído.\n\n';

  const pendingSection = pendingItems.length > 0 
    ? `Itens Pendentes:\n${pendingItems.join('\n')}\n\n` 
    : 'Itens Pendentes:\nNenhum item pendente.\n\n';

  // Texto final
  const content = header + pendingSection + completedSection;

  // Geração e download do arquivo
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'minha_lista_de_compras.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Função de impressão
function printList() {
  window.print();
}

// Ocultar botão de ajuda durante impressão
window.addEventListener('beforeprint', () => {
  helpButton.style.display = 'none';
});

window.addEventListener('afterprint', () => {
  helpButton.style.display = 'block';
});

// Eventos de interação
addButton.addEventListener('click', () => {
  addItem(itemInput.value);
  itemInput.value = '';
  itemInput.focus();
});

itemInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addItem(itemInput.value);
    itemInput.value = '';
    itemInput.focus();
  }
});

list.addEventListener('click', (event) => {
  if (event.target.closest('.delete-button')) {
    const listItem = event.target.closest('li');
    removeItem(listItem);
  }
});

removeAllButton.addEventListener('click', removeAllItems);
downloadButton.addEventListener('click', downloadList);
printButton.addEventListener('click', printList);

microphoneButton.addEventListener('click', () => {
  recognition.start(); // Começa a ouvir a fala do usuário.
  microphoneButton.classList.add('listening'); // Adiciona um estilo visual indicando que está "ouvindo".
});

recognition.addEventListener('result', (event) => {
  const spokenText = event.results[0][0].transcript.trim(); // Captura o texto falado.
  if (spokenText) addItem(spokenText); // Adiciona o texto capturado em algum lugar.
  microphoneButton.classList.remove('listening'); // Remove o estilo de "ouvindo".
});

recognition.addEventListener('error', () => {
  alert('Erro ao reconhecer fala. Por favor, tente novamente.'); // Mostra uma mensagem de erro.
  microphoneButton.classList.remove('listening'); // Remove o estilo de "ouvindo".
});

recognition.addEventListener('end', () => {
  microphoneButton.classList.remove('listening'); // Remove o estilo de "ouvindo".
});

// Controle do modal de ajuda
helpButton.addEventListener('click', () => {
  helpModal.style.display = 'flex';
});

closeButton.addEventListener('click', () => {
  helpModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === helpModal) {
    helpModal.style.display = 'none';
  }
});

// Inicialização
loadFromLocalStorage();
updateEmptyMessage();
updateItemCount();
updateRemoveAllButton();