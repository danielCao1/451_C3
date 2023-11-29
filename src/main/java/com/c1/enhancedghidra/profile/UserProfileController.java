package com.c1.enhancedghidra.profile;

import com.c1.enhancedghidra.FileDownloadResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/user-profile")
@CrossOrigin("*")
public class UserProfileController {
    private final UserProfileService userProfileService;
    @Autowired
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public List<UserProfile> getUserProfiles() {
        return userProfileService.getUserProfiles();
    }

    @PostMapping(
            path = "{userProfileId}/binary/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public void uploadBinaryProfile(@PathVariable("userProfileId") UUID userProfileId,
                                    @RequestParam("file")MultipartFile file) {
        userProfileService.uploadUserBinaryFile(userProfileId, file);
    }

    @GetMapping("{userProfileId}/binary/download")
    public ResponseEntity<ByteArrayResource> downloadBinaryFile(@PathVariable("userProfileId") UUID userProfileId) {
        FileDownloadResponse downloadResponse = userProfileService.downloadUserBinaryFile(userProfileId);
        ByteArrayResource resource = new ByteArrayResource(downloadResponse.getFileData());

        return ResponseEntity
                .ok()
                .contentLength(downloadResponse.getFileData().length)
                .header("Content-type", "application/octet-stream")
                .header("Content-disposition", "attachment; filename=\"" + downloadResponse.getFileName() + "\"")
                .body(resource);
    }



}
