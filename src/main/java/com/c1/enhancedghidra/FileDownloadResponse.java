package com.c1.enhancedghidra;

public class FileDownloadResponse {
    private final byte[] fileData;
    private final String fileName;

    public FileDownloadResponse(byte[] fileData, String fileName) {
        this.fileData = fileData;
        this.fileName = fileName;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public String getFileName() {
        return fileName;
    }
}
