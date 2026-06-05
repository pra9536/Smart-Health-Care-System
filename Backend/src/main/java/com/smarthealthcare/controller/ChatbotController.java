package com.smarthealthcare.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001"})
public class ChatbotController {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> request) {
        try {
            // Get messages from request
            List<Map<String, String>> messages =
                    (List<Map<String, String>>)
                            request.get("messages");

            // Filter out any initial assistant messages to comply with Anthropic API requirements (first message must be user)
            if (messages != null && !messages.isEmpty() && "assistant".equals(messages.get(0).get("role"))) {
                messages = new ArrayList<>(messages);
                messages.remove(0);
            }

            // Build Anthropic API request
            Map<String, Object> anthropicRequest =
                    new HashMap<>();
            anthropicRequest.put("model",
                    "claude-3-5-sonnet-20241022");
            anthropicRequest.put("max_tokens", 1000);
            anthropicRequest.put("system",
                    """
                    You are a helpful healthcare AI assistant.
                    When patients describe symptoms, you:
                    1. Show empathy and understanding
                    2. Ask clarifying questions if needed
                    3. Suggest which doctor specialization
                       they should visit
                    4. Give simple health tips
                    5. Always remind them to consult a real doctor
                    Keep responses short, clear and friendly.
                    Available specializations: Cardiology,
                    Dermatology, Neurology, Orthopedics,
                    Pediatrics, Psychiatry, Gynecology,
                    General, ENT, Dentistry
                    """);
            anthropicRequest.put("messages", messages);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(anthropicRequest, headers);

            // Call Anthropic API
            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            "https://api.anthropic.com/v1/messages",
                            HttpMethod.POST,
                            entity,
                            Map.class
                    );

            // Extract reply text
            Map<String, Object> responseBody =
                    response.getBody();
            List<Map<String, Object>> content =
                    (List<Map<String, Object>>)
                            responseBody.get("content");
            String reply = content.get(0)
                    .get("text").toString();

