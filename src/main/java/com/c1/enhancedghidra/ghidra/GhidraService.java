package com.c1.enhancedghidra.ghidra;

import com.c1.enhancedghidra.filestore.FileDownloadResponse;
import com.c1.enhancedghidra.profile.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class GhidraService {
    private final UserProfileService userProfileService;

    public GhidraService(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    public String processFile(UUID userProfileId) {
        FileDownloadResponse downloadResponse = userProfileService.downloadUserBinaryFile(userProfileId);

        // send file to server temp file system i.e. (C:\Users\lejas\AppData\Local\Temp\)
        File tempFile = new File(System.getProperty("java.io.tmpdir"), downloadResponse.getFileName());
        System.out.println("Temporary directory: " + System.getProperty("java.io.tmpdir"));

        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(downloadResponse.getFileData());
        } catch (IOException e) {
            throw new IllegalStateException("Error writing to temporary file", e);
        }


        // TODO: run ghidra script

//        tempFile.delete();

        // TODO: Return Ghidra Script Result
        return "Howdy";
    }

    // TODO: Rename this to function and also this scirpt
    private void runGhidraScript(File file) {
        // Implement the logic to run Ghidra script or other processing here
        // Example:
        // ProcessBuilder pb = new ProcessBuilder("/path/to/ghidra/script", file.getAbsolutePath());
        // Process p = pb.start();
        // ... handle process output and errors ...
    }
}
