
// const msg = {name: 'Higor'};
// const request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', msg);
// request.then(printFunction);

const entry = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
entry.then(initialDisplay);

function enterChat() {
    
}

function initialDisplay(response) {
    /**
     * This function receives the response from the initial axios.get request
     * and populates the chat
     */

    console.log(response);
}