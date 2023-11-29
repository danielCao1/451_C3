package com.c1.enhancedghidra.profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class UserProfileService {

    private final UserProfileDataAccessService userProfileDataAccessService;

    @Autowired
    public UserProfileService(UserProfileDataAccessService userProfileDataAccessService) {
        this.userProfileDataAccessService = userProfileDataAccessService;
    }
    List<UserProfile> getUserProfiles() {
        return userProfileDataAccessService.getUserProfiles();
    }

    public void uploadUserBinaryFile(UUID userProfileId, MultipartFile file) {
        // 1. The check user exist in our database
        // 2. Grab some metadata from file if any
        // 3. Store the image in s3 and update database (binaryFileLink) with s3 image link
    }
}
