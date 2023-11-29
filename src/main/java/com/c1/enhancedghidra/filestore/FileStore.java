package com.c1.enhancedghidra.filestore;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.util.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@Service
public class FileStore {
    @Value("${application.bucket.name}")
    private String bucketName;
    private final AmazonS3 s3;

    @Autowired
    public FileStore(AmazonS3 s3) {
        this.s3 = s3;
    }

    public void uploadFile(String key, MultipartFile file) {
        File fileObj = convertMultiPartFileToFile(file);
        try {
            s3.putObject(new PutObjectRequest(bucketName, key, fileObj));
        } finally {
            fileObj.delete();
        }
    }

    public byte[] downloadFile(String key) {
        S3Object s3Object = s3.getObject(bucketName, key);
        S3ObjectInputStream inputStream = s3Object.getObjectContent();
        try {
            byte[] content = IOUtils.toByteArray(inputStream);
            return content;
        } catch (AmazonServiceException | IOException error) {
            throw new IllegalStateException("Failed to download file from s3", error);
        }
    }


    private File convertMultiPartFileToFile(MultipartFile file) {
        File convertedFile = new File(file.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
            fos.write(file.getBytes());
        } catch (IOException error) {
            throw new IllegalStateException("Error converting multipartFile to file", error);
        }
        return convertedFile;
    }



}
