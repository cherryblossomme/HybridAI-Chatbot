// ==========================================
// CHAT SEARCH ELEMENTS
// ==========================================

const chatSearchInput =
    document.getElementById(
        "chat-search-input"
    );

const chatSearchClear =
    document.getElementById(
        "chat-search-clear"
    );
// ==========================================
// DOM ELEMENTS
// ==========================================

const chatBox =
    document.getElementById("chat-box");

const userInput =
    document.getElementById("user-input");

    const exportChatButton =
    document.getElementById("export-chat-button");

const sendButton =
    document.getElementById("send-button");

const voiceButton =
    document.getElementById("voice-button");

const fileButton =
    document.getElementById("file-button");

const fileInput =
    document.getElementById("file-input");

const clearButton =
    document.getElementById("clear-button");

const aiStatus =
    document.getElementById("ai-status");

const newChatButton =
    document.getElementById("new-chat-button");

const sidebarClearButton =
    document.getElementById("sidebar-clear-button");

const settingsButton =
    document.getElementById("settings-button");

const settingsOverlay =
    document.getElementById("settings-overlay");

const closeSettings =
    document.getElementById("close-settings");

const darkModeToggle =
    document.getElementById("dark-mode-toggle");

// ==========================================
// MARKDOWN RENDERER
// ==========================================

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function renderMarkdown(text) {

    if (!text) {
        return "";
    }

    let html = escapeHTML(String(text));

    // --------------------------------------
    // Code blocks
    // --------------------------------------

    const codeBlocks = [];

    html = html.replace(
        /```(\w*)\n?([\s\S]*?)```/g,
        function (match, language, code) {

            const index =
                codeBlocks.length;

            codeBlocks.push({
                language:
                    language || "code",
                code:
                    code.trim()
            });

            return `@@CODE_BLOCK_${index}@@`;
        }
    );


    // --------------------------------------
    // Inline code
    // --------------------------------------

    html = html.replace(
        /`([^`\n]+)`/g,
        "<code class=\"inline-code\">$1</code>"
    );


    // --------------------------------------
    // Bold
    // --------------------------------------

    html = html.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // --------------------------------------
    // Italic
    // --------------------------------------

    html = html.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    // --------------------------------------
    // Headings
    // --------------------------------------

    html = html.replace(
        /^### (.*)$/gm,
        "<h4>$1</h4>"
    );

    html = html.replace(
        /^## (.*)$/gm,
        "<h3>$1</h3>"
    );

    html = html.replace(
        /^# (.*)$/gm,
        "<h2>$1</h2>"
    );


    // --------------------------------------
    // Bullet lists
    // --------------------------------------

    html = html.replace(
        /^[*-] (.*)$/gm,
        "<li>$1</li>"
    );

    html = html.replace(
        /(<li>.*<\/li>)/gs,
        "<ul>$1</ul>"
    );


    // --------------------------------------
    // Numbered lists
    // --------------------------------------

    html = html.replace(
        /^\d+\. (.*)$/gm,
        "<li>$1</li>"
    );


    // --------------------------------------
    // Line breaks
    // --------------------------------------

    html = html.replace(
        /\n/g,
        "<br>"
    );


    // --------------------------------------
    // Restore code blocks
    // --------------------------------------

    codeBlocks.forEach(
        function (block, index) {

            const safeCode =
                escapeHTML(block.code);

            const codeHTML = `
                <div class="code-block">

                    <div class="code-header">

                        <span class="code-language">
                            ${escapeHTML(block.language)}
                        </span>

                        <button
                            class="copy-code-button"
                            type="button"
                            onclick="copyCode(this)"
                        >
                            📋 Copy
                        </button>

                    </div>

                    <pre><code>${safeCode}</code></pre>

                </div>
            `;

            html = html.replace(
                `@@CODE_BLOCK_${index}@@`,
                codeHTML
            );
        }
    );


    return html;
}


// ==========================================
// COPY CODE
// ==========================================

async function copyCode(button) {

    const codeBlock =
        button
            .closest(".code-block")
            .querySelector("code");

    if (!codeBlock) {
        return;
    }

    const code =
        codeBlock.innerText;

    try {

        await navigator.clipboard.writeText(
            code
        );

        const originalText =
            button.innerHTML;

        button.innerHTML =
            "✓ Copied";

        setTimeout(
            function () {
                button.innerHTML =
                    originalText;
            },
            1500
        );

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

        button.innerHTML =
            "❌ Failed";

        setTimeout(
            function () {
                button.innerHTML =
                    "📋 Copy";
            },
            1500
        );
    }
}
// ==========================================
// STORAGE KEYS
// ==========================================

const SESSIONS_KEY =
    "hybridAISessions";

const CURRENT_SESSION_KEY =
    "hybridAICurrentSession";

const THEME_KEY =
    "hybridAITheme";


// ==========================================
// CHAT VARIABLES
// ==========================================

let sessions = [];

let currentSessionId = null;

let chatHistory = [];


// ==========================================
// CURRENT UPLOADED DOCUMENT
// ==========================================

let uploadedDocument = null;


// ==========================================
// CREATE UNIQUE ID
// ==========================================

function createId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


// ==========================================
// CURRENT TIME
// ==========================================

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================
// AI STATUS
// ==========================================

function updateAIStatus(status) {

    if (!aiStatus) {
        return;
    }

    if (status === "thinking") {

        aiStatus.textContent =
            "🟡 AI is thinking...";

    }

    else if (status === "local") {

        aiStatus.textContent =
            "🟢 Local Qwen AI";

    }

    else if (status === "offline") {

        aiStatus.textContent =
            "🔵 Offline AI";

    }

    else {

        aiStatus.textContent =
            "🟢 HybridAI Ready";

    }

}


// ==========================================
// SAVE SESSIONS
// ==========================================

function saveSessions() {

    localStorage.setItem(
        SESSIONS_KEY,
        JSON.stringify(sessions)
    );

}


// ==========================================
// SAVE CURRENT SESSION
// ==========================================

function saveCurrentSessionId() {

    if (currentSessionId) {

        localStorage.setItem(
            CURRENT_SESSION_KEY,
            currentSessionId
        );

    }

}


// ==========================================
// GET CURRENT SESSION
// ==========================================

function getCurrentSession() {

    return sessions.find(
        function(session) {

            return (
                session.id ===
                currentSessionId
            );

        }
    );

}


// ==========================================
// CREATE NEW SESSION
// ==========================================

function createNewSession() {

    const newSession = {

        id:
            createId(),

        title:
            "New Chat",

        messages:
            [],

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    sessions.unshift(
        newSession
    );


    currentSessionId =
        newSession.id;


    chatHistory = [];


    // New chat should not keep
    // the previous document.

    uploadedDocument = null;


    saveSessions();

    saveCurrentSessionId();

    renderRecentChats();

}


// ==========================================
// UPDATE CURRENT SESSION
// ==========================================

function updateCurrentSession() {

    const session =
        getCurrentSession();


    if (!session) {

        return;

    }


    session.messages =
        chatHistory;


    session.updatedAt =
        Date.now();


    const firstUserMessage =
        chatHistory.find(
            function(item) {

                return (
                    item.sender ===
                    "user"
                );

            }
        );


    if (
        firstUserMessage &&
        firstUserMessage.message
    ) {

        if (
            !session.customTitle
        ) {

            let title =
                firstUserMessage.message.trim();


            if (
                title.length > 30
            ) {

                title =
                    title.substring(
                        0,
                        30
                    ) + "...";

            }


            session.title =
                title;

        }

    }


    saveSessions();

    saveCurrentSessionId();

    renderRecentChats();

}


// ==========================================
// CONVERT FRONTEND HISTORY
// TO AI HISTORY
// ==========================================

function getAIConversationHistory() {

    return chatHistory
        .map(
            function(item) {

                if (
                    item.sender === "user"
                ) {

                    return {

                        role:
                            "user",

                        content:
                            item.message

                    };

                }


                if (
                    item.sender === "bot"
                ) {

                    return {

                        role:
                            "assistant",

                        content:
                            item.message

                    };

                }


                return null;

            }
        )
        .filter(
            function(item) {

                return item !== null;

            }
        )
        .slice(-10);

}


// ==========================================
// ADD MESSAGE TO UI
// ==========================================

function addMessage(
    message,
    sender,
    mode = "",
    time = null
) {

    const welcomeScreen =
        document.getElementById(
            "welcome-screen"
        );


    if (welcomeScreen) {

        welcomeScreen.remove();

    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.classList.add(
        "message"
    );


    if (sender === "user") {

        messageElement.classList.add(
            "user-message"
        );

    }

    else {

        messageElement.classList.add(
            "bot-message"
        );

    }


    const messageContent =
        document.createElement(
            "div"
        );


    messageContent.classList.add(
        "message-content"
    );


if (sender === "user") {
    messageContent.textContent = message;
} else {
    messageContent.innerHTML = renderMarkdown(message);
}

    messageElement.appendChild(
        messageContent
    );

// ======================================
// REGENERATE BUTTON
// ======================================

if (
    sender === "bot"
) {

    addRegenerateButton(
        messageElement
    );

}
    // ======================================
    // AI MODE
    // ======================================

    if (
        sender === "bot" &&
        mode
    ) {

        const modeElement =
            document.createElement(
                "div"
            );


        modeElement.classList.add(
            "message-mode"
        );


        if (
            mode === "local"
        ) {

            modeElement.textContent =
                "🧠 Local Qwen AI";

        }

        else if (
            mode === "offline"
        ) {

            modeElement.textContent =
                "⚡ Offline AI";

        }

        else if (
            mode === "knowledge"
        ) {

            modeElement.textContent =
                "📚 Knowledge Base";

        }


        messageElement.appendChild(
            modeElement
        );

    }


    // ======================================
    // TIME
    // ======================================

    const timeElement =
        document.createElement(
            "div"
        );


    timeElement.classList.add(
        "message-time"
    );


    timeElement.textContent =
        time ||
        getCurrentTime();


    messageElement.appendChild(
        timeElement
    );


    chatBox.appendChild(
        messageElement
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    return messageElement;

}


// ==========================================
// ADD USER MESSAGE
// ==========================================

function addUserMessage(
    message
) {

    const time =
        getCurrentTime();


    addMessage(
        message,
        "user",
        "",
        time
    );


    chatHistory.push({

        sender:
            "user",

        message:
            message,

        mode:
            "",

        time:
            time

    });


    updateCurrentSession();

}


// ==========================================
// ADD BOT MESSAGE
// ==========================================

function addBotMessage(
    message,
    mode
) {

    const time =
        getCurrentTime();


    addMessage(
        message,
        "bot",
        mode,
        time
    );


    chatHistory.push({

        sender:
            "bot",

        message:
            message,

        mode:
            mode,

        time:
            time

    });


    updateCurrentSession();

}
// ==========================================
// ADD REGENERATE BUTTON
// ==========================================

function addRegenerateButton(
    messageElement
) {

    const oldButton =
        messageElement.querySelector(
            ".regenerate-button"
        );

    if (oldButton) {
        oldButton.remove();
    }


    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.classList.add(
        "regenerate-button"
    );

    button.innerHTML =
        "🔄 Regenerate";

    button.title =
        "Regenerate this response";


    button.addEventListener(
        "click",
        function() {

            regenerateLastResponse();

        }
    );


    messageElement.appendChild(
        button
    );

}


// ==========================================
// TYPING INDICATOR
// ==========================================

function showTypingIndicator() {

    const typingMessage =
        document.createElement(
            "div"
        );


    typingMessage.classList.add(
        "message",
        "bot-message"
    );


    const typingIndicator =
        document.createElement(
            "div"
        );


    typingIndicator.classList.add(
        "typing-indicator"
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const dot =
            document.createElement(
                "span"
            );


        dot.classList.add(
            "typing-dot"
        );


        typingIndicator.appendChild(
            dot
        );

    }


    typingMessage.appendChild(
        typingIndicator
    );


    chatBox.appendChild(
        typingMessage
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    return typingMessage;

}


// ==========================================
// RESIZE TEXTAREA
// ==========================================

function resizeTextarea() {

    if (!userInput) {
        return;
    }


    userInput.style.height =
        "auto";


    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            130
        ) + "px";

}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage(
    regenerateMessage = null,
    isRegenerate = false
) {

    const message =
    regenerateMessage !== null
        ? regenerateMessage
        : userInput.value.trim();


    if (!message) {

        return;

    }


    if (!currentSessionId) {

        createNewSession();

    }


    sendButton.disabled =
        true;

    userInput.disabled =
        true;


    // ======================================
    // ADD USER MESSAGE
    // ======================================

    if (!isRegenerate) {

    addUserMessage(
        message
    );

}


    if (!isRegenerate) {

    userInput.value =
        "";

}


    resizeTextarea();


    updateAIStatus(
        "thinking"
    );


    // ======================================
    // SHOW TYPING INDICATOR
    // ======================================

    const typingIndicator =
        showTypingIndicator();


    try {

        // ==================================
        // GET CONVERSATION HISTORY
        // ==================================

        const conversationHistory =
            getAIConversationHistory();


        // ==================================
        // PREPARE DOCUMENT CONTEXT
        // ==================================

        let documentContext =
            null;


        if (uploadedDocument) {

            documentContext = {

                name:
                    uploadedDocument.name,

                type:
                    uploadedDocument.type,

                // Prevent sending an
                // excessively large document
                // to the model.

                text:
                    uploadedDocument.text
                        .substring(
                            0,
                            100000
                        )

            };

        }


        // ==================================
        // SEND REQUEST TO BACKEND
        // ==================================

        const response =
            await fetch(
                "/api/chat",
                {

                    method:
                        "POST",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify({

                            message:
                                message,

                            sessionId:
                                currentSessionId,

                            history:
                                conversationHistory,

                            documentContext:
                                documentContext

                        })

                }
            );


        // ==================================
        // CHECK RESPONSE
        // ==================================

        if (!response.ok) {

            throw new Error(
                "Server returned an error."
            );

        }


        // ==================================
        // REMOVE TYPING INDICATOR
        // ==================================

        if (
            typingIndicator &&
            typingIndicator.parentNode
        ) {

            typingIndicator.remove();

        }


        // ==================================
        // CHECK WHETHER RESPONSE IS JSON
        // ==================================

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        // ==================================
        // JSON RESPONSE
        // ==================================

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            const data =
                await response.json();


            const reply =
                data.reply ||
                data.message ||
                data.error ||
                "I couldn't generate a response.";


            const mode =
                data.mode ||
                "local";


            addBotMessage(
                reply,
                mode
            );


            updateAIStatus(
                mode === "offline"
                    ? "offline"
                    : "local"
            );


            return;

        }


        // ==================================
        // CREATE AI MESSAGE ELEMENT
        // ==================================

        const messageElement =
            document.createElement(
                "div"
            );


        messageElement.classList.add(
            "message",
            "bot-message"
        );


        const messageContent =
            document.createElement(
                "div"
            );


        messageContent.classList.add(
            "message-content"
        );


        messageElement.appendChild(
            messageContent
        );


        chatBox.appendChild(
            messageElement
        );


        // ==================================
        // STREAM RESPONSE
        // ==================================

        if (!response.body) {

            throw new Error(
                "No response stream received."
            );

        }


        const reader =
            response.body.getReader();


        const decoder =
            new TextDecoder(
                "utf-8"
            );


        let fullReply =
            "";


        while (true) {

            const {
                value,
                done
            } =
                await reader.read();


            if (done) {

                break;

            }


            const chunk =
                decoder.decode(
                    value,
                    {
                        stream:
                            true
                    }
                );


            fullReply +=
                chunk;


            messageContent.textContent =
                fullReply;
                messageContent.innerHTML = renderMarkdown(fullReply);


            chatBox.scrollTop =
                chatBox.scrollHeight;

        }


        // ==================================
        // FINISH DECODING
        // ==================================

        fullReply +=
            decoder.decode();


        // ==================================
        // SAFETY FALLBACK
        // ==================================

        if (
            !fullReply.trim()
        ) {

            fullReply =
                "I couldn't generate a response.";

            messageContent.textContent =
                fullReply;

        }


        // ==================================
        // ADD AI MODE
        // ==================================

        const modeElement =
            document.createElement(
                "div"
            );


        modeElement.classList.add(
            "message-mode"
        );


        modeElement.textContent =
            "🧠 Local Qwen AI";


        messageElement.appendChild(
            modeElement
        );


        // ==================================
        // ADD TIME
        // ==================================

        const time =
            getCurrentTime();


        const timeElement =
            document.createElement(
                "div"
            );


        timeElement.classList.add(
            "message-time"
        );


        timeElement.textContent =
            time;


        messageElement.appendChild(
            timeElement
        );


        // ==================================
        // SAVE AI RESPONSE
        // ==================================

        chatHistory.push({

            sender:
                "bot",

            message:
                fullReply,

            mode:
                "local",

            time:
                time

        });


        updateCurrentSession();


        // ==================================
        // UPDATE STATUS
        // ==================================

        updateAIStatus(
            "local"
        );

    }


    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        // ==================================
        // REMOVE TYPING INDICATOR
        // ==================================

        if (
            typingIndicator &&
            typingIndicator.parentNode
        ) {

            typingIndicator.remove();

        }


        // ==================================
        // OFFLINE FALLBACK
        // ==================================

        const offlineReply =
            "Sorry, something went wrong while connecting to the AI backend.";


        addBotMessage(
            offlineReply,
            "offline"
        );


        updateAIStatus(
            "offline"
        );

    }


    finally {

        sendButton.disabled =
            false;

        userInput.disabled =
            false;

        userInput.focus();

    }

}


// ==========================================
// CLEAR CURRENT CHAT
// ==========================================

async function clearChat() {

    const confirmed =
        confirm(
            "Are you sure you want to clear this chat?"
        );


    if (!confirmed) {

        return;

    }


    chatHistory = [];


    // Clear document context
    uploadedDocument = null;


    const session =
        getCurrentSession();


    if (session) {

        session.messages =
            [];

        session.title =
            "New Chat";

        session.customTitle =
            false;

        session.updatedAt =
            Date.now();

    }


    saveSessions();


    chatBox.innerHTML =
        "";


    showWelcomeScreen();


    try {

        await fetch(
            "/api/clear",
            {

                method:
                    "POST",

                headers:
                    {
                        "Content-Type":
                            "application/json"
                    },

                body:
                    JSON.stringify({

                        sessionId:
                            currentSessionId

                    })

            }
        );

    }

    catch (error) {

        console.error(
            "Clear error:",
            error
        );

    }


    renderRecentChats();


    updateAIStatus(
        "ready"
    );


    userInput.focus();

}


// ==========================================
// RENAME CHAT
// ==========================================

function renameSession(
    sessionId
) {

    const session =
        sessions.find(
            function(item) {

                return (
                    item.id ===
                    sessionId
                );

            }
        );


    if (!session) {

        return;

    }


    const newTitle =
        prompt(
            "Enter a new name for this chat:",
            session.title || "New Chat"
        );


    if (
        newTitle === null
    ) {

        return;

    }


    const trimmedTitle =
        newTitle.trim();


    if (!trimmedTitle) {

        alert(
            "Chat name cannot be empty."
        );

        return;

    }


    session.title =
        trimmedTitle;


    session.customTitle =
        true;


    session.updatedAt =
        Date.now();


    saveSessions();

    renderRecentChats();

}


// ==========================================
// LOAD CHAT SESSION
// ==========================================

function loadSession(
    sessionId
) {

    const session =
        sessions.find(
            function(item) {

                return (
                    item.id ===
                    sessionId
                );

            }
        );


    if (!session) {

        return;

    }


    currentSessionId =
        session.id;


    chatHistory =
        Array.isArray(
            session.messages
        )
            ? session.messages
            : [];


    // Documents are intentionally
    // session-local and are not restored
    // after switching/reloading chats.

    uploadedDocument = null;


    saveCurrentSessionId();


    chatBox.innerHTML =
        "";


    if (
        chatHistory.length === 0
    ) {

        showWelcomeScreen();

    }

    else {

        chatHistory.forEach(
            function(item) {

                addMessage(
                    item.message,
                    item.sender,
                    item.mode,
                    item.time
                );

            }
        );

    }


    renderRecentChats();


    updateAIStatus(
        "ready"
    );


    userInput.focus();

}


// ==========================================
// DELETE CHAT SESSION
// ==========================================

async function deleteSession(
    sessionId
) {

    const session =
        sessions.find(
            function(item) {

                return (
                    item.id ===
                    sessionId
                );

            }
        );


    if (!session) {

        return;

    }


    const confirmed =
        confirm(
            `Delete "${session.title}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await fetch(
            "/api/clear",
            {

                method:
                    "POST",

                headers:
                    {
                        "Content-Type":
                            "application/json"
                    },

                body:
                    JSON.stringify({

                        sessionId:
                            sessionId

                    })

            }
        );

    }

    catch (error) {

        console.error(
            "Could not clear backend memory:",
            error
        );

    }


    sessions =
        sessions.filter(
            function(item) {

                return (
                    item.id !==
                    sessionId
                );

            }
        );


    if (
        currentSessionId ===
        sessionId
    ) {

        uploadedDocument = null;


        if (
            sessions.length > 0
        ) {

            currentSessionId =
                sessions[0].id;

            chatHistory =
                sessions[0].messages || [];

        }

        else {

            createNewSession();

        }

    }


    saveSessions();

    saveCurrentSessionId();

    renderRecentChats();


    loadSession(
        currentSessionId
    );

}


