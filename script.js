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
  const items = Array.from(list.children).map((item, index) => {
    const text = item.querySelector('span').textContent;
    const completed = item.querySelector('.complete-checkbox').checked ? ' (Concluído)' : '';
    return `${index + 1}. ${text}${completed}`;
  });

  if (items.length === 0) {
    alert('A lista está vazia! Adicione itens antes de baixar.');
    return;
  }

  const date = new Date();
  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
