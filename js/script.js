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

    // Confirms the user is still active
    const confirm = setInterval(confirmStatus, 5000);
}

function confirmStatus() {
    /**
     * This function confirms that the user is still active.
     */
     const confirmUser = {name: username};
     const confirmRequest = axios.post('https://mock-api.driven.com.br/api/v6/uol/status',
     confirmUser);
     confirmRequest.catch(errorFunction);

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
    console.log(`Printing message ${msg} of type ${msg.type}`);
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
    } else {
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
    newMessagesRequest.catch(errorFunction) //Mudar no futuro?

}

function updateChat(res) {
    /**
     * This function updates the chat with new messages if new messages are upated
     * into the server.
     */
    console.log('Update Chat');
    console.log(res);
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
        console.log('Inside IF');
        console.log( messages);
        messages.forEach(printMessage);
    }
    // console.log('outside IF');
    // console.log(messages);

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
    // Get typed message and assemble message Object
    const msg = document.querySelector('.msgBox').value;
    const destiny = 'Todos';
    const msg_type = 'message';
    const msgObj = {
        from: username,
        to: destiny,
        text: msg,
        type: msg_type,
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

// function returnMsg(res) {
//     console.log(res)
// }