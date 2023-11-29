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
        USER_PROFILES.add(new UserProfile(UUID.randomUUID(), "Jason", null));
        USER_PROFILES.add(new UserProfile(UUID.randomUUID(), "Daniel", null));
        USER_PROFILES.add(new UserProfile(UUID.randomUUID(), "Jacob", null));
    }

    public List<UserProfile> getUserProfiles() {
        return USER_PROFILES;
    }
}