// ==========================================
// EXPORT CHAT SESSION
// ==========================================

function exportSession(
    sessionId
) {

    const session =
        sessions.find(
            function(item) {

                return (
                    item.id ===
                    sessionId
                );

            }
        );


    if (!session) {

        return;

    }


    if (
        !session.messages ||
        session.messages.length === 0
    ) {

        alert(
            "There are no messages to export."
        );

        return;

    }


    let exportText = "";


    exportText +=
        "========================================\n";

    exportText +=
        "           HYBRIDAI CHAT EXPORT\n";

    exportText +=
        "========================================\n\n";

    exportText +=
        "Chat: " +
        (session.title || "New Chat") +
        "\n";

    exportText +=
        "Exported: " +
        new Date().toLocaleString() +
        "\n\n";

    exportText +=
        "----------------------------------------\n\n";


    session.messages.forEach(
        function(item) {

            const sender =
                item.sender === "user"
                    ? "You"
                    : "HybridAI";


            exportText +=
                sender +
                ":\n";

            exportText +=
                item.message +
                "\n";


            if (item.time) {

                exportText +=
                    "Time: " +
                    item.time +
                    "\n";

            }


            exportText +=
                "\n----------------------------------------\n\n";

        }
    );


    exportText +=
        "========================================\n";

    exportText +=
        "          End of HybridAI Chat\n";

    exportText +=
        "========================================\n";


    const blob =
        new Blob(
            [exportText],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    let filename =
        session.title ||
        "HybridAI Chat";


    filename =
        filename
            .replace(
                /[<>:"/\\|?*]/g,
                ""
            )
            .trim();


    if (!filename) {

        filename =
            "HybridAI Chat";

    }


    link.download =
        filename +
        ".txt";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}
// ==========================================
// CHAT SEARCH
// ==========================================

function searchChats(searchTerm) {

    const term =
        searchTerm
            .trim()
            .toLowerCase();

    const recentChats =
        document.querySelectorAll(
            ".recent-chat"
        );

    let visibleCount = 0;


    recentChats.forEach(
        function(chat) {

            const title =
                chat
                    .querySelector(
                        ".recent-chat-title"
                    );

            if (!title) {
                return;
            }


            const chatTitle =
                title.textContent
                    .toLowerCase();


            // Search title first
            let matches =
                chatTitle.includes(term);


            // Search any stored chat data
            if (
                !matches &&
                term
            ) {

                const chatText =
                    chat.dataset.searchText ||
                    "";

                matches =
                    chatText
                        .toLowerCase()
                        .includes(term);

            }


            if (
                !term ||
                matches
            ) {

                chat.style.display =
                    "flex";

                visibleCount++;

            } else {

                chat.style.display =
                    "none";

            }

        }
    );


    updateSearchEmptyState(
        term,
        visibleCount
    );


    // Clear button state

    if (
        chatSearchInput &&
        chatSearchInput.parentElement
    ) {

        chatSearchInput.parentElement
            .classList.toggle(
                "has-value",
                Boolean(term)
            );

    }

}
// ==========================================
// SEARCH EMPTY STATE
// ==========================================

function updateSearchEmptyState(
    term,
    visibleCount
) {

    const recentContainer =
        document.querySelector(
            ".recent-chats"
        );

    if (!recentContainer) {
        return;
    }


    let emptyMessage =
        recentContainer.querySelector(
            ".recent-search-empty"
        );


    if (
        term &&
        visibleCount === 0
    ) {

        if (!emptyMessage) {

            emptyMessage =
                document.createElement(
                    "div"
                );

            emptyMessage.className =
                "recent-search-empty";

            recentContainer.appendChild(
                emptyMessage
            );

        }

        emptyMessage.innerHTML =
            `🔎 No chats found for
             <strong>${escapeHTML(term)}</strong>.`;

    } else {

        if (emptyMessage) {

            emptyMessage.remove();

        }

    }

}
// ==========================================
// CHAT SEARCH EVENTS
// ==========================================

if (chatSearchInput) {

    chatSearchInput.addEventListener(
        "input",
        function() {

            searchChats(
                chatSearchInput.value
            );

        }
    );

}


if (chatSearchClear) {

    chatSearchClear.addEventListener(
        "click",
        function() {

            chatSearchInput.value =
                "";

            searchChats("");

            chatSearchInput.focus();

        }
    );

}
// ==========================================
// RENDER RECENT CHATS
// ==========================================

function renderRecentChats() {

    const recentChatsContainer =
        document.getElementById(
            "recent-chats"
        );


    if (!recentChatsContainer) {

        return;

    }


    recentChatsContainer.innerHTML =
        "";


    if (
        sessions.length === 0
    ) {

        const emptyMessage =
            document.createElement(
                "div"
            );


        emptyMessage.classList.add(
            "recent-empty"
        );


        emptyMessage.textContent =
            "No recent chats";


        recentChatsContainer.appendChild(
            emptyMessage
        );


        return;

    }


    sessions.forEach(
        function(session) {

            const chatItem =
                document.createElement(
                    "div"
                );


            chatItem.classList.add(
                "recent-chat"
            );


            if (
                session.id ===
                currentSessionId
            ) {

                chatItem.classList.add(
                    "active"
                );

            }


            const title =
                document.createElement(
                    "span"
                );


            title.classList.add(
                "recent-chat-title"
            );


            title.textContent =
                session.title ||
                "New Chat";


            const actionContainer =
                document.createElement(
                    "div"
                );


            actionContainer.classList.add(
                "recent-chat-actions"
            );
// ==========================================
// EXPORT CHAT
// ==========================================

function exportCurrentChat(format) {

    if (
        !chatHistory ||
        chatHistory.length === 0
    ) {
        alert("There are no messages to export.");
        return;
    }

    let content = "";

    // ------------------------------------------
    // TXT FORMAT
    // ------------------------------------------

    if (format === "txt") {

        content =
            "HybridAI Chat\n" +
            "==============================\n\n";

        chatHistory.forEach(function(message) {

            const role =
                message.role === "user"
                    ? "You"
                    : "HybridAI";

            content +=
                role +
                ":\n" +
                message.content +
                "\n\n";

        });

    }

    // ------------------------------------------
    // MARKDOWN FORMAT
    // ------------------------------------------

    else if (format === "md") {

        content =
            "# HybridAI Chat\n\n";

        chatHistory.forEach(function(message) {

            const role =
                message.role === "user"
                    ? "You"
                    : "HybridAI";

            content +=
                "## " +
                role +
                "\n\n";

            content +=
                message.content +
                "\n\n";

        });

    }

    // ------------------------------------------
    // CREATE FILE
    // ------------------------------------------

    const blob =
        new Blob(
            [content],
            {
                type:
                    format === "md"
                        ? "text/markdown"
                        : "text/plain"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    const date =
        new Date()
            .toISOString()
            .slice(0, 10);

    link.download =
        `HybridAI-Chat-${date}.${format}`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


            // ==================================
            // RENAME BUTTON
            // ==================================

            const renameButton =
                document.createElement(
                    "button"
                );


            renameButton.classList.add(
                "recent-chat-rename"
            );


            renameButton.textContent =
                "✎";


            renameButton.title =
                "Rename chat";


            renameButton.type =
                "button";


            renameButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    renameSession(
                        session.id
                    );

                }
            );


            // ==================================
            // EXPORT BUTTON
            // ==================================

            const exportButton =
                document.createElement(
                    "button"
                );


            exportButton.classList.add(
                "recent-chat-export"
            );


            exportButton.textContent =
                "↓";


            exportButton.title =
                "Export chat";


            exportButton.type =
                "button";


            exportButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    exportSession(
                        session.id
                    );

                }
            );


            // ==================================
            // DELETE BUTTON
            // ==================================

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.classList.add(
                "recent-chat-delete"
            );


            deleteButton.textContent =
                "×";


            deleteButton.title =
                "Delete chat";


            deleteButton.type =
                "button";


            deleteButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    deleteSession(
                        session.id
                    );

                }
            );


            actionContainer.appendChild(
                renameButton
            );


            actionContainer.appendChild(
                exportButton
            );


            actionContainer.appendChild(
                deleteButton
            );


            chatItem.appendChild(
                title
            );


            chatItem.appendChild(
                actionContainer
            );


            chatItem.addEventListener(
                "click",
                function() {

                    loadSession(
                        session.id
                    );

                }
            );


            recentChatsContainer.appendChild(
                chatItem
            );

        }
    );

}