            return ResponseEntity.ok(
                    Map.of("reply", reply));

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            String userQuery = "hlw";
            List<Map<String, String>> messagesList = (List<Map<String, String>>) request.get("messages");
            if (messagesList != null && !messagesList.isEmpty()) {
                for (int i = messagesList.size() - 1; i >= 0; i--) {
                    if ("user".equals(messagesList.get(i).get("role"))) {
                        userQuery = messagesList.get(i).get("content");
                        break;
                    }
                }
            }
            String fallbackReply = getLocalFallbackResponse(userQuery, e.getResponseBodyAsString());
            System.err.println("Anthropic API HttpStatusCodeException: " + e.getResponseBodyAsString());
            return ResponseEntity.ok(Map.of("reply", fallbackReply));
        } catch (Exception e) {
            String userQuery = "hlw";
            List<Map<String, String>> messagesList = (List<Map<String, String>>) request.get("messages");
            if (messagesList != null && !messagesList.isEmpty()) {
                for (int i = messagesList.size() - 1; i >= 0; i--) {
                    if ("user".equals(messagesList.get(i).get("role"))) {
                        userQuery = messagesList.get(i).get("content");
                        break;
                    }
                }
            }
            String fallbackReply = getLocalFallbackResponse(userQuery, e.getMessage());
            System.err.println("Anthropic API General Exception: " + e.getMessage());
            return ResponseEntity.ok(Map.of("reply", fallbackReply));
        }
    }

    private String getLocalFallbackResponse(String userQuery, String apiErrorMsg) {
        String query = userQuery != null ? userQuery.trim().toLowerCase() : "";
        
        // Clean up error message for display
        String shortError = apiErrorMsg;
        if (apiErrorMsg != null && apiErrorMsg.contains("\"message\":\"")) {
            try {
                int start = apiErrorMsg.indexOf("\"message\":\"") + 11;
                int end = apiErrorMsg.indexOf("\"", start);
                if (end > start) {
                    shortError = apiErrorMsg.substring(start, end);
                }
            } catch (Exception ignored) {}
        } else if (apiErrorMsg != null && apiErrorMsg.length() > 80) {
            shortError = apiErrorMsg.substring(0, 80) + "...";
        }

        // Check for greetings and conversational inquiries
        if (query.equals("hi") || query.equals("hello") || query.equals("hey") || query.equals("hlw") || 
            query.equals("hey there") || query.equals("greetings") || query.contains("good morning") || 
            query.contains("good afternoon") || query.contains("good evening") || query.startsWith("hi ") || 
            query.startsWith("hello ") || query.equals("help") || query.equals("who are you")) {
            return String.format(
                "🏥 **AI Health Assistant (Local Triage Mode)**\n\n" +
                "Hello! How can I help you today?\n\n" +
                "Please describe the symptoms you are experiencing (for example: *fever*, *cough*, *chest pain*, *headache*, or *skin rash*), and I will help recommend the right doctor specialization and offer some simple health tips.\n\n" +
                "*⚠️ Disclaimer: The Anthropic AI service is currently offline (Error: **%s**). Running in local fallback mode. Always consult a real doctor for any medical diagnosis.*",
                shortError
            );
        }

        String specialization = "General Medicine";
        String tip = "Stay hydrated, get plenty of rest, and monitor your symptoms. If they persist or worsen, please consult a healthcare professional.";
        
        if (query.contains("chest pain") || query.contains("heart") || query.contains("palpitation") || query.contains("cardio") || query.contains("stroke") || query.contains("shortness of breath")) {
            specialization = "Cardiology";
            tip = "Rest immediately, avoid strenuous physical activity, and monitor your blood pressure. Seek emergency care if symptoms are severe or accompanied by sweating or nausea.";
        } else if (query.contains("skin") || query.contains("rash") || query.contains("itch") || query.contains("acne") || query.contains("allergy") || query.contains("eczema") || query.contains("pimple")) {
            specialization = "Dermatology";
            tip = "Avoid scratching or irritating the affected skin area. Keep it clean and dry, and consider using a mild moisturizer or soothing lotion.";
        } else if (query.contains("headache") || query.contains("migraine") || query.contains("dizziness") || query.contains("seizure") || query.contains("numbness") || query.contains("nerve")) {
            specialization = "Neurology";
            tip = "Rest in a quiet, dark room, stay hydrated, and limit screen time. Monitor the frequency and intensity of the headaches.";
        } else if (query.contains("joint") || query.contains("bone") || query.contains("back pain") || query.contains("fracture") || query.contains("muscle") || query.contains("knee") || query.contains("sprain")) {
            specialization = "Orthopedics";
            tip = "Apply the R.I.C.E. method: Rest the affected area, Ice it, Apply gentle Compression, and Elevate it if possible. Avoid putting weight on painful joints.";
        } else if (query.contains("child") || query.contains("baby") || query.contains("pediatric") || query.contains("kid") || query.contains("infant")) {
            specialization = "Pediatrics";
            tip = "Ensure the child is comfortable, stays hydrated, and gets adequate sleep. Monitor their temperature and behaviors closely.";
        } else if (query.contains("depressed") || query.contains("anxiety") || query.contains("stress") || query.contains("mental") || query.contains("sad") || query.contains("panic") || query.contains("insomnia")) {
            specialization = "Psychiatry";
            tip = "Practice deep breathing exercises, reach out to supportive friends or family, and prioritize sleep hygiene. Remember that mental health is as important as physical health.";
        } else if (query.contains("pregnancy") || query.contains("gynec") || query.contains("period") || query.contains("pregnant") || query.contains("menstruation")) {
            specialization = "Gynecology";
            tip = "Maintain a healthy diet, stay well-hydrated, and track your cycle or symptoms. Consult your healthcare provider for pregnancy-safe advice.";
        } else if (query.contains("ear") || query.contains("nose") || query.contains("throat") || query.contains("sinus") || query.contains("tonsil")) {
            specialization = "ENT (Ear, Nose & Throat)";
            tip = "Gargle with warm salt water for throat irritation, use a saline nasal spray for congestion, and keep your ears clean and dry without inserting cotton swabs.";
        } else if (query.contains("tooth") || query.contains("teeth") || query.contains("gum") || query.contains("dentist") || query.contains("cavity")) {
            specialization = "Dentistry";
            tip = "Rinse your mouth with warm salt water, maintain gentle brushing and flossing, and avoid very hot, cold, or sugary foods and drinks until you see a dentist.";
        } else if (query.contains("fever") || query.contains("cough") || query.contains("cold") || query.contains("flu") || query.contains("stomach")) {
            specialization = "General Medicine";
            tip = "Get plenty of rest, stay well-hydrated, eat light and easily digestible meals, and monitor your temperature.";
        }

        return String.format(
            "🏥 **AI Health Assistant (Local Diagnostic Mode)**\n\n" +
            "*Note: The Anthropic AI service is currently unavailable (Error: **%s**). Local fallback mode has been activated to assist you.*\n\n" +
            "Based on your described symptoms, here is some guidance:\n" +
            "* **Suggested Specialization:** **%s**\n" +
            "* **General Health Tip:** %s\n\n" +
            "**Recommended Action:** Please use our 'Find Doctors' page to locate a specialist in **%s** and book an appointment.\n\n" +
            "*⚠️ Disclaimer: This is an automated keyword-based fallback system. Always consult a registered medical professional for proper diagnosis and treatment.*",
            shortError, specialization, tip, specialization
        );
    }
}