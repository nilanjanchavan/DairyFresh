package com.dairyfresh.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class TwilioService {

    @Value("${TWILIO_ACCOUNT_SID:}")
    private String accountSid;

    @Value("${TWILIO_AUTH_TOKEN:}")
    private String authToken;

    @Value("${TWILIO_WHATSAPP_NUMBER:whatsapp:+16183865284}")
    private String fromWhatsAppNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
            System.out.println("Twilio initialized successfully for outbound messages.");
        } else {
            System.out.println("Twilio SID/Token not found. Outbound WhatsApp messages will fail.");
        }
    }

    public void sendWhatsAppMessage(String toPhoneNumber, String textMessage) {
        if (accountSid == null || accountSid.isEmpty()) {
            System.err.println("Cannot send WhatsApp message: Twilio not configured.");
            return;
        }

        try {
            // Ensure the toPhoneNumber has the "whatsapp:" prefix
            if (!toPhoneNumber.startsWith("whatsapp:")) {
                toPhoneNumber = "whatsapp:" + toPhoneNumber;
            }

            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(fromWhatsAppNumber),
                    textMessage
            ).create();

            System.out.println("WhatsApp message sent successfully. SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp message to " + toPhoneNumber + ": " + e.getMessage());
            throw new RuntimeException("Twilio Error: " + e.getMessage());
        }
    }
}
