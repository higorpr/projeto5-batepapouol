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

// Functions
function getName() {
    /**
     * Function that receives the username inputted by the user;
     */
    // Get username:
    username = document.querySelector('.input-box').value;
    sendName(username);
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
     * 
     */
    const allLoad = document.querySelectorAll('.load');
    console.log('toggleLoad');
    console.log(allLoad);
    for (i=0 ; i < allLoad.length; i++) {
        allLoad[i].classList.toggle('hide');
    }
}

function enterChat(serverResponse) {
    /**
     * Function that results from sucessfull server response for username post,
     * it unloads the login page and loads the chat page,
     * gets initial messages in the server and loads them in the chat page.
     */
    console.log('enterChat');
    console.log(serverResponse);

    // Unload entry page and load chat page
    document.querySelector('.entry-page').classList.add('hide');
    const chatElements = document.querySelectorAll('.chat-page');
    for (let i = 0; i < chatElements.length; i++) {
        chatElements[i].classList.remove('hide');
    }

    // Getting initial chat messages
    const messages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    messages.then(initialDisplay)

    // Seeing active participants
    // const connectedUsers = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    // connectedUsers.then(manageUsers)
}

function errorFunction(error) {
    console.log('Error');
    const errorStatus = error.response.request.status;

    if (errorStatus === 400) {
        alert('This username is already taken, please try another.');
        toggleLoad();
    } else {
        console.log(error.response);
    }    
}

function manageUsers(serverResponse) {
    console.log('manageUsers')
    console.log(serverResponse)
}

function initialDisplay(serverResponse) {
    /**
     * This function receives the response from the initial axios.get for messages
     * in the server and populates the chat.
     * Additionally, it initiates the reloading of server messages to keep the chat 
     * updated.
     */

    console.log('initalDisplay')
    console.log(serverResponse.data);

    // // Clear exemple chat
    document.querySelector('.chat').innerHTML = '';

    const msgHistory = serverResponse.data;
    oldMessages = msgHistory;
    msgHistory.forEach(printMessage)

    const updateMessages = setInterval(getServerMessages, 3000);
}

function printMessage(msg) {
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
        `<li class="to-all-msg">
            <span class="time">(${msg.time})</span>&nbsp
            <span class="bold sender">${msg.from}</span>&nbsp
            para&nbsp
            <span class="bold receiver">${msg.to}</span>:&nbsp
            <span class="msg-text">${msg.text}</span>
        </li>`;
    } else {
        `<li class="reserved-msg">
            <span class="time">(${msg.time})</span>&nbsp
            <span class="bold sender">${msg.from}</span>&nbsp
            reservadamente para&nbsp
            <span class="bold receiver">${msg.to}</span>:&nbsp
            <span class="msg-text">${msg.text}</span>
        </li>`;
    }
    console.log('initalDisplay end')
    // Scrolling viewport to newest message
    scrollToNew();
}

function getServerMessages() {
    /**
     * This function gets the new messages on the server.
     */
    console.log('updateChat')
    const newMessagesRequest = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    newMessagesRequest.then(updateChat);
    newMessagesRequest.catch(errorFunction) //Mudar no futuro
}

function updateChat(res) {
    /**
     * This function updates the chat with new messages if needed
     */
    const newMessages = res.data;
    let Messages = [];
    
    let i = newMessages.length - 1;
    const j = oldMessages.length - 1;
    console.log(newMessages[i])
    console.log(oldMessages[j])
    // Getting index of the first new message
    while (diffMessages(newMessages[i], oldMessages[j])) {
        Messages.push(newMessages[i]);
        i -= 1;
    }

    oldMessages = newMessages;
    Messages = Messages.reverse();
    if (Messages !== []) {
        Messages.forEach(printMessage);
    }    
}

function diffMessages(msg1, msg2) {
    /**
     * 
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