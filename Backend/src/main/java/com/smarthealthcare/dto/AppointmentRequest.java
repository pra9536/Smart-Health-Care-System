package com.smarthealthcare.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {

    private Long doctorId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String symtoms;

}
