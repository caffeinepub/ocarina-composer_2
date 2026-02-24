import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextSongId = 1;

  public type Note = {
    pitch : Text;
    duration : Text;
    timingPosition : Nat;
  };

  public type Song = {
    id : Nat;
    title : Text;
    description : Text;
    notes : [Note];
    lyrics : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let songs = Map.empty<Nat, Song>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create a new song
  public shared ({ caller }) func createSong(title : Text, description : Text, notes : [Note], lyrics : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create songs");
    };

    if (description == "" or title == "" or notes.isEmpty()) {
      Runtime.trap("You must provide a title, description, and at least one note");
    };

    let songId = nextSongId;
    nextSongId += 1;

    let newSong : Song = {
      id = songId;
      title;
      description;
      notes;
      lyrics;
    };

    songs.add(songId, newSong);
    songId;
  };

  // Get a specific song by ID
  public query ({ caller }) func getSong(id : Nat) : async ?Song {
    songs.get(id);
  };

  // Update an existing song
  public shared ({ caller }) func updateSong(id : Nat, title : Text, description : Text, notes : [Note], lyrics : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update songs");
    };

    switch (songs.get(id)) {
      case (null) {
        false;
      };
      case (_) {
        let updatedSong : Song = {
          id;
          title;
          description;
          notes;
          lyrics;
        };
        songs.add(id, updatedSong);
        true;
      };
    };
  };

  // Delete a song
  public shared ({ caller }) func deleteSong(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete songs");
    };

    switch (songs.get(id)) {
      case (null) { false };
      case (_) {
        songs.remove(id);
        true;
      };
    };
  };

  // List all songs
  public query ({ caller }) func listSongs() : async [Song] {
    songs.values().toArray();
  };
};
