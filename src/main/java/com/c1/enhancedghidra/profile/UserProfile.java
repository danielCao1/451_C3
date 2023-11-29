package com.c1.enhancedghidra.profile;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

public class UserProfile {
    private UUID userProfileId;
    private String username;
    private String binaryFileLink; // S3 key

    public UserProfile(UUID userProfileId,
                       String username,
                       String binaryFileLink) {
        this.userProfileId = userProfileId;
        this.username = username;
        this.binaryFileLink = binaryFileLink;
    }

    public UUID getUserProfileId() {
        return userProfileId;
    }

    public void setUserProfileId(UUID userProfileId) {
        this.userProfileId = userProfileId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Optional<String> getBinaryFileLink() {
        return Optional.ofNullable(binaryFileLink);
    }

    public void setBinaryFileLink(String binaryFileLink) {
        this.binaryFileLink = binaryFileLink;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserProfile that = (UserProfile) o;
        return Objects.equals(userProfileId, that.userProfileId) &&
                Objects.equals(username, that.username) &&
                Objects.equals(binaryFileLink, that.binaryFileLink);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userProfileId, username, binaryFileLink);
    }
}
