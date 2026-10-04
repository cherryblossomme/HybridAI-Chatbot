// ==========================================
// DOM ELEMENTS
// ==========================================

const chatBox =
    document.getElementById("chat-box");

const userInput =
    document.getElementById("user-input");

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


    messageContent.textContent =
        message;


    messageElement.appendChild(
        messageContent
    );


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

async function sendMessage() {

    const message =
        userInput.value.trim();


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

    addUserMessage(
        message
    );


    userInput.value =
        "";


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