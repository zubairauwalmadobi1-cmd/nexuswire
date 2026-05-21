const state = {
    user: null,
    activeChatId: 'chat-1',
    isTyping: false,
};

const sampleChats = [
    {
        id: 'chat-1',
        title: 'Ava',
        subtitle: 'Online',
        messages: [
            { sender: 'other', text: 'Hey! Ready for our next voice call?', time: '2:14 PM' },
            { sender: 'me', text: 'Absolutely. I just finished the status update flow.', time: '2:16 PM' },
            { sender: 'other', text: 'Nice, Chatty is looking fire 🔥', time: '2:17 PM' },
        ],
    },
    {
        id: 'chat-2',
        title: 'Design Squad',
        subtitle: '3 members',
        messages: [
            { sender: 'other', text: 'Group call after the launch? We can review stickers.', time: '1:09 PM' },
            { sender: 'me', text: 'Yes, let's jump in 20 minutes.', time: '1:11 PM' },
        ],
    },
    {
        id: 'chat-3',
        title: 'Sam',
        subtitle: 'Typing...',
        messages: [
            { sender: 'me', text: 'Send over the image assets.', time: '10:38 AM' },
            { sender: 'other', text: 'On it — uploading now.', time: '10:39 AM' },
        ],
    },
];

const sampleStatus = [
    { label: 'Available', text: 'Working on the animated UI. 🚀' },
    { label: 'Busy', text: 'Do not disturb: designing chat interactions.' },
];

const toast = document.querySelector('.toast');
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function getUserStorage() {
    const saved = localStorage.getItem('chattyUser');
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

function saveUserStorage(user) {
    localStorage.setItem('chattyUser', JSON.stringify(user));
}

function setView(viewId) {
    document.querySelectorAll('[data-view]').forEach((view) => {
        view.classList.toggle('view-hidden', view.dataset.view !== viewId);
    });
}

function updateAuthTab(tab) {
    document.querySelectorAll('.tab-button').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });
    document.querySelectorAll('[data-auth-panel]').forEach((panel) => {
        panel.classList.toggle('view-hidden', panel.dataset.authPanel !== tab);
    });
}

function renderChats() {
    const list = document.querySelector('.chats-list');
    if (!list) return;
    list.innerHTML = sampleChats.map(chat => {
        const activeClass = chat.id === state.activeChatId ? 'active' : '';
        return `
            <div class="chat-item ${activeClass}" data-chat-id="${chat.id}">
                <h4>${chat.title}</h4>
                <p>${chat.subtitle} · ${chat.messages[chat.messages.length - 1].text}</p>
            </div>
        `;
    }).join('');
}

function renderMessages() {
    const chat = sampleChats.find((item) => item.id === state.activeChatId);
    const messageArea = document.querySelector('.message-area');
    const chatHeader = document.querySelector('.chat-window .chat-header h3');
    const typingIndicator = document.querySelector('.typing-indicator');

    if (!chat || !messageArea || !chatHeader) return;
    chatHeader.textContent = chat.title;
    messageArea.innerHTML = chat.messages.map(message => {
        const className = message.sender === 'me' ? 'message-bubble message-user' : 'message-bubble message-guest';
        return `
            <div class="${className}">
                ${message.text}
                <div class="message-meta">
                    <span>${message.sender === 'me' ? 'You' : chat.title}</span>
                    <span>${message.time}</span>
                </div>
            </div>
        `;
    }).join('');

    if (chat.subtitle.includes('Typing')) {
        typingIndicator.classList.remove('view-hidden');
    } else {
        typingIndicator.classList.add('view-hidden');
    }
}

function renderProfile() {
    const user = state.user;
    if (!user) return;
    const avatar = document.querySelector('.avatar-circle');
    const nameElement = document.querySelector('#profile-name');
    const emailElement = document.querySelector('#profile-email');
    const phoneElement = document.querySelector('#profile-phone');
    const statusesContainer = document.querySelector('.profile-statuses');
    const statusFormInput = document.querySelector('#status-text');
    const updateName = document.querySelector('#edit-name');
    const updatePhone = document.querySelector('#edit-phone');
    const updateEmail = document.querySelector('#edit-email');

    avatar.textContent = user.name ? user.name.slice(0, 2).toUpperCase() : 'CW';
    nameElement.textContent = user.name || 'Chatty User';
    emailElement.textContent = user.email || 'No email set';
    phoneElement.textContent = user.phone || 'No phone set';
    statusesContainer.innerHTML = (user.statuses || sampleStatus).map(status => `
        <article class="status-badge">
            <div class="badge-pill">${status.label}</div>
            <span>${status.text}</span>
        </article>
    `).join('');
    statusFormInput.value = '';
    updateName.value = user.name || '';
    updatePhone.value = user.phone || '';
    updateEmail.value = user.email || '';
}

