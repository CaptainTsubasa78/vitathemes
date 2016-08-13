/*
    While I'm not trying to enforce how creators present their themes in self posts,
    I will require consistency for my own sanity.

    For self-posts to pass the checks, they will require the following syntax:
    [Download](direct link to download file or page)
        Example: [Preview](http://download.site/theme.zip)
        If this is not available, no quick download link will be provided.
    [Preview](direct link to desired preview image)
        Example: [Preview](http://imgur.com/myimage.jpg)
        If this is not provided, Reddit's fallback will be used if available otherwise the post will be skipped.
        URLs are not verified for being available, thus non-existant images will be displayed accordingly.

        For security, the only allowed image domain is Imgur.
        Imgur album support for the first image may eventually be implemented, but it is not currently.
    None of these are case-sensitive.


*/

var VitaThemes = {
    cache: [],
    config: {
        'blah': false,
        'page': {
            running: false, //Probably bad way to do this. Tracking if we're currently processing the page load.
            buffer: 150,    //Amount of pixels within range of the bottom of the screen to load the next page.
            size: 20,       //Amount of results to cap at per page. Doesn't guarantee amount that will pass processing checks.
            after: "",      //Current page.
        }
    },
    init: function() {
        console.log('hi');

        info = {
            'name': 'P4 Is Fun',
            'previewUrl': 'testing/p3m2.jpg'
        }

        this.bind();
        this.fetch.reddit();
    },
    bind: function() {
        var that = this;

        //Searching
        $("#run_search").click(function(e) {
            e.preventDefault();
            that.search();
        });
        $("#search").keyup(function(e){
            if(e.keyCode == 13) { that.search(); }
        });

        //Scrolling
        $(window).scroll(function() {
           //Eventually add thumbnail lazy loading.
           if(that.config.page.running == false && $(window).scrollTop() + $(window).height() >= $(document).height() - that.config.page.buffer) {
               console.log('bottom');
               that.config.page.running = true; //Prevent spamming.
               that.fetch.reddit(); //Do thing.
           }
        });
    },
    search: function() {
        //Empty cache, clear page, reset pagination.
        this.cache = [];
        $('#items').html("");
        this.config.page.after = "";

        this.fetch.reddit();
    },
    run: function(empty) {
        var that = this,
            start = $(".item").last().index() + 1;

        $.each(this.cache.slice(start), function(index, value) {
            $('#items').append(that.generate.item(value));
        });
    },
    fetch: {
        parse: function(info) {
            //Determine if we can get the info we need

            //info.self, info.is_self
            /*  Attempt to detect the link to the preview image in the selftext, otherwise attempt to use Reddit's fallback.
                Currently doesn't care about what's at the other end of the URL. The policing should be done via the subreddit.
            */

            var preview;
            
            //Check if the provided preview link is imgur.
            if (info.selftext && /\[preview\]\((.+?)\)/im.test(info.selftext)) {
                var imgur = /^(?:https?:\/\/)?(?:(?:i|www)\.)?imgur\.com\/([a-z0-9]{3,})/i, //Overkill.
                    temp = info.selftext.match(/\[preview\]\((.+?)\)/im).pop();
                
                //If imgur, sanitize the URL and proceed. Otherwise set to false.
                preview = (imgur.test(temp)) ? temp.replace(/https?:/, "") : false;
            };
            if (!preview) { preview = (info.preview && info.preview.images[0].source.url || false); }

            if (!preview) {
                console.log('No preview.', info); //Log problematic items.
                return false;
            }

            var download = (info.selftext && /\[download\]\((.+?)\)/im.test(info.selftext)) ? info.selftext.match(/\[download\]\((.+?)\)/im).pop() : false;

            var info = {
                'name': info.title.replace(/\[(Theme|Release)\]/ig, ""),
                'author': info.author,
                'url': info.url,
                'downloadUrl': download,
                'previewUrl': preview,
                'stats': {
                    'comments': info.num_comments,
                    'votes': {
                        'up': info.ups,
                        'down': info.downs
                    }
                }
            };

            return info;
        },
        process: function (info) {
            var temp = this.parse(info);

            if (temp !== false)
                VitaThemes.cache.push(temp);
        },
        reddit: function(callback) {
            var that = this;

            if (VitaThemes.config.page.after == null) { //If this is null, we've hit the end of the results.
                VitaThemes.config.page.running = false;
                (callback || VitaThemes.run());
                return false;
            }

            //Obtain search box for options
            var search = encodeURIComponent($("#search").val()),
                sort = $("select#sort").val(),
                t = $("select#t").val(),
                pagination = "after=" + (VitaThemes.config.page.after || "") + "&limit=" + VitaThemes.config.page.size,
                out = (search.length > 0) ? "search.json?restrict_sr=on&sort="+sort+"&t="+t+"&"+pagination+"&q="+search : ".json?"+pagination;

            $.getJSON("https://www.reddit.com/r/vitathemes/"+out, function(data) {
                var after = data.data.after,
                    before = data.data.before;
                console.log(after, before, data);

                $.each(data.data.children, function(index, content) {
                    that.process(content.data);
                });

                VitaThemes.config.page.after = data.data.after; //Store for pagination.

                VitaThemes.config.page.running = false;
                (callback || VitaThemes.run());
            });
        }
    },
    generate: {
        item: function(info) {
            /*
                info.name, info.url, info.votes?, img.preview, etc.

            */
            var item = $("<div />", {class: 'item'});

            //Populate
            $("<img />", {class: 'preview', src: info.previewUrl}).appendTo(item); //Append the preview image.
            $("<div />", {class: 'name', text: info.name}).appendTo(item); //Append the name.
            this.quicklinks(info).appendTo(item); //Append quicklinks.

            //item = $("<div />", {class: 'col-sm-3'}).append(item); //Wrap up for Bootstrap

            return item;
        },
        quicklinks: function(info) {
            //Overly complicated yet future-proof HTML generation. Don't judge me.
            var quicklinks = $("<div />", {class: 'quicklinks'}),
                fa_global = 'fa fa-fw ';


            if (info.downloadUrl !== false) {
                $("<a />", {href: info.downloadUrl, target: '_blank'}).append($("<i />", {class:fa_global+'fa-download'})).appendTo(quicklinks);
            }
            $("<a />", {href: info.url, target: '_blank'}).append($("<i />", {class:fa_global+'fa-reddit'})).appendTo(quicklinks);

            //Stats
            var icon = $("<i />", {class:fa_global+'fa-arrow-up'})[0].outerHTML,
                up = $("<span />", {class: 'up boats', text: +info.stats.votes.up})[0].outerHTML,
                down = $("<span />", {class: 'down boats', text: info.stats.votes.down})[0].outerHTML   ;
            $("<div />", {class: 'stats', html: icon + up + " / " + down}).appendTo(quicklinks);

            return quicklinks;
        }
    }
}

$(document).ready(function() {
    VitaThemes.init()
});