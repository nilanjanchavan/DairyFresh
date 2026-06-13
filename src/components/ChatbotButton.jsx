import React from 'react'

function ChatbotButton(props) {
    var onChatbotClick = props.onChatbotClick

    function handleClick() {
        if (onChatbotClick) {
            // Check if we want to override via prop, else redirect to whatsapp
            // Added ?text=join%20 to help users quickly join the Twilio sandbox
            window.open('https://wa.me/16183865284?text=join%20', '_blank');
        }
    }

    return (
        <div className="chatbot-button" onClick={handleClick}>
            <img
                src="/images/chatbot-icon.gif"
                alt="Chat with us on WhatsApp"
                className="chatbot-gif"
            />
        </div>
    )
}

export default ChatbotButton
