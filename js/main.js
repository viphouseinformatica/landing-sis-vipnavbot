document.getElementById('contact-form').onsubmit = function(event) {
    event.preventDefault();

    const btn = this.querySelector('.send-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Enviando...';
    btn.disabled = true; // Evita cliques duplos

    // Substitua pelos seus IDs reais do painel EmailJS
    const serviceID = 'default_service'; 
    const templateID = 'seu_template_id';

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            btn.innerText = originalText;
            btn.disabled = false;
            alert('Mensagem enviada com sucesso! Responderemos em breve.');
            this.reset();
        }, (err) => {
            btn.innerText = originalText;
            btn.disabled = false;
            alert('Erro ao enviar: ' + JSON.stringify(err));
        });
};

// Efeito de mudar o header ao rolar
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(75, 83, 32, 0.95)';
        header.style.padding = '0.5rem 5%';
    } else {
        header.style.backgroundColor = '#4B5320';
        header.style.padding = '1rem 5%';
    }
});

const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const userId = "user_" + Math.random().toString(36).substr(2, 9);

// Abrir/Fechar Chat
closeChat.style.cursor = 'pointer';
chatToggle.onclick = () => chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
closeChat.onclick = () => chatContainer.style.display = 'none';

// 1. Função para Mostrar/Esconder "Digitando..."
function toggleTyping(show) {
    let typingElem = document.getElementById('typing-indicator');

    if (!typingElem) {
        typingElem = document.createElement('div');
        typingElem.id = 'typing-indicator';
        typingElem.className = 'msg bot typing';
        typingElem.innerHTML = 'O assistente está a processar<span></span>';
        chatMessages.appendChild(typingElem);
    }

    typingElem.style.display = show ? 'block' : 'none';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 2. Função para Adicionar Mensagens (com Markdown)
function appendMessage(content, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;

    if (type === 'bot') {
        // Converte Markdown para HTML usando a lib Marked
        let rawHtml = marked.parse(content);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtml;

        // Força links a abrirem em nova aba
        const links = tempDiv.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        div.innerHTML = tempDiv.innerHTML;
    } else {
        div.innerText = content;
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 3. Função Principal de Envio (Conectada ao FastAPI)
async function sendToBot() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    userInput.value = '';

    toggleTyping(true); // Ativa o "digitando"

    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, mensagem: message })
        });
        const data = await response.json();

        toggleTyping(false); // Desativa o "digitando"
        appendMessage(data.resposta, 'bot');
    } catch (error) {
        toggleTyping(false);
        appendMessage("⚠️ No momento, estou enfrentando uma instabilidade técnica para processar sua solicitação. Por favor, tente novamente em alguns instantes.", 'bot');
    }
}

// Eventos de clique e teclado
document.getElementById('send-chat-btn').onclick = sendToBot;
userInput.onkeypress = (e) => { if (e.key === 'Enter') sendToBot(); };

// Mensagem de Boas-vindas
window.onload = () => {
    appendMessage("Olá! Sou seu assistente de navegação do Portal. Como posso te ajudar hoje?", 'bot');
};