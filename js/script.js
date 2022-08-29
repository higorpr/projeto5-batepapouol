/**
 * Workflow:
 * 
 * 1. getName()
 * 2. sendName()
 * 3.1. enterChat() 
 * 3.2. errorFunction()
 * 4. initalDisplay()
 */
// Global Variables
let oldMessages;
let username;
let onlineUsers;
let recipient = 'Todos';
let msgType = 'message';
let selected_user;

// Functions
function getName() {
    /**
     * Function that receives the username inputted by the user;
     */
    // Get username:
    username = document.querySelector('.input-box').value;
    if (username === '') {
        alert('Please insert an username.')
    } else {
        sendName(username);
    }
}

function sendName(targetName) {
    /**
     * Function that sends the username to the server.
     * 
     * Input:
     * - targetName: username to be sent to the server.
     */
    const nameMsg = { name: targetName };
    const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',
        nameMsg);
    request.then(enterChat);
    request.catch(errorFunction);

    // show load gif
    toggleLoad();

}

function toggleLoad() {
    /**
     * Function that changes the entry page to display either the loading 
     * gif or the input box and connect button.
     */
    const allLoad = document.querySelectorAll('.load');
    for (i = 0; i < allLoad.length; i++) {
        allLoad[i].classList.toggle('hide');
    }
}

function enterChat(serverResponse) {
    /**
     * Function that results from sucessfull server response for username post,
     * it unloads the login page and loads the chat page,
     * gets initial messages in the server and loads them in the chat page.
     */
    // Unload entry page and load chat page
    document.querySelector('.entry-page').classList.add('hide');
    const chatElements = document.querySelectorAll('.chat-page');
    for (let i = 0; i < chatElements.length; i++) {
        chatElements[i].classList.remove('hide');
    }

    // Getting initial chat messages
    const messages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    messages.then(initialDisplay)
}

function errorFunction(error) {
    /**
     * Function that handle errors from axios .get and .post methods.
     */
    const errorStatus = error.response.request.status;

    if (errorStatus === 400) {
        alert('This username is not available.');
        console.log(error.response.request)
        toggleLoad();
    } else {
        console.log(error.response);
    }
}

function initialDisplay(serverResponse) {
    /**
     * This function receives the response from the initial axios.get for messages
     * in the server and populates the chat.
     * Additionally, it initiates the reloading of server messages to keep the chat 
     * updated.
     * 
     * Input:
     *  - Server response: Response from the method
     *  axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
     */
    // Clear exemple chat
    document.querySelector('.chat').innerHTML = '';

    // Get initial messages from the server and print them
    const msgHistory = serverResponse.data;
    oldMessages = msgHistory;
    msgHistory.forEach(printMessage);

    // Scrolling viewport to newest message
    scrollToNew();

    // Start to get messages at every 3s
    const updateMessages = setInterval(getServerMessages, 3000);

    // Start periodic confirmation that the user is still active (5 seconds)
    const confirmUser = setInterval(confirmStatus, 5000);

    // Populates user list
    getUsers();
    // Start periodic update of users (10 seconds)
    const updateUsers = setInterval(getUsers, 10000);
}

function confirmStatus() {
    /**
     * This function confirms that the user is still active, if not, the page is
     * reloaded.
     */
    const confirmUser = { name: username };
    const confirmRequest = axios.post('https://mock-api.driven.com.br/api/v6/uol/status',
        confirmUser);
    confirmRequest.catch(reloadPage);

}

function getUsers() {
    /**
     * This function recovers online users from the server.
     * On sucess, uploads the user list on the sidebar.
     * On failure, it reloads the page.
     */
    const usersRequest = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    usersRequest.then(updateUsers);
    usersRequest.catch(reloadPage);
}

function updateUsers(res) {
    /**
     * This function updates the active user list and updates the sidebar.
     */
    onlineUsers = res.data;
    let recipient_ok = false;

    // Get HTML for user list
    const userList = document.querySelector('.users');
    // First entry "Todos"
    userList.innerHTML =
        `<li>
            <div onclick="selectUser(this)" class="user_entry">
                <div class="hold_user">
                    <ion-icon name="people"></ion-icon>
                    <p>Todos</p>
                </div>
                <div class="hold_check hide">
                    <img src="images/checkmark.png" alt="check">
                </div>
            </div>
        </li>`;

    // Add all users on server
    for (let i = 0; i < onlineUsers.length; i++) {
        user = onlineUsers[i];
        userList.innerHTML +=
            `<li>
            <div onclick="selectUser(this)" class="user_entry">
                <div class="hold_user">
                    <ion-icon name="person-circle"></ion-icon>
                    <p>${user.name}</p>
                </div>
                <div class="hold_check hide">
                    <img src="images/checkmark.png" alt="check">
                </div>
            </div>
        </li>`
    }

    // Get div for current recipient (if they still are in the chat)
    const entries = document.querySelectorAll('.user_entry')
    for (let i = 0; i < entries.length; i++) {
        if (recipient === entries[i].querySelector('p').innerHTML) {
            entries[i].querySelector('.hold_check').classList.remove('hide');
            recipient_ok = true;
            break;
        }
    }

    // If the recipient left the chat, then 'Todos' becomes the recipient and is checked
    if (recipient_ok === false) {
        recipient = 'Todos'
        for (let i = 0; i < entries.length; i++) {
            if (recipient === entries[i].querySelector('p').innerHTML) {
                entries[i].querySelector('.hold_check').classList.remove('hide');
                break;
            }
        }
    }
}

