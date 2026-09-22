package com.restaurante.dto;

import lombok.Data;

@Data
public class BusinessHourDTO {
    private Integer dayOfWeek;
    private String openTime;
    private String closeTime;
    private Boolean closed;
}