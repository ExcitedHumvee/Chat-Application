package com.stanydesa.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    // this code sets up a WebSocket configuration with an endpoint at /ws
    // enables SockJS for broader browser compatibility
    // configures a message broker with specific destination prefixes for routing messages between clients
    // STOMP (Simple Text Oriented Messaging Protocol)

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //configures the endpoint where WebSocket clients can connect
        //sets up an endpoint at /ws and enables the use of SockJS, which is a fallback option for browsers that do not support WebSocket directly. SockJS provides a WebSocket-like interface over various protocols, enabling broader compatibility.
        registry.addEndpoint("/ws").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //This method configures the message broker, which is responsible for routing messages between clients.

        // /app: Messages prefixed with this destination will be routed to message-handling methods in the application.
        registry.setApplicationDestinationPrefixes("/app");

        ///topic: Messages broadcast to topics will be forwarded to all connected clients subscribed to that topic.
        registry.enableSimpleBroker("/topic");
    }
}
