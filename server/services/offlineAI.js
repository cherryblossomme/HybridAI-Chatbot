const knowledgeBase = require("./knowledgeBase");

// ==========================================
// HybridAI - Improved Offline AI
// Rule-based local intelligence system
// ==========================================


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function containsAny(message, keywords) {

    return keywords.some(keyword =>
        message.includes(keyword)
    );

}


// ==========================================
// KNOWLEDGE BASE SEARCH
// ==========================================

function searchKnowledgeBase(message) {

    for (const item of knowledgeBase) {

        for (const keyword of item.keywords) {

            if (
                message.includes(
                    keyword.toLowerCase()
                )
            ) {

                return item.answer;

            }

        }

    }

    return null;

}


// ==========================================
// BASIC MATH CALCULATOR
// ==========================================

function calculateMath(message) {

    let expression = message
        .replace("what is", "")
        .replace("calculate", "")
        .replace("solve", "")
        .replace("answer", "")
        .replace("compute", "")
        .trim();


    // Remove commas
    expression =
        expression.replace(/,/g, "");


    // ==========================================
    // PERCENTAGE
    // Example: 20% of 500
    // ==========================================

    const percentageMatch =
        expression.match(
            /^(-?\d+(?:\.\d+)?)%\s+of\s+(-?\d+(?:\.\d+)?)$/
        );


    if (percentageMatch) {

        const percentage =
            Number(percentageMatch[1]);

        const number =
            Number(percentageMatch[2]);

        const result =
            (percentage / 100) * number;


        return `🧮 ${percentage}% of ${number} = ${result}`;

    }


    // ==========================================
    // SQUARE ROOT
    // Example: sqrt 25
    // ==========================================

    const sqrtMatch =
        expression.match(
            /^sqrt\s+(-?\d+(?:\.\d+)?)$/
        );


    if (sqrtMatch) {

        const number =
            Number(sqrtMatch[1]);


        if (number < 0) {

            return "❌ Square root of a negative number is not a real number.";

        }


        return `🧮 √${number} = ${Math.sqrt(number)}`;

    }


    // ==========================================
    // POWER
    // Example: 2 ^ 5
    // ==========================================

    const powerMatch =
        expression.match(
            /^(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)$/
        );


    if (powerMatch) {

        const number1 =
            Number(powerMatch[1]);

        const number2 =
            Number(powerMatch[2]);


        const result =
            Math.pow(number1, number2);


        return `🧮 ${number1} ^ ${number2} = ${result}`;

    }


    // ==========================================
    // BASIC ARITHMETIC
    // ==========================================

    const match =
        expression.match(
            /^(-?\d+(?:\.\d+)?)\s*([+\-*/%])\s*(-?\d+(?:\.\d+)?)$/
        );


    if (!match) {

        return null;

    }


    const number1 =
        Number(match[1]);

    const operator =
        match[2];

    const number2 =
        Number(match[3]);


    let result;


    switch (operator) {

        case "+":

            result =
                number1 + number2;

            break;


        case "-":

            result =
                number1 - number2;

            break;


        case "*":

            result =
                number1 * number2;

            break;


        case "/":

            if (number2 === 0) {

                return "❌ You cannot divide a number by zero.";

            }

            result =
                number1 / number2;

            break;


        case "%":

            if (number2 === 0) {

                return "❌ Modulo by zero is not allowed.";

            }

            result =
                number1 % number2;

            break;


        default:

            return null;

    }


    return `🧮 ${number1} ${operator} ${number2} = ${result}`;

}


// ==========================================
// PROGRAMMING HELP
// ==========================================

