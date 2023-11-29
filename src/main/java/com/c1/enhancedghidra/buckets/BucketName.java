package com.c1.enhancedghidra.buckets;

public enum BucketName {
    BINARY_FILE("c3-enhanced-ghidra");

    private final String bucketName;

    BucketName(String bucketName) {
        this.bucketName = bucketName;
    }

    public String getBucketName() {
        return bucketName;
    }
}
