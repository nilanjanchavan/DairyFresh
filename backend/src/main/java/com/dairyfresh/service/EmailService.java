package com.dairyfresh.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;

@Service
public class EmailService {

    @Value("${mailgun.domain}")
    private String domain;

    @Value("${mailgun.api-key}")
    private String apiKey;

    @Value("${mailgun.from-email}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        if (apiKey == null || apiKey.equals("fake-key") || apiKey.isEmpty()) {
            System.out.println("Mailgun API key not set. Skipping email send to " + to);
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.mailgun.net/v3/" + domain + "/messages";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String auth = "api:" + apiKey;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("from", fromEmail);
            map.add("to", to);
            map.add("subject", subject);
            map.add("text", text);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            System.out.println("Email sent to " + to + ". Response: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
