##[VitaThemes](//repod.github.io/vitathemes)

This is a front-end driven website powered by the Reddit API and the [vitathemes subreddit](//reddit.com/r/vitathemes) as the backend.

##Adding your themes
To add your theme, simply post it to the [vitathemes subreddit](//reddit.com/r/vitathemes) as you would normally.

To ensure compatability with self/text posts please include the following syntax:
- `[Download](http://mysite.com/theme.zip)` (optional)
  - If provided, an additional button will be displayed linking to the provided URL.
- `[Preview](http://imgur.com/abcdef.jpg)` (required)
  - Only Imgur is allowed for security reasons, thanks for understanding.
  - If you do not provide this, the site will attempt to use the Reddit API's fallback thumbnail.
  - If there is no API fallback thumbnail, the site will ignore your post.

These are not case-sensitive and can be placed anywhere in the post.    
*However*, the built-in parser will only use the *last* occurance of each.

##Removing your themes
At the time of writing, there's no way to selectively remove themes (aside from deletion) other than failing the parser check (by not having a preview image).

If there is demand for it, a solution will be provided.

##Site moderation and legal matters
None of the content shown on the site is actually *hosted* on the site (or GitHub, to the extent of this project).

There is **no** direct moderation of the site. Any moderation, copyright/trademark, or relevant concerns related to the content should be forwarded to the [vitathemes subreddit moderators](https://www.reddit.com/message/compose?to=%2Fr%2Fvitathemes).

This site is not sponsored, endorsed, or affiliated with/by Reddit.
