package com.smarthealthcare.repository;

import com.smarthealthcare.entity.Rating;
import com.smarthealthcare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByDoctor(Doctor doctor);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.doctor = :doctor")
    Double findAverageRatingByDoctor(Doctor doctor);
}