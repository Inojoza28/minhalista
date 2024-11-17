// Seleção de elementos
const itemInput = document.getElementById('item-input');
const addButton = document.getElementById('add-button');
const list = document.getElementById('shopping-list');
const downloadButton = document.getElementById('download-button');
const printButton = document.getElementById('print-button');
const microphoneButton = document.getElementById('microphone-button');
const emptyMessage = document.getElementById('empty-message');
const removeAllButton = document.getElementById('remove-all-button'); // Botão para remover todos
const totalItemsContainer = document.getElementById('total-items'); // Contêiner do total de itens
const totalItems = document.getElementById('item-count'); // Total de itens

// Configuração do reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'pt-BR'; // Configurar idioma
recognition.interimResults = false;
recognition.continuous = false;

// Função para adicionar item
function addItem(text, completed = false) {
  if (!text.trim()) return alert('Por favor, insira um item.');

  const listItem = document.createElement('li');
  listItem.classList.add('list-item'); // Classe para animação
  if (completed) listItem.classList.add('completed'); // Marca como concluído se necessário

  listItem.innerHTML = `
    <input type="checkbox" class="complete-checkbox" ${completed ? 'checked' : ''}>
    <span>${text}</span>
    <button class="delete-button">
      <i class="fas fa-trash"></i>
    </button>
  `;

  // Adiciona animação e item à lista
  list.appendChild(listItem);

  // Adiciona evento ao botão de excluir
  listItem.querySelector('.delete-button').addEventListener('click', () => removeItem(listItem));

  // Adiciona evento ao checkbox de concluir
  listItem.querySelector('.complete-checkbox').addEventListener('change', (event) => toggleComplete(event, listItem));

  updateEmptyMessage();
  updateItemCount(); // Atualiza o total de itens
  updateRemoveAllButton(); // Atualiza o botão de "Remover Todos"
  saveToLocalStorage();
}

// Função para alternar o estado de concluído
function toggleComplete(event, listItem) {
  if (event.target.checked) {
    listItem.classList.add('completed'); // Marca como concluído
  } else {
    listItem.classList.remove('completed'); // Remove a marcação
  }
  saveToLocalStorage(); // Atualiza o localStorage
}

// Função para remover item
function removeItem(listItem) {
  listItem.classList.add('removing'); // Adiciona classe de animação para remoção
  setTimeout(() => {
    listItem.remove();
    updateEmptyMessage();
    updateItemCount(); // Atualiza o total de itens
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
    updateItemCount(); // Atualiza o total de itens
    updateRemoveAllButton(); // Atualiza o botão de "Remover Todos"
    saveToLocalStorage();
  }
}

// Função para salvar lista no localStorage
function saveToLocalStorage() {
  const items = Array.from(list.children).map(item => ({
    text: item.querySelector('span').textContent,
    completed: item.querySelector('.complete-checkbox').checked
  }));
  localStorage.setItem('shoppingList', JSON.stringify(items));
}

// Função para carregar lista do localStorage
function loadFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
  items.forEach(item => addItem(item.text, item.completed));
}

// Função para atualizar o total de itens
function updateItemCount() {
  const count = list.children.length;

  // Atualiza o valor do contador
  totalItems.textContent = count;

  // Exibe ou oculta o contador com base no número de itens
  totalItemsContainer.style.display = count > 0 ? 'block' : 'none';
}

// Função para baixar lista aprimorada
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

// Permitir adicionar item ao pressionar "Enter"
itemInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { // Verifica se a tecla pressionada foi "Enter"
    addItem(itemInput.value); // Adiciona o item
    itemInput.value = ''; // Limpa o campo de entrada
    itemInput.focus(); // Mantém o foco no campo de entrada
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
updateItemCount(); // Atualiza o total de itens ao carregar a página
updateRemoveAllButton(); // Atualiza o botão "Remover Todos" ao carregar a página

// Seleção de elementos
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeButton = helpModal.querySelector('.close-button');

// Evento para abrir o modal
helpButton.addEventListener('click', () => {
  helpModal.style.display = 'flex';
});

// Evento para fechar o modal
closeButton.addEventListener('click', () => {
  helpModal.style.display = 'none';
});

// Fechar modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
  if (event.target === helpModal) {
    helpModal.style.display = 'none';
  }
});
