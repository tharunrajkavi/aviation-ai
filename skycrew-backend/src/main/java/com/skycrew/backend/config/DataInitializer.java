package com.skycrew.backend.config;

import com.skycrew.backend.model.*;
import com.skycrew.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    UserRepository userRepository;

    @Autowired
    AirportRepository airportRepository;

    @Autowired
    AircraftRepository aircraftRepository;

    @Autowired
    CrewMemberRepository crewMemberRepository;

    @Autowired
    FlightRepository flightRepository;

    @Autowired
    FlightAssignmentRepository flightAssignmentRepository;

    @Autowired
    DutyHourRepository dutyHourRepository;

    @Autowired
    RestHourRepository restHourRepository;

    @Autowired
    WeatherAlertRepository weatherAlertRepository;

    @Autowired
    AIRuleRepository aiRuleRepository;

    @Autowired
    AuditLogRepository auditLogRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // DB already seeded
        }

        // 1. Create Airports
        Airport jfk = new Airport("KJFK", "JFK", "John F. Kennedy International Airport", "United States", 4, 128, "EST", "US-EAST");
        Airport lax = new Airport("KLAX", "LAX", "Los Angeles International Airport", "United States", 4, 146, "PST", "US-WEST");
        Airport ord = new Airport("KORD", "ORD", "O'Hare International Airport", "United States", 8, 191, "CST", "US-MIDWEST");
        Airport lhr = new Airport("EGLL", "LHR", "London Heathrow Airport", "United Kingdom", 2, 115, "GMT", "EUROPE");
        Airport dxb = new Airport("OMDB", "DXB", "Dubai International Airport", "United Arab Emirates", 2, 142, "GST", "MIDDLE-EAST");
        
        airportRepository.saveAll(Arrays.asList(jfk, lax, ord, lhr, dxb));

        // 2. Create Aircrafts
        Aircraft b737 = new Aircraft("N737AA", "Boeing 737-800", 160, "AVAILABLE", 26020.0, 150.0);
        Aircraft a320 = new Aircraft("N320UA", "Airbus A320", 150, "AVAILABLE", 24210.0, 85.0);
        Aircraft b777 = new Aircraft("N777DL", "Boeing 777-300ER", 396, "AVAILABLE", 181280.0, 320.0);
        Aircraft m80 = new Aircraft("N80MD", "McDonnell Douglas MD-80", 140, "MAINTENANCE", 22100.0, 0.0);
        
        aircraftRepository.saveAll(Arrays.asList(b737, a320, b777, m80));

        // 3. Create Administrative Users
        User admin = new User("admin", "admin@skycrew.com", encoder.encode("password"), "ROLE_ADMIN");
        User dispatcher = new User("dispatcher", "dispatcher@skycrew.com", encoder.encode("password"), "ROLE_DISPATCHER");
        userRepository.saveAll(Arrays.asList(admin, dispatcher));

        // 4. Create Crew Members
        // Captain John Doe
        User johnUser = new User("john_doe", "john.doe@skycrew.com", encoder.encode("password"), "ROLE_PILOT");
        userRepository.save(johnUser);
        CrewMember john = new CrewMember(johnUser, "Captain John Doe", "PILOT", "P-99218", 5200.0, "CAPTAIN", "B737, A320", "JFK", 12.0, true, "English, Spanish");
        crewMemberRepository.save(john);

        // Captain Jane Smith
        User janeUser = new User("jane_smith", "jane.smith@skycrew.com", encoder.encode("password"), "ROLE_PILOT");
        userRepository.save(janeUser);
        CrewMember jane = new CrewMember(janeUser, "Captain Jane Smith", "PILOT", "P-84729", 6800.0, "CAPTAIN", "B777, B737", "LAX", 14.0, true, "English, French");
        crewMemberRepository.save(jane);

        // First Officer Bob Johnson
        User bobUser = new User("bob_johnson", "bob.johnson@skycrew.com", encoder.encode("password"), "ROLE_PILOT");
        userRepository.save(bobUser);
        CrewMember bob = new CrewMember(bobUser, "FO Bob Johnson", "PILOT", "P-33104", 1200.0, "FIRST_OFFICER", "B737, A320", "JFK", 8.0, true, "English");
        crewMemberRepository.save(bob);

        // Cabin Purser Alice White
        User aliceUser = new User("alice_white", "alice.white@skycrew.com", encoder.encode("password"), "ROLE_CABIN_CREW");
        userRepository.save(aliceUser);
        CrewMember alice = new CrewMember(aliceUser, "Purser Alice White", "CABIN_CREW", "C-1092", 3200.0, "PURSER", "B737, B777", "JFK", 10.0, true, "English, German");
        crewMemberRepository.save(alice);

        // Cabin Attendant Tom Brown
        User tomUser = new User("tom_brown", "tom.brown@skycrew.com", encoder.encode("password"), "ROLE_CABIN_CREW");
        userRepository.save(tomUser);
        CrewMember tom = new CrewMember(tomUser, "Attendant Tom Brown", "CABIN_CREW", "C-7741", 850.0, "ATTENDANT", "B737, A320", "JFK", 10.0, true, "English");
        crewMemberRepository.save(tom);

        // Cabin Attendant Sarah Davis
        User sarahUser = new User("sarah_davis", "sarah.davis@skycrew.com", encoder.encode("password"), "ROLE_CABIN_CREW");
        userRepository.save(sarahUser);
        CrewMember sarah = new CrewMember(sarahUser, "Attendant Sarah Davis", "CABIN_CREW", "C-9912", 1400.0, "ATTENDANT", "B737, B777", "LAX", 10.0, true, "English, Japanese");
        crewMemberRepository.save(sarah);

        // 5. Create Initial Flights
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);
        
        Flight f1 = new Flight("AA100", "American Airlines", b737, jfk, lax, tomorrow, tomorrow.plusHours(5).plusMinutes(30), "SCHEDULED");
        Flight f2 = new Flight("AA200", "American Airlines", a320, lax, ord, tomorrow.plusHours(7), tomorrow.plusHours(11), "SCHEDULED");
        Flight f3 = new Flight("AA300", "American Airlines", b777, ord, jfk, tomorrow.plusHours(13), tomorrow.plusHours(16).plusMinutes(30), "SCHEDULED");
        
        flightRepository.saveAll(Arrays.asList(f1, f2, f3));

        // 6. Assign Crew to Flight AA100
        FlightAssignment a1 = new FlightAssignment(f1, john, "COMMANDER", "ASSIGNED");
        FlightAssignment a2 = new FlightAssignment(f1, bob, "CO_PILOT", "ASSIGNED");
        FlightAssignment a3 = new FlightAssignment(f1, alice, "CABIN_LEADER", "ASSIGNED");
        FlightAssignment a4 = new FlightAssignment(f1, tom, "CABIN_MEMBER", "ASSIGNED");
        
        flightAssignmentRepository.saveAll(Arrays.asList(a1, a2, a3, a4));

        // 7. Create Operations Manager User
        User opsManager = new User("ops_manager", "ops@skycrew.com", encoder.encode("password"), "ROLE_OPERATIONS_MANAGER");
        userRepository.save(opsManager);

        // 8. Create Duty Hours Logs
        java.time.LocalDate todayDate = java.time.LocalDate.now();
        dutyHourRepository.save(new DutyHour(john, todayDate.minusDays(2), 7.5, "Flight AA100 execution"));
        dutyHourRepository.save(new DutyHour(john, todayDate.minusDays(1), 6.0, "Positioning flight log"));
        dutyHourRepository.save(new DutyHour(bob, todayDate.minusDays(1), 8.0, "JFK standby duty"));
        dutyHourRepository.save(new DutyHour(alice, todayDate.minusDays(1), 5.5, "Rotation schedule"));

        // 9. Create Rest Hours Logs
        LocalDateTime now = LocalDateTime.now();
        restHourRepository.save(new RestHour(john, now.minusHours(24), now.minusHours(12), 12.0, "COMPLIANT"));
        restHourRepository.save(new RestHour(bob, now.minusHours(18), now.minusHours(10), 8.0, "VIOLATION"));
        restHourRepository.save(new RestHour(alice, now.minusHours(20), now.minusHours(10), 10.0, "COMPLIANT"));

        // 10. Create Weather Alerts Logs
        weatherAlertRepository.save(new WeatherAlert("KJFK", "SEVERE", "STORM", "Severe Thunderstorm & high winds gusting 35kts", now, true));
        weatherAlertRepository.save(new WeatherAlert("KORD", "WARNING", "HIGH_WINDS", "High winds gusting up to 25kts", now, true));
        weatherAlertRepository.save(new WeatherAlert("KLAX", "CLEAR", "HEAVY_RAIN", "Cleared: Rain showers dispersed VFR", now.minusHours(5), false));

        // 11. Create AI Rules
        aiRuleRepository.save(new AIRule("MAX_DAILY_DUTY_HOURS", "8.0", "FAA limit on consecutive single pilot duty", true));
        aiRuleRepository.save(new AIRule("MANDATORY_REST_HOURS", "10.0", "Minimum rest hours required between flights", true));
        aiRuleRepository.save(new AIRule("MONTHLY_FLIGHT_LIMIT", "100.0", "Maximum cumulative flying hours in 30 days", true));
        aiRuleRepository.save(new AIRule("CABIN_CREW_MIN_REST", "10.0", "FAA mandatory minimum rest period for cabin attendants", true));

        // 12. Create Audit Logs
        auditLogRepository.save(new AuditLog("dispatcher", "FLIGHT_CREATE", "Created scheduled Flight rotation AA100", now.minusHours(2)));
        auditLogRepository.save(new AuditLog("admin", "USER_REGISTER", "Registered Captain Jane Smith crew profile", now.minusHours(4)));
    }
}
