// 파일 업로드 하는 함수
document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    console.log("file processing...")
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        // api와 통신해서 응답을 받기
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('responseContainer').innerText = data.response;
        })
        .catch(error => console.error('Error:', error));
    }
});

// 
async function submitMessage(event) {
    event.preventDefault();
    const userMessage = document.getElementById('messageInput').value;
    document.getElementById('messageInput').value = ''; // Clear input field

    displayMessage('user', userMessage); // Display the user's message OK
    const loadingDiv = addLoadingMessage(); // Show loading indicator Not OK

    // Get and display the response from the assistant
    // await getResponseFromAssistant(userMessage,);
    try {
        // api와 통신해서 응답을 받기
        const response = await fetch('/sendToAssistant', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: userMessage })
        });
        const data = await response.json();
        
        loadingDiv.remove(); // loading remove
        
        // Display the assistant's response
        displayMessage('assistant', data.assistantMessage.content);
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.remove(); // Remove loading indicator
        // Handle the error appropriately
    }
}

// api로부터 응답을 받고 그걸 웹뷰에 보이게 하는 함수
async function getResponseFromAssistant(message) {
    try {
        const response = await fetch('/sendToAssistant', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();

        loadingDiv.remove(); // loading remove

        // Display the assistant's response
        displayMessage('assistant', data.assistantMessage.content);
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.remove(); // Remove loading indicator
        // Handle the error appropriately
    }
}

    function displayMessage(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = "whitespace-pre-wrap";
        messageDiv.style.color = role === 'user' ? 'black' : 'purple'; // color 
        messageDiv.innerHTML = `<strong>${role}:</strong> ${content}<br /><br />`; // innerHTML Insert
        chatMessages.appendChild(messageDiv); // Add new message at the bottom
    }
    
    function addLoadingMessage() { 
        const chatMessages = document.getElementById('chatMessages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = "loading";
        loadingDiv.style = "height: 53px; width: 100%; background-color: gray; border-radius: 4px; animation: pulse 2s infinite;";
        chatMessages.appendChild(loadingDiv); // Add loading at the bottom
        return loadingDiv;
    }

