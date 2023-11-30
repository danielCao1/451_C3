package com.c1.enhancedghidra.ghidra;

import com.c1.enhancedghidra.filestore.FileDownloadResponse;
import com.c1.enhancedghidra.profile.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GhidraService {
    private final UserProfileService userProfileService;

    public GhidraService(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    public Object processFile(UUID userProfileId, String scriptName) {
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
        Object scriptOutput = runGhidraScript(tempFile, scriptName);

        tempFile.delete();

        // TODO: Return Ghidra Script Result
        return scriptOutput;
    }

    // TODO: Rename this to function and also this script
    // .\analyzeHeadless 'C:\Users\lejas\Desktop' myProject -import 'C:\Users\lejas\Desktop\repo\451_C3\src\main\ghidra_scripts\sampleBinary\b.out' -scriptPath 'C:\Users\lejas\Desktop\repo\451_C3\src\main\ghidra_scripts' -postScript DetectVulnerabilites.py
    private Object runGhidraScript(File file, String scriptName) {
        System.out.println(scriptName + "test");

        List<String> outputList = new ArrayList<>();
        outputList.add("test");
        outputList.add("output");

        return outputList;
    }

}
