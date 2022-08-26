/**
 * Workflow:
 * 
 * 1. getName()
 * 2. sendName()
 * 3.1. sendFunction() 
 * 3.2. errorFunction()
 * 4. initalDisplay()
 */
// const msg = {name: 'Higor'};
// const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', msg);
// request.then(printFunction);

// const entry = 
// entry.then(initialDisplay);
let username;

function getName() {
    // Get username:
    username = document.querySelector('.input-box').value;
    sendName();
}


function sendName() {
    const nameMsg = { name: username };
    const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',
        nameMsg);
    request.then(sendFunction);
    request.catch(errorFunction);

}

function sendFunction(serverResponse) {
    console.log('sendFunction');
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
     */

    console.log('initalDisplay')
    console.log(serverResponse.data);

    // // Clear exemple chat
    document.querySelector('.chat').innerHTML = '';

    const msgHistory = serverResponse.data;
    msgHistory.forEach(printMessage)
}

function printMessage(msg) {
    const msgList = document.querySelector('.chat');
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
        </li>`
    }
}