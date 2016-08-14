##[VitaThemes](//repod.github.io/vitathemes)

This is a front-end driven website powered by the Reddit API and the [vitathemes subreddit](//reddit.com/r/vitathemes) as the backend.

##Features
 - 1:1 mirroring of the subreddit (barring ignored posts)
 - NSFW support (if/when used on the subreddit)
 - Mobile friendly
 - Full support of Reddit search, including advanced syntax
 - Ability to use custom subreddit or multireddits (r/sub1+sub2+...) (see below for details)
 - No donations for server funding
   - The website is (thankfully) hosted by GitHub.
   - The file hosting is up to to the post author.
   - The actual post info is (thankfully) provided by Reddit and its (generous) API.
 - Fully transparent and open source
   - The website, not the subreddit

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

While I have no say in what is allowed on the subreddit, it should go without saying (but just in case), this site also respects icon packs. Basically any post that meets the above criteria and is posted to the subreddit will appear on the site.

For instructions on how to use your own subreddit or multiple at once, see the [Custom subreddits](#custom-subreddits) section below.

##Removing your themes
At the time of writing, there's no way to selectively remove themes without deleting the post or intentionally failing the parser check (by not having a preview image).

If there is demand for it, a proper solution will be provided.

##Custom subreddits
When a search is executed, the search options are saved into the URL.

One of the options stored is the subreddit. Changing this to point where desired then opening the URL in a new tab will use that new subreddit as the target for that session/instance.

Example:
 - `https://repod.github.io/vitathemes/#!r/vitathemes/all/top/cool`
 - `https://repod.github.io/vitathemes/#!r/myvitathemes`
  - This uses short-hand to only supply the subreddit, the rest of the URL is not needed except for the actual search.
  - Changed from `r/vitathemes` to `r/myvitathemes`, the entire site will now use `r/myvitathemes`.
 - `https://repod.github.io/vitathemes/#!r/vitathemes+myvitathemes`
  - This uses short-hand to only supply the subreddit, the rest of the URL is not needed except for the actual search.
  - Changed to a multi: `r/vitathemes+myvitathemes`, note the `+`. The entire site will now use both subreddits.

##Site moderation and legal matters
None of the content obtained from the API shown on the site is actually *hosted* on the site (or GitHub, to the extent of this project). The Reddit API is accessed purely client-side, so any problematic material resulting from it is by the client's own request (including the default settings, therefore request) and they are responsible for it.

There is **no** direct moderation of the site. Any moderation, copyright/trademark, or relevant concerns related to the content should be forwarded to the appropriate subreddit moderators or [Reddit administration directly](//www.reddit.com/contact/).

This site is not sponsored, endorsed, or affiliated with/by Reddit.
