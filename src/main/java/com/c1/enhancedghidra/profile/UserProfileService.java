package com.c1.enhancedghidra.profile;

import com.c1.enhancedghidra.filestore.FileDownloadResponse;
import com.c1.enhancedghidra.filestore.FileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class UserProfileService {
    @Value("${application.bucket.name}")
    private String bucketName;

    private final UserProfileDataAccessService userProfileDataAccessService;
    private final FileStore fileStore;

    @Autowired
    public UserProfileService(UserProfileDataAccessService userProfileDataAccessService,
                              FileStore filestore) {
        this.userProfileDataAccessService = userProfileDataAccessService;
        this.fileStore = filestore;
    }
    List<UserProfile> getUserProfiles() {
        return userProfileDataAccessService.getUserProfiles();
    }

    public void uploadUserBinaryFile(UUID userProfileId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalStateException("Cannot upload empty file [" + file.getSize() + "]");
        }

        // Change this if using a real database
        UserProfile user = userProfileDataAccessService
                .getUserProfiles()
                .stream()
                .filter(userProfile -> userProfile.getUserProfileId().equals(userProfileId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(String.format("User Profile %s not found", userProfileId)));


        String originalFilename = file.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = String.format("%s-%s%s",
                originalFilename,
                UUID.randomUUID().toString(),
                extension);

        String key = String.format("%s/binaryFile/%s", user.getUserProfileId(), filename);

        fileStore.uploadFile(key, file);
        user.setBinaryFileLink(filename);
    }

    public FileDownloadResponse downloadUserBinaryFile(UUID userProfileId) {
        UserProfile user = userProfileDataAccessService
                .getUserProfiles()
                .stream()
                .filter(userProfile -> userProfile.getUserProfileId().equals(userProfileId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(String.format("User Profile %s not found", userProfileId)));

        return user.getBinaryFileLink()
                .map(binaryFileLink -> {
                    String key = String.format("%s/binaryFile/%s", user.getUserProfileId(), binaryFileLink);
                    System.out.println("Downloading file with key: " + key);
                    byte[] fileData = fileStore.downloadFile(key);
                    return new FileDownloadResponse(fileData, binaryFileLink); // binaryFileLink is assumed to be the filename
                })
                .orElseThrow(() -> new IllegalStateException("Binary file link not available for UserProfile " + userProfileId));
    }

}