function handleAuthSuccess(user) {
    state.user = user;
    saveUserStorage(user);
    updateProfilePanel();
    setView('dashboard');
    showToast(`Welcome back, ${user.name}!`);
}

function updateProfilePanel() {
    renderProfile();
    renderChats();
    renderMessages();
}

function initAuthForms() {
    const signInForm = document.querySelector('#signin-form');
    const signUpButton = document.querySelector('.signup-btn');
    const authButtons = document.querySelectorAll('.auth-action');
    const switchViewButtons = document.querySelectorAll('[data-main-view]');
    const chatForm = document.querySelector('#chat-send-form');
    const profileForm = document.querySelector('#profile-edit-form');
    const statusForm = document.querySelector('#status-add-form');

    authButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const action = button.dataset.action;
            if (action === 'signin' || action === 'signup') {
                setView('auth');
                const usernameInput = document.querySelector('#username');
                if (usernameInput) usernameInput.focus();
            }
        });
    });

    switchViewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.mainView;
            setView(view);
        });
    });

    if (signUpButton) {
        signUpButton.addEventListener('click', (event) => {
            event.preventDefault();
            const username = document.querySelector('#username').value.trim();
            const contact = document.querySelector('#contact').value.trim();
            const password = document.querySelector('#password').value.trim();

            if (!username || !contact || password.length < 4) {
                return showToast('Enter a username, contact, and a password.');
            }

            const user = {
                name: username,
                email: contact.includes('@') ? contact : '',
                phone: contact.includes('@') ? '' : contact,
                password,
                statuses: sampleStatus,
            };
            handleAuthSuccess(user);
        });
    }

    if (signInForm) {
        signInForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const form = event.target;
            const usernameVal = form.username ? form.username.value.trim() : '';
            const contactVal = form.contact ? form.contact.value.trim() : '';
            const identity = usernameVal || contactVal;
            const password = form.password ? form.password.value.trim() : '';
            const storedUser = getUserStorage();

            if (!storedUser) {
                return showToast('No account found yet — create one first.');
            }

            const isMatch = (
                storedUser.name === identity ||
                storedUser.email === identity ||
                storedUser.phone === identity
            ) && storedUser.password === password;

            if (!isMatch) {
                return showToast('Invalid login details.');
            }

            handleAuthSuccess(storedUser);
        });
    }

    // Forgot password behaviour (mock)
    const forgotLink = document.querySelector('.forgot a');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            const contact = prompt('Enter your email or phone to reset password:');
            if (!contact) return showToast('Password reset cancelled.');
            showToast('Password reset link/OTP sent (mock).');
        });
    }

    // Logout
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="logout"]');
        if (!btn) return;
        localStorage.removeItem('chattyUser');
        state.user = null;
        setView('landing');
        showToast('Signed out');
    });

    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.querySelector('#chat-input');
        const text = input.value.trim();
        if (!text) return;

        const chat = sampleChats.find((item) => item.id === state.activeChatId);
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chat.messages.push({ sender: 'me', text, time });
        input.value = '';
        renderMessages();
        showToast('Message sent');
    });

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = event.target['edit-name'].value.trim();
        const phone = event.target['edit-phone'].value.trim();
        const email = event.target['edit-email'].value.trim();

        if (!name || !email || !phone) {
            return showToast('Please complete profile fields.');
        }

        state.user = { ...state.user, name, email, phone };
        saveUserStorage(state.user);
        renderProfile();
        showToast('Profile updated');
    });

    statusForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const label = event.target['status-label'].value.trim() || 'Status';
        const text = event.target['status-text'].value.trim();
        if (!text) return showToast('Add a status message first.');

        state.user.statuses = state.user.statuses || [];
        state.user.statuses.unshift({ label, text });
        saveUserStorage(state.user);
        renderProfile();
        showToast('Status added');
    });

    document.querySelector('.chats-list').addEventListener('click', (event) => {
        const chatItem = event.target.closest('.chat-item');
        if (!chatItem) return;
        state.activeChatId = chatItem.dataset.chatId;
        sampleChats.forEach((chat) => {
            if (chat.id === state.activeChatId) chat.subtitle = chat.subtitle.replace('Typing...', 'Online');
        });
        renderChats();
        renderMessages();
    });
}

function init() {
    const storedUser = getUserStorage();
    if (storedUser) {
        state.user = storedUser;
        setView('dashboard');
        updateProfilePanel();
    } else {
        setView('landing');
    }
    initAuthForms();
    updateAuthTab('signin');
    renderChats();
    renderMessages();
}

window.addEventListener('DOMContentLoaded', init);
