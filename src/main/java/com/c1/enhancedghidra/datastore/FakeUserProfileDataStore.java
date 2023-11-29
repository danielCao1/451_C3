package com.c1.enhancedghidra.datastore;


import com.c1.enhancedghidra.profile.UserProfile;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class FakeUserProfileDataStore {
    private static final List<UserProfile> USER_PROFILES = new ArrayList<>();

    static {
        USER_PROFILES.add(new UserProfile(UUID.fromString("2071f922-6895-420b-be19-cfa3dab7b9b2"), "Jason", null));
        USER_PROFILES.add(new UserProfile(UUID.fromString("53e8524b-df45-4fdf-a4ec-9c5f7f5912ff"), "Daniel", null));
        USER_PROFILES.add(new UserProfile(UUID.fromString("2d06fe31-64ca-48c7-8ebd-478152b7e3fa"), "Jacob", null));
    }

    public List<UserProfile> getUserProfiles() {
        return USER_PROFILES;
    }
}
