package com.carbontrack.carbontrack.service;

import com.carbontrack.carbontrack.dto.AcceptInviteRequest;
import com.carbontrack.carbontrack.dto.InviteInfoResponse;
import com.carbontrack.carbontrack.entity.EmployeeInvitation;
import com.carbontrack.carbontrack.entity.InvitationStatus;
import com.carbontrack.carbontrack.repository.EmployeeInvitationRepository;

import com.carbontrack.carbontrack.dto.LoginRequest;
import com.carbontrack.carbontrack.dto.RegisterRequest;
import com.carbontrack.carbontrack.dto.JwtResponse;
import com.carbontrack.carbontrack.dto.UserResponse;
import com.carbontrack.carbontrack.entity.Organisation;
import com.carbontrack.carbontrack.entity.User;
import com.carbontrack.carbontrack.repository.OrganisationRepository;
import com.carbontrack.carbontrack.repository.UserRepository;
import com.carbontrack.carbontrack.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final EmailService emailService;
    private final com.carbontrack.carbontrack.repository.OrganisationInviteRepository inviteRepository;
    private final EmployeeInvitationRepository employeeInvitationRepository;

    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email is already taken!");
        }

        User.UserBuilder userBuilder = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()));

        if ("ORGANIZATION".equalsIgnoreCase(request.getAccountType()) || 
            (request.getOrganisationName() != null && !request.getOrganisationName().trim().isEmpty())) {
            
            String domain = null;
            if (request.getEmail() != null && request.getEmail().contains("@")) {
                domain = request.getEmail().substring(request.getEmail().indexOf("@") + 1).toLowerCase().trim();
            }

            String orgName = request.getOrganisationName() != null && !request.getOrganisationName().trim().isEmpty() 
                ? request.getOrganisationName().trim() 
                : (request.getName() + " Org");

            Organisation newOrg = Organisation.builder()
                    .name(orgName)
                    .industry(request.getIndustry())
                    .orgSize(request.getOrgSize())
                    .country(request.getCountry())
                    .state(request.getState())
                    .city(request.getCity())
                    .address(request.getAddress())
                    .gstNumber(request.getGstNumber())
                    .website(request.getWebsite())
                    .contactNumber(request.getContactNumber())
                    .orgEmail(request.getOrgEmail() != null ? request.getOrgEmail() : request.getEmail())
                    .allowedDomain(domain)
                    .primaryColor("#10B981")
                    .build();

            newOrg = organisationRepository.save(newOrg);
            userBuilder.organisation(newOrg);
            userBuilder.role(com.carbontrack.carbontrack.entity.Role.ORG_ADMIN);
        } else {
            userBuilder.role(com.carbontrack.carbontrack.entity.Role.INDIVIDUAL);

            boolean hasOrgAssigned = false;

            // Check direct organisation invitation
            var inviteOpt = inviteRepository.findByEmail(request.getEmail());
            if (inviteOpt.isPresent()) {
                userBuilder.organisation(inviteOpt.get().getOrganisation());
                userBuilder.role(com.carbontrack.carbontrack.entity.Role.EMPLOYEE);
                hasOrgAssigned = true;
            }

            // Check company domain matching
            if (!hasOrgAssigned && request.getEmail() != null && request.getEmail().contains("@")) {
                String domain = request.getEmail().substring(request.getEmail().indexOf("@") + 1).toLowerCase().trim();
                List<String> publicDomains = List.of("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "live.com");
                if (!publicDomains.contains(domain)) {
                    Organisation org = resolveExistingOrganisationForDomain(domain);
                    if (org != null) {
                        userBuilder.organisation(org);
                        userBuilder.role(com.carbontrack.carbontrack.entity.Role.EMPLOYEE);
                    } else {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Your organisation does not exist. Please contact your Organization Admin for an invitation or register an Organization account.");
                    }
                }
            }
        }

        User user = userBuilder.build();
        userRepository.save(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>()
        );
        String jwtToken = jwtService.generateToken(userDetails);
        
        return JwtResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOrganisation() == null && user.getEmail() != null && user.getEmail().contains("@")) {
            String domain = user.getEmail().substring(user.getEmail().indexOf("@") + 1).toLowerCase().trim();
            Organisation org = resolveExistingOrganisationForDomain(domain);
            if (org != null) {
                user.setOrganisation(org);
                user = userRepository.save(user);
            }
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>()
        );
        String jwtToken = jwtService.generateToken(userDetails);

        return JwtResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public InviteInfoResponse getInviteInfo(String token) {
        EmployeeInvitation invitation = employeeInvitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING || invitation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("This invitation is no longer valid.");
        }

        Organisation org = organisationRepository.findById(invitation.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found."));

        return InviteInfoResponse.builder()
                .email(invitation.getEmail())
                .organizationName(org.getName())
                .valid(true)
                .build();
    }

    public JwtResponse acceptInvite(AcceptInviteRequest request) {
        EmployeeInvitation invitation = employeeInvitationRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("This invitation has already been accepted or is no longer valid.");
        }

        if (invitation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            employeeInvitationRepository.save(invitation);
            throw new RuntimeException("This invitation has expired.");
        }

        if (userRepository.existsByEmail(invitation.getEmail())) {
            throw new RuntimeException("User with this email already exists.");
        }

        Organisation org = organisationRepository.findById(invitation.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found."));

        User user = User.builder()
                .name(request.getFullName())
                .email(invitation.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.carbontrack.carbontrack.entity.Role.EMPLOYEE)
                .organisation(org)
                .build();

        user = userRepository.save(user);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        employeeInvitationRepository.save(invitation);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>()
        );
        String jwtToken = jwtService.generateToken(userDetails);

        return JwtResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public Organisation resolveExistingOrganisationForDomain(String domain) {
        if (domain == null) return null;
        List<String> publicDomains = List.of("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "live.com");
        if (publicDomains.contains(domain.toLowerCase().trim())) {
            return null;
        }

        String cleanDomain = domain.toLowerCase().trim();

        // 1. Try to find by allowedDomain
        var orgOpt = organisationRepository.findByAllowedDomain(cleanDomain);
        if (orgOpt.isPresent()) {
            return orgOpt.get();
        }

        // 2. Try to find by name match
        if (cleanDomain.contains(".")) {
            String baseName = Character.toUpperCase(cleanDomain.charAt(0)) + cleanDomain.substring(1, cleanDomain.indexOf('.'));
            var orgByName = organisationRepository.findByName(baseName);
            if (orgByName.isPresent()) {
                Organisation org = orgByName.get();
                if (org.getAllowedDomain() == null) {
                    org.setAllowedDomain(cleanDomain);
                    organisationRepository.save(org);
                }
                return org;
            }
        }

        return null;
    }

    public void sendOtp(String email) {
        String otpCode = otpService.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otpCode);
    }

    public JwtResponse verifyOtp(String email, String otpCode) {
        if (!otpService.validateOtp(email, otpCode)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid or expired OTP");
        }

        // Auto-register user if they don't exist
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User.UserBuilder userBuilder = User.builder()
                    .name(email.split("@")[0])
                    .email(email)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));

            inviteRepository.findByEmail(email).ifPresent(invite -> {
                userBuilder.organisation(invite.getOrganisation());
                userBuilder.role(com.carbontrack.carbontrack.entity.Role.USER);
            });

            if (email.contains("@")) {
                String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
                if (!domain.equals("gmail.com") && !domain.equals("yahoo.com") && !domain.equals("outlook.com") && !domain.equals("hotmail.com")) {
                    organisationRepository.findByAllowedDomain(domain).ifPresent(org -> {
                        userBuilder.organisation(org);
                        userBuilder.role(com.carbontrack.carbontrack.entity.Role.USER);
                    });
                }
            }

            return userRepository.save(userBuilder.build());
        });

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>()
        );
        String jwtToken = jwtService.generateToken(userDetails);

        return JwtResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse mapToUserResponse(User user) {
        String accountType = (user.getOrganisation() != null || user.getRole() == com.carbontrack.carbontrack.entity.Role.ORG_ADMIN 
            || user.getRole() == com.carbontrack.carbontrack.entity.Role.ORG_MANAGER 
            || user.getRole() == com.carbontrack.carbontrack.entity.Role.EMPLOYEE 
            || user.getRole() == com.carbontrack.carbontrack.entity.Role.DEPARTMENT_HEAD) 
            ? "ORGANIZATION" : "INDIVIDUAL";

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountType(accountType)
                .department(user.getDepartment())
                .currentStreak(user.getCurrentStreak())
                .highestStreak(user.getHighestStreak());

        if (user.getBranch() != null) {
            builder.branchId(user.getBranch().getId())
                   .branchName(user.getBranch().getName());
        }

        if (user.getDepartmentRef() != null) {
            builder.departmentId(user.getDepartmentRef().getId());
        }

        if (user.getOrganisation() != null) {
            builder.orgId(user.getOrganisation().getId())
                   .organisationName(user.getOrganisation().getName())
                   .industry(user.getOrganisation().getIndustry())
                   .country(user.getOrganisation().getCountry())
                   .logoUrl(user.getOrganisation().getLogoUrl())
                   .primaryColor(user.getOrganisation().getPrimaryColor());
        }

        return builder.build();
    }
}
