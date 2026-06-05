package com.smarthealthcare.service;

import com.smarthealthcare.entity.User;
import com.smarthealthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole().name().equals(role.toUpperCase()))
                .toList();
    }
}
