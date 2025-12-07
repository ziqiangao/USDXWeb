# Song
An Object for a loaded song
- `getmetadata()` - returns the metadata parsed from the text file
- `getlyrics()` - returns the lyrics parsed from the text file
- `isduet()` - returns a boolean on weather the song is a duet
- `async parse()` - parse the text file
- `async storefilepointers()` - store references to the files after parsing
- `async getresource(resource)` - grab a file to that resource, or null if non-existent, can be one of 
- `getLineAt(line, player)` - get the line/page of the lyrics as an array of word objects
- `getLineAsString(line, player)` - get the line/page as an unbroken string
- `getAllLines(player)` - get all lines, seperated into an array of lines as a string
- `getAllLinesAsObjects(player)` - get all lines as wordobjects, seperated into an array of lines
- `beattoseconds(beat)` - convert beats into timestamp in seconds accounting for offsets
- `beattoseclength(beat)` - convert beats into seconds


# Globals
- `active` - the song index where the song is selected
- `currentsong` - the song object loaded into the player
- `Songs` - a list of loaded songs
- `SongwithMedley` - a list of songs which have a medley segment
- `currentjson` - the json object of `currentsong`
- `currentblockbase`, `currentblockp1`, `currentblockp2` - the currently highlighted word as an object
- `currentlinebase`, `currentlinep1`, `currentlinep2` - the current line as an object
- `songon` - weather a song is currently playing
- `previewon` - weather the preview is playing
- `audioprocessinput` - an audionode for later audio processing

# Functions
- `Getmedley(Song)` - returns the medley segment
- `pauseplayer()` - pauses the player
- `startplayer()` - resumes the player

# Callbacks
- `finished` - called when the song has ended, regardless of weather in preview or play mode
- `audioready` - called when the audio context is created