function programmingAnswer(message) {


    // ==========================================
    // VARIABLES
    // ==========================================

    if (
        containsAny(message, [
            "what is a variable",
            "what are variables",
            "explain variable",
            "explain variables"
        ])
    ) {

        return `
📦 A variable is a named storage location used to hold data.

Example in JavaScript:

let age = 20;

Here:
• age → variable name
• 20 → stored value

Variables allow programs to store and change information.
        `.trim();

    }


    // ==========================================
    // LOOP
    // ==========================================

    if (
        containsAny(message, [
            "what is a loop",
            "what are loops",
            "explain loop",
            "explain loops"
        ])
    ) {

        return `
🔄 A loop repeatedly executes a block of code.

Common loops include:

• for loop
• while loop
• do-while loop

Example:

for (let i = 0; i < 5; i++) {
    console.log(i);
}

The loop runs until its condition becomes false.
        `.trim();

    }


    // ==========================================
    // FUNCTION
    // ==========================================

    if (
        containsAny(message, [
            "what is a function",
            "what are functions",
            "explain function",
            "explain functions"
        ])
    ) {

        return `
⚙️ A function is a reusable block of code designed to perform a specific task.

Example:

function add(a, b) {
    return a + b;
}

Calling add(2, 3) returns 5.

Functions make programs easier to organize and reuse.
        `.trim();

    }


    // ==========================================
    // ARRAY
    // ==========================================

    if (
        containsAny(message, [
            "what is an array",
            "what are arrays",
            "explain array",
            "explain arrays"
        ])
    ) {

        return `
📚 An array is a data structure used to store multiple values in a single variable.

Example:

let numbers = [10, 20, 30];

The array contains three values.

Arrays are useful when working with collections of related data.
        `.trim();

    }


    // ==========================================
    // OOP
    // ==========================================

    if (
        containsAny(message, [
            "what is oop",
            "what is object oriented programming",
            "explain oop",
            "object oriented programming"
        ])
    ) {

        return `
🧩 OOP stands for Object-Oriented Programming.

Its major concepts are:

1. Encapsulation
2. Inheritance
3. Polymorphism
4. Abstraction

Languages such as Java, C++ and Python support object-oriented programming.
        `.trim();

    }


    // ==========================================
    // RECURSION
    // ==========================================

    if (
        containsAny(message, [
            "what is recursion",
            "explain recursion",
            "recursive function"
        ])
    ) {

        return `
🔁 Recursion is a programming technique where a function calls itself.

A recursive function normally needs:

1. A base condition
2. A recursive call

Example:

function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
}

The base condition prevents infinite recursion.
        `.trim();

    }


    return null;

}


// ==========================================
// GENERAL KNOWLEDGE
// ==========================================

function generalKnowledge(message) {


    // ==========================================
    // AI
    // ==========================================

    if (
        containsAny(message, [
            "what is ai",
            "what is artificial intelligence",
            "explain ai",
            "explain artificial intelligence"
        ])
    ) {

        return `
🤖 Artificial Intelligence (AI) is a field of computer science focused on creating systems that can perform tasks that normally require human intelligence.

Examples include:

• Understanding language
• Recognizing images
• Making predictions
• Solving problems
• Generating text
        `.trim();

    }


    // ==========================================
    // MACHINE LEARNING
    // ==========================================

    if (
        containsAny(message, [
            "what is machine learning",
            "explain machine learning"
        ])
    ) {

        return `
🧠 Machine Learning is a branch of AI where computers learn patterns from data instead of being explicitly programmed for every situation.

Common types include:

• Supervised learning
• Unsupervised learning
• Reinforcement learning
        `.trim();

    }


    // ==========================================
    // DATABASE
    // ==========================================

    if (
        containsAny(message, [
            "what is database",
            "what is a database",
            "explain database"
        ])
    ) {

        return `
🗄️ A database is an organized collection of data that can be stored, accessed and managed efficiently.

Examples include:

• MySQL
• PostgreSQL
• MongoDB
• SQLite

Databases are commonly used by applications to store user and business data.
        `.trim();

    }


    // ==========================================
    // API
    // ==========================================

    if (
        containsAny(message, [
            "what is api",
            "what is an api",
            "explain api"
        ])
    ) {

        return `
🔌 API stands for Application Programming Interface.

An API allows different software systems to communicate with each other.

For example:

A frontend application can send a request to a backend API, and the backend can return data as JSON.
        `.trim();

    }


    // ==========================================
    // HTTP
    // ==========================================

    if (
        containsAny(message, [
            "what is http",
            "explain http",
            "what is https",
            "explain https"
        ])
    ) {

        return `
🌐 HTTP stands for HyperText Transfer Protocol.

HTTPS is the secure version of HTTP and encrypts communication between a client and server.

HTTPS is commonly used when sending sensitive information over the internet.
        `.trim();

    }


    return null;

}