// ==========================================
// WELCOME SCREEN
// ==========================================

function showWelcomeScreen() {

    chatBox.innerHTML = `

        <div
            id="welcome-screen"
            class="welcome-screen"
        >

            <div class="welcome-icon">
                🤖
            </div>

            <h1>
                Welcome to HybridAI
            </h1>

            <p>
                Your intelligent assistant
                with local and offline AI.
            </p>

            <div class="welcome-features">

                <div class="feature-card">

                    <strong>
                        🧠 Local AI
                    </strong>

                    <span>
                        Powered by Qwen
                        through LM Studio.
                    </span>

                </div>


                <div class="feature-card">

                    <strong>
                        ⚡ Offline AI
                    </strong>

                    <span>
                        Works even when
                        local AI is unavailable.
                    </span>

                </div>


                <div class="feature-card">

                    <strong>
                        🔒 Private
                    </strong>

                    <span>
                        Your conversations
                        stay on your computer.
                    </span>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// NEW CHAT
// ==========================================

function startNewChat() {

    const currentSession =
        getCurrentSession();


    if (
        currentSession &&
        currentSession.messages.length === 0
    ) {

        // Still clear any previously
        // selected document.

        uploadedDocument = null;


        chatBox.innerHTML =
            "";

        showWelcomeScreen();

        renderRecentChats();

        userInput.focus();

        return;

    }


    createNewSession();


    chatBox.innerHTML =
        "";


    showWelcomeScreen();


    updateAIStatus(
        "ready"
    );


    userInput.focus();

}


// ==========================================
// BUTTON EVENTS
// ==========================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

}


if (userInput) {

    userInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    userInput.addEventListener(
        "input",
        resizeTextarea
    );

}


if (clearButton) {

    clearButton.addEventListener(
        "click",
        clearChat
    );

}


if (sidebarClearButton) {

    sidebarClearButton.addEventListener(
        "click",
        clearChat
    );

}


if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        startNewChat
    );

}


// ==========================================
// SETTINGS
// ==========================================

if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        function() {

            settingsOverlay.classList.add(
                "show"
            );

        }
    );

}


if (closeSettings) {

    closeSettings.addEventListener(
        "click",
        function() {

            settingsOverlay.classList.remove(
                "show"
            );

        }
    );

}


if (settingsOverlay) {

    settingsOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                settingsOverlay
            ) {

                settingsOverlay.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ==========================================
// DARK MODE
// ==========================================

const savedTheme =
    localStorage.getItem(
        THEME_KEY
    );


if (
    savedTheme === "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );


    if (darkModeToggle) {

        darkModeToggle.checked =
            true;

    }

}


if (darkModeToggle) {

    darkModeToggle.addEventListener(
        "change",
        function() {

            if (
                darkModeToggle.checked
            ) {

                document.body.classList.add(
                    "dark-mode"
                );


                localStorage.setItem(
                    THEME_KEY,
                    "dark"
                );

            }

            else {

                document.body.classList.remove(
                    "dark-mode"
                );


                localStorage.setItem(
                    THEME_KEY,
                    "light"
                );

            }

        }
    );

}


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            if (
                settingsOverlay &&
                settingsOverlay.classList.contains(
                    "show"
                )
            ) {

                settingsOverlay.classList.remove(
                    "show"
                );

            }

        }

    }
);


// ==========================================
// VOICE INPUT
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    if (voiceButton) {

        voiceButton.disabled =
            true;

        voiceButton.title =
            "Voice input is not supported by this browser.";

    }

}

else {

    const recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        true;


    recognition.lang =
        "en-IN";


    let isListening =
        false;


    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            function() {

                if (isListening) {

                    recognition.stop();

                }

                else {

                    recognition.start();

                }

            }
        );

    }


    recognition.onstart =
        function() {

            isListening =
                true;


            if (voiceButton) {

                voiceButton.classList.add(
                    "listening"
                );


                voiceButton.textContent =
                    "🔴";


                voiceButton.title =
                    "Listening...";

            }


            updateAIStatus(
                "thinking"
            );

        };


    recognition.onresult =
        function(event) {

            let transcript =
                "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;

            }


            userInput.value =
                transcript;


            resizeTextarea();

        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice recognition error:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                alert(
                    "Microphone permission was denied. Please allow microphone access in your browser."
                );

            }

            else if (
                event.error ===
                "no-speech"
            ) {

                console.log(
                    "No speech detected."
                );

            }

            else {

                console.log(
                    "Voice recognition error:",
                    event.error
                );

            }

        };


    recognition.onend =
        function() {

            isListening =
                false;


            if (voiceButton) {

                voiceButton.classList.remove(
                    "listening"
                );


                voiceButton.textContent =
                    "🎤";


                voiceButton.title =
                    "Voice input";

            }


            updateAIStatus(
                "ready"
            );

        };

}


// ==========================================
// LOAD SAVED SESSIONS
// ==========================================

function loadSessions() {

    const savedSessions =
        localStorage.getItem(
            SESSIONS_KEY
        );


    if (savedSessions) {

        try {

            sessions =
                JSON.parse(
                    savedSessions
                );


            if (
                !Array.isArray(
                    sessions
                )
            ) {

                sessions = [];

            }

        }

        catch (error) {

            console.error(
                "Could not load sessions:",
                error
            );

            sessions = [];

        }

    }


    const savedCurrentSession =
        localStorage.getItem(
            CURRENT_SESSION_KEY
        );


    if (
        savedCurrentSession &&
        sessions.some(
            function(session) {

                return (
                    session.id ===
                    savedCurrentSession
                );

            }
        )
    ) {

        currentSessionId =
            savedCurrentSession;

    }


    if (!currentSessionId) {

        createNewSession();

    }


    renderRecentChats();


    loadSession(
        currentSessionId
    );

}


// ==========================================
// FILE / DOCUMENT INPUT
// ==========================================


// ------------------------------------------
// OPEN FILE PICKER
// ------------------------------------------

if (fileButton && fileInput) {

    fileButton.addEventListener(
        "click",
        function() {

            fileInput.click();

        }
    );

}


// ------------------------------------------
// HANDLE FILE SELECTION
// ------------------------------------------

if (fileInput) {

    fileInput.addEventListener(
        "change",
        async function() {

            const file =
                fileInput.files[0];


            if (!file) {

                return;

            }


            try {

                // ==================================
                // FILE SIZE LIMIT
                // ==================================

                const maxFileSize =
                    10 * 1024 * 1024;


                if (
                    file.size >
                    maxFileSize
                ) {

                    alert(
                        "Please use a file smaller than 10 MB."
                    );

                    fileInput.value =
                        "";

                    return;

                }


                // ==================================
                // CHECK IF PDF
                // ==================================

                const isPDF =
                    file.name
                        .toLowerCase()
                        .endsWith(".pdf");


                // ==================================
                // PDF FILE
                // ==================================

                if (isPDF) {

                    addUserMessage(
                        `📎 Uploaded PDF: ${file.name}`
                    );


                    const readingMessage =
                        addMessage(
                            "📄 Reading PDF...",
                            "bot",
                            "local"
                        );


                    const reader =
                        new FileReader();


                    reader.onload =
                        async function() {

                            try {

                                const response =
                                    await fetch(
                                        "/api/pdf",
                                        {

                                            method:
                                                "POST",

                                            headers:
                                                {
                                                    "Content-Type":
                                                        "application/json"
                                                },

                                            body:
                                                JSON.stringify({

                                                    fileName:
                                                        file.name,

                                                    fileData:
                                                        reader.result

                                                })

                                        }
                                    );


                                const data =
                                    await response.json();


                                if (
                                    !response.ok
                                ) {

                                    throw new Error(
                                        data.error ||
                                        "PDF processing failed."
                                    );

                                }


                                // Remove
                                // "Reading PDF..."
                                // message

                                if (
                                    readingMessage &&
                                    readingMessage.parentNode
                                ) {

                                    readingMessage.remove();

                                }


                                // ==================================
                                // SAVE PDF DOCUMENT
                                // ==================================

                                uploadedDocument = {

                                    name:
                                        data.fileName,

                                    type:
                                        "application/pdf",

                                    text:
                                        data.text || ""

                                };


                                // ==================================
                                // PREVIEW
                                // ==================================

                                const preview =
                                    uploadedDocument.text.length >
                                    1500

                                        ? uploadedDocument.text.substring(
                                            0,
                                            1500
                                        ) +
                                        "\n..."

                                        : uploadedDocument.text;


                                addBotMessage(
                                    `📄 PDF loaded successfully.

File: ${file.name}

Preview:

${preview}

You can now ask me questions about this PDF.`,
                                    "local"
                                );


                                console.log(
                                    "PDF loaded:",
                                    file.name
                                );


                            }

                            catch (error) {

                                console.error(
                                    "PDF processing error:",
                                    error
                                );


                                if (
                                    readingMessage &&
                                    readingMessage.parentNode
                                ) {

                                    readingMessage.remove();

                                }


                                addBotMessage(
                                    `❌ Could not read the PDF.

${error.message}`,
                                    "offline"
                                );

                            }

                        };


                    reader.onerror =
                        function() {

                            if (
                                readingMessage &&
                                readingMessage.parentNode
                            ) {

                                readingMessage.remove();

                            }


                            addBotMessage(
                                "❌ Could not read the PDF file.",
                                "offline"
                            );

                        };


                    reader.readAsDataURL(
                        file
                    );

                }


                // ==================================
                // NORMAL TEXT / CODE FILE
                // ==================================

                else {

                    const text =
                        await file.text();


                    const maxTextSize =
                        500000;


                    if (
                        text.length >
                        maxTextSize
                    ) {

                        alert(
                            "This document is too large. Please use a text file smaller than 500 KB."
                        );

                        fileInput.value =
                            "";

                        return;

                    }


                    uploadedDocument = {

                        name:
                            file.name,

                        type:
                            file.type ||
                            "text/plain",

                        text:
                            text

                    };


                    addUserMessage(
                        `📎 Uploaded document: ${file.name}`
                    );


                    const preview =
                        text.length > 1000

                            ? text.substring(
                                0,
                                1000
                            ) +
                            "\n..."

                            : text;


                    addBotMessage(
                        `📄 Document loaded successfully.

File: ${file.name}

Preview:

${preview}

You can now ask me questions about this document.`,
                        "local"
                    );


                    console.log(
                        "Document loaded:",
                        file.name
                    );

                }

            }

            catch (error) {

                console.error(
                    "File reading error:",
                    error
                );


                addBotMessage(
                    "❌ Could not read this file.",
                    "offline"
                );

            }


            // Reset file input so
            // the same file can be selected again.

            fileInput.value =
                "";

        }
    );

}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

loadSessions();

updateAIStatus(
    "ready"
);


if (userInput) {

    userInput.focus();

}