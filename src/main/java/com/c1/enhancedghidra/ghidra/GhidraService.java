package com.c1.enhancedghidra.ghidra;

import com.c1.enhancedghidra.filestore.FileDownloadResponse;
import com.c1.enhancedghidra.profile.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

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
        Path tempDirPath = Paths.get(System.getProperty("java.io.tmpdir"));
        String projectName = UUID.randomUUID().toString();
        Path projectDir = null;
        try {
            projectDir = Files.createTempDirectory(tempDirPath, projectName);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        ProcessBuilder processBuilder = new ProcessBuilder(
                "bash", "-c",
                "\"/mnt/c/Users/lejas/Desktop/repo/451_C3/src/main/ghidra_10.4_PUBLIC/support/analyzeHeadless " +
                        projectDir.toString().replace("\\", "/").replace("C:/", "/mnt/c/") + " " +
                        projectName + " -import " +
                        file.getAbsolutePath().replace("\\", "/").replace("C:/", "/mnt/c/") + " -scriptPath " +
                        "/mnt/c/Users/lejas/Desktop/repo/451_C3/src/main/ghidra_scripts -postScript " +
                        "DetectVulnerabilites.py" + "\""
        );




        processBuilder.redirectErrorStream(true);

        List<Map<String, String>> outputList = new ArrayList<>();
        try {
            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println(line);
                     Map<String, String> parsedLine = parseLine(line); // Implement parseLine to convert the line to a Map
                     outputList.add(parsedLine);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        try {
            Files.walk(projectDir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        return outputList;
    }

    private Map<String, String> parseLine(String line) {
        Gson gson = new Gson();
        try {
            // Convert to valid JSON by replacing single quotes with double quotes and removing 'u' prefix
            String jsonLine = line.replace("'", "\"").replace("u\"", "\"");
            return gson.fromJson(jsonLine, Map.class);
        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            return null; // or handle the error as appropriate
        }
    }


}