function selectUser(element) {
    /**
     * Function to select user the message is being sent.
     */

    // Remove checkmark from last recipient:
    const entries = document.querySelectorAll('.user_entry')
    for (i = 0; i < entries.length; i++) {
        if (recipient === entries[i].querySelector('p').innerHTML) {
            entries[i].querySelector('.hold_check').classList.add('hide');
            break;
        }
    }

    // Set new recipient based on clicked element:
    const clicked = element.querySelector('p').innerHTML;
    recipient = clicked;
    // Add checkmark to current recipient:
    element.querySelector('.hold_check').classList.remove('hide');
}

function printMessage(msg) {
    /**
     * This function prints a message at the end of the chat list.
     * 
     * Input:
     *  - msg: A message as stored in the array coming as server response resultant
     * from the axios.get method.
     */
    // Getting chat list in HTML
    const msgList = document.querySelector('.chat');
    // Printing message
    if (msg.type === 'status') {
        msgList.innerHTML +=
            `<li class="entry-msg">
                    <span class="time">(${msg.time})</span>&nbsp
                    <span class="bold sender">${msg.from}</span>&nbsp
                    ${msg.text}
                </li>`;
    } else if (msg.type === 'message') {
        msgList.innerHTML +=
            `<li class="to-all-msg">
            <span class="time">(${msg.time})</span>&nbsp
            <span class="bold sender">${msg.from}</span>&nbsp
            para&nbsp
            <span class="bold receiver">${msg.to}</span>:&nbsp
            <span class="msg-text">${msg.text}</span>
        </li>`;
    } else if (msg.to === username || msg.from === username) {
        msgList.innerHTML +=
            `<li class="reserved-msg">
            <span class="time">(${msg.time})</span>&nbsp
            <span class="bold sender">${msg.from}</span>&nbsp
            reservadamente para&nbsp
            <span class="bold receiver">${msg.to}</span>:&nbsp
            <span class="msg-text">${msg.text}</span>
        </li>`;
    }
}

function getServerMessages() {
    /**
     * This function gets new messages on the server.
     */
    const newMessagesRequest = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    newMessagesRequest.then(updateChat);
    newMessagesRequest.catch(errorFunction);

}

function updateChat(res) {
    /**
     * This function updates the chat with new messages if new messages 
     * came from the server.
     */
    const newMessages = res.data;
    const j = oldMessages.length - 1;
    let i = newMessages.length - 1;
    let messages = [];

    // Getting index of the first new message
    while (diffMessages(newMessages[i], oldMessages[j])) {
        messages.push(newMessages[i]);
        i -= 1;
    }

    oldMessages = newMessages;
    messages = messages.reverse();
    if (messages !== []) {
        messages.forEach(printMessage);
    }

    scrollToNew();
}

function diffMessages(msg1, msg2) {
    /**
     * Function that compares 2 messages and returns true if they different
     * and false if they are the same message
     * 
     * Input:
     *  - msg1, msg2 : Messages to be compared. Follow the form stored on the 
     * UOL Chat API and must be objects from it.
     */
    if ((msg1.from === msg2.from) && (msg1.to === msg2.to) &&
        (msg1.text === msg2.text) && (msg1.time === msg2.time)) {
        return false;
    } else {
        return true;
    }
}

function scrollToNew() {
    /**
     * Function that scrolls the page to last message on the chat.
     * 
     * Input:
     *  - msg: message as an HTML element;
     */
    const msgList = document.querySelector('.chat');
    const listMessage = msgList.children;
    const lastMessage = listMessage[listMessage.length - 1];
    lastMessage.scrollIntoView();

}

function enterMsg() {
    /**
     * This function sends the user message to the server and, 
     * on success, recovers them and, on failure, reloads the page.
     */
    // Get typed message and assemble message Object
    const msg = document.querySelector('.msgBox').value;
    const msgObj = {
        from: username,
        to: recipient,
        text: msg,
        type: msgType,
    }
    // Clearing message input box
    document.querySelector('.msgBox').value = '';
    // Send message to server
    const postRequest = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages',
        msgObj);
    postRequest.then(getServerMessages);
    postRequest.catch(reloadPage);
}

function reloadPage(res) {
    console.log(res);
    window.location.reload();
}

function sidebarToggle() {
    document.querySelector('.cover').classList.toggle('hide');
    document.querySelector('.sidebar').classList.toggle('sidebar_on')
}

function myKeyPress(e, element) {
    var keynum;

    if (window.event) { // IE                  
        keynum = e.keyCode;
    } else if (e.which) { // Netscape/Firefox/Opera                 
        keynum = e.which;
    }

    if (keynum === 13) {
        if (element.classList.contains('load')) {
            getName();
        } else if (element.classList.contains('msgBox')) {
            enterMsg();
        }
    }
}