// ==========================================
// MAIN OFFLINE AI
// ==========================================

function offlineAI(userMessage) {


    // ==========================================
    // CLEAN MESSAGE
    // ==========================================

    const message =
        String(userMessage || "")
            .toLowerCase()
            .trim()
            .replace(/[?!.,]/g, "");


    // ==========================================
    // EMPTY MESSAGE
    // ==========================================

    if (!message) {

        return "Please enter a message so I can help you. 🤖";

    }


    // ==========================================
    // KNOWLEDGE BASE
    // ==========================================

    const knowledgeAnswer =
        searchKnowledgeBase(message);


    if (knowledgeAnswer !== null) {

        return knowledgeAnswer;

    }


    // ==========================================
    // GREETINGS
    // ==========================================

    if (
        containsAny(message, [
            "hello",
            "hi",
            "hey",
            "good morning",
            "good afternoon",
            "good evening"
        ])
    ) {

        return "Hello! 👋 I'm HybridAI. I'm currently running in offline mode, but I'm ready to help you.";

    }


    // ==========================================
    // ABOUT HYBRIDAI
    // ==========================================

    if (
        containsAny(message, [
            "your name",
            "who are you",
            "what are you",
            "introduce yourself"
        ])
    ) {

        return "I'm HybridAI 🤖, a hybrid AI chatbot designed to work with Local AI, Knowledge Base responses and Offline AI.";

    }


    // ==========================================
    // HOW ARE YOU
    // ==========================================

    if (
        containsAny(message, [
            "how are you",
            "how r you",
            "how do you feel"
        ])
    ) {

        return "I'm doing great! 🤖 Thanks for asking. I'm currently using my offline AI system.";

    }


    // ==========================================
    // WHAT CAN YOU DO
    // ==========================================

    if (
        containsAny(message, [
            "what can you do",
            "your features",
            "what do you do",
            "your abilities"
        ])
    ) {

        return `
🤖 HybridAI can:

• Answer common questions
• Explain programming concepts
• Perform calculations
• Explain AI and technology topics
• Use the Knowledge Base
• Work with uploaded documents
• Use Local Qwen when available
• Fall back to Offline AI when Local AI is unavailable
        `.trim();

    }


    // ==========================================
    // OFFLINE MODE
    // ==========================================

    if (
        containsAny(message, [
            "offline mode",
            "without internet",
            "no internet",
            "work offline",
            "offline ai"
        ])
    ) {

        return "Yes! 🌐❌ HybridAI can continue responding in offline mode using its local Knowledge Base and rule-based AI system.";

    }


    // ==========================================
    // ONLINE AI
    // ==========================================

    if (
        containsAny(message, [
            "online ai",
            "online mode",
            "internet connection"
        ])
    ) {

        return "HybridAI uses Local Qwen when available. If Local AI is unavailable, it automatically falls back to the Offline AI system.";

    }


    // ==========================================
    // PROGRAMMING
    // ==========================================

    if (
        containsAny(message, [
            "what is programming",
            "what is coding",
            "explain programming",
            "explain coding",
            "meaning of programming"
        ])
    ) {

        return "Programming is the process of writing instructions that a computer can execute. Common programming languages include Java, JavaScript, Python, C and C++.";

    }


    // ==========================================
    // JAVA VS JAVASCRIPT
    // ==========================================

    if (
        containsAny(message, [
            "difference between java and javascript",
            "java vs javascript",
            "java and javascript difference",
            "compare java and javascript",
            "difference java javascript"
        ])
    ) {

        return `
☕ Java vs JavaScript

Java:
• General-purpose programming language
• Strongly typed
• Commonly used for backend and enterprise applications
• Runs on the JVM

JavaScript:
• Mainly used for web development
• Runs in browsers
• Also runs on servers using Node.js
• Dynamically typed

Despite their similar names, Java and JavaScript are different languages.
        `.trim();

    }


    // ==========================================
    // JAVASCRIPT
    // ==========================================

    if (
        containsAny(message, [
            "what is javascript",
            "what is js",
            "explain javascript",
            "explain js",
            "tell me about javascript",
            "tell me about js"
        ])
    ) {

        return "JavaScript is a programming language commonly used to make websites interactive. It can also run outside browsers using environments such as Node.js.";

    }


    // ==========================================
    // JAVA
    // ==========================================

    if (
        containsAny(message, [
            "what is java",
            "explain java",
            "tell me about java",
            "java programming",
            "java language"
        ])
    ) {

        return "Java is a general-purpose, object-oriented programming language. It is widely used for backend applications, enterprise software and Android development.";

    }


    // ==========================================
    // PYTHON
    // ==========================================

    if (
        containsAny(message, [
            "what is python",
            "explain python",
            "tell me about python",
            "python programming",
            "python language"
        ])
    ) {

        return "Python is a high-level programming language known for its readable syntax. It is widely used for automation, web development, data science, machine learning and scripting.";

    }


    // ==========================================
    // HTML
    // ==========================================

    if (
        containsAny(message, [
            "what is html",
            "explain html",
            "tell me about html",
            "html meaning"
        ])
    ) {

        return "HTML stands for HyperText Markup Language. It is used to define the structure and content of web pages.";

    }


    // ==========================================
    // CSS
    // ==========================================

    if (
        containsAny(message, [
            "what is css",
            "explain css",
            "tell me about css",
            "css meaning"
        ])
    ) {

        return "CSS stands for Cascading Style Sheets. It controls the appearance, layout and visual design of web pages.";

    }


    // ==========================================
    // NODE.JS
    // ==========================================

    if (
        containsAny(message, [
            "what is node.js",
            "what is nodejs",
            "explain node.js",
            "explain nodejs",
            "tell me about node.js",
            "tell me about nodejs"
        ])
    ) {

        return "Node.js is a JavaScript runtime that allows JavaScript to run outside the browser. It is commonly used to build backend servers, APIs and real-time applications.";

    }


    // ==========================================
    // PROGRAMMING HELP
    // ==========================================

    const programmingResult =
        programmingAnswer(message);


    if (programmingResult !== null) {

        return programmingResult;

    }


    // ==========================================
    // GENERAL KNOWLEDGE
    // ==========================================

    const generalResult =
        generalKnowledge(message);


    if (generalResult !== null) {

        return generalResult;

    }


    // ==========================================
    // MATH
    // ==========================================

    if (
        /^[\d\s+\-*/%.,^]+$/.test(message) ||
        message.startsWith("what is") ||
        message.startsWith("calculate") ||
        message.startsWith("solve") ||
        message.startsWith("compute") ||
        message.startsWith("sqrt")
    ) {

        const mathResult =
            calculateMath(message);


        if (mathResult !== null) {

            return mathResult;

        }

    }


    // ==========================================
    // THANK YOU
    // ==========================================

    if (
        containsAny(message, [
            "thank you",
            "thanks",
            "thankyou"
        ])
    ) {

        return "You're welcome! 😊";

    }


    // ==========================================
    // GOODBYE
    // ==========================================

    if (
        containsAny(message, [
            "bye",
            "goodbye",
            "see you"
        ])
    ) {

        return "Goodbye! 👋 See you next time.";

    }


    // ==========================================
    // UNKNOWN QUESTION
    // ==========================================

    return `
I'm currently running in offline mode 🤖.

I don't have enough offline knowledge to answer that question yet.

You can try asking me about:
• Programming
• Java
• JavaScript
• Python
• HTML
• CSS
• Node.js
• AI
• Machine Learning
• APIs
• Databases
• Mathematics

When Local Qwen is available, I can handle much more advanced questions.
    `.trim();

}


// ==========================================
// EXPORT OFFLINE AI
// ==========================================

module.exports = offlineAI;