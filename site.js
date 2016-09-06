/* VitaThemes, (c) RePod, https://github.com/RePod/vitathemes/blob/gh-pages/LICENSE */

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
        'ignoreInvalid': true,
        'target': 'r/vitathemes+vitahacks', //Read target to fetch info. Should also support multireddits (r/sub1+sub2)
        'page': {
            running: false, //Probably bad way to do this. Tracking if we're currently processing the page load.
            buffer: 150,    //Amount of pixels within range of the bottom of the screen to load the next page.
            size: 25,       //Amount of results to cap at per page. Doesn't guarantee amount that will pass processing checks.
            after: "",      //Current page.
        }
    },
    saveConfig: function(time, sort, search) {
        //Store search options in URL hash. Array and join?
        window.location.hash = (time && sort && search) ? [VitaThemes.config.target, time, sort, search].join("/") : (this.config.target !== 'r/vitathemes+vitahacks') ? this.config.target : '';
    },
    loadConfig: function() {
        //Load initial search options based on URL hash. Currently unoptimized and prone to huge failure!
        var temp = window.location.hash.split('/'); // ["#r", subreddit(s), time, sort, search]

        if (temp.length < 2) return false;

        this.config.target = "r/"+temp[1]; //Life is simply unfair.
        if (temp[2]) $("select#t").find("[value^="+temp[2]+"]").attr("selected", "selected");
        if (temp[3]) $("select#sort").find("[value^="+temp[3]+"]").attr("selected", "selected");
        if (temp[4]) $("#search").val(decodeURIComponent(temp[4]));
    },
    init: function() {
        console.log("init called, it's a miracle");

        this.loadConfig();
        $("#subreddit_link").attr({title: this.config.target, href: '//reddit.com/'+this.config.target});
        this.bind();

        this.doScroll();
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

        $(document).on('click', '.author', function() {
            $("#search").val("author:"+$(this).text());
            that.search();
        });

        //Scrolling
        $(window).scroll(function() { that.doScroll(); });
        $("#infinite_scroll").click(function() { that.doScroll(); });
    },
    doScroll: function(skip) {
        if (VitaThemes.config.page.after !== null && this.canScroll()) {
            this.config.page.running = true; //Prevent spamming.
            this.fetch.reddit(false, true); //Do thing. No callback (false), noSave (true).
        }
    },
    canScroll: function() {
        var buffer = $(document).height() - this.config.page.buffer
            bar = $("#infinite_scroll").offset().top,
            max = $(window).scrollTop() + $(window).height();

        return (!this.config.page.running && (bar <= max) /*|| (max >= buffer)*/);
    },
    search: function() {
        //Empty cache, clear page, reset pagination.
        this.config.page.running = true;
        this.cache = [];
        $('#items').html("");
        this.config.page.after = "";

        this.fetch.reddit();
    },
    run: function() {
        var that = this,
            start = ($(".item") && $(".item").last().index() + 1 || 0);

        $.each(this.cache.slice(start), function(index, value) {
            $('#items').append(that.generate.item(value));
        });

        this.doScroll();
    },
    fetch: {
        parse: function(info) {
            //Determine if we can get the info we need

            //info.self, info.is_self
            /*  Attempt to detect the link to the preview image in the selftext, otherwise attempt to use Reddit's fallback.
                Currently doesn't care about what's at the other end of the URL. The policing should be done via the subreddit.
            */

            var preview = this.detectUrl.preview(info);
            if (!preview) return false;

            //Check title
            if (/(^\[?request|tutorial)/i.test(info.title) ||
                (info.subreddit == "vitahacks" && !/theme/i.test(info.title))
            ) {
                console.warn('Potentially irrelevant post detected. (based on title)', info);
                return false;
            }

            var info = {
                'name': info.title.replace(/\[(Theme|Release)\]/ig, ""),
                'author': info.author,
                'url': info.url, //Whatever the post may link to (otherwise, to the thread)
                'permalink': "//reddit.com"+info.permalink, //Permalink to the thread
                'downloadUrl': this.detectUrl.download(info),
                'previewUrl': preview,
                'time': info.created_utc,
                'nsfw': info.over_18,
                'stats': {
                    'archived': info.archived,
                    'comments': info.num_comments,
                    'votes': {
                        'up': info.ups,
                        'down': info.downs
                    }
                }
            }

            return info;
        },
        detectUrl: {
            preview: function(info) {
                //Check if the provided preview link is imgur.
                var preview = false;

                if (info.selftext && /\[preview\]\((.+?)\)/im.test(info.selftext)) {
                    var imgur = /^(?:https?:\/\/)?(?:(?:i|www)\.)?imgur\.com\/(?!gallery)([a-z0-9]{3,})/i, //Overkill.
                        temp = info.selftext.match(/\[preview\]\((.+?)\)/im).pop();

                    //If imgur, sanitize the URL and proceed. Otherwise set to false.
                    preview = (imgur.test(temp)) ? temp : false;
                }

                if (!preview) {
                    if (!info.preview || !info.preview.images[0]) {
                        preview = false;
                    } else {
                        //This disgusts me, but it works and should save a lot of bandwidth.
                        var base = info.preview.images[0];
                        preview = (
                                    (base.resolutions &&
                                        (
                                           base.resolutions[2] && base.resolutions[2].url
                                        || base.resolutions[1] && base.resolutions[1].url
                                        || base.resolutions[0] && base.resolutions[0].url
                                        )
                                    )
                                    || base.source.url
                                  );
                        preview = preview.replace(/&amp;/g,"&");
                    }
                }

                if (!preview && VitaThemes.config.ignoreInvalid == true) {
                    console.warn('No preview.', info); //Log problematic items.
                    return false;
                }

                if (location.protocol !== 'file:')
                    preview = preview.replace(/https?:/, ""); //Remove instances of http: and https: to inherit protocol.

                return preview;
            },
            download: function(info) {
                //Check for download link
                var download = false,
                    search = [
                    {t: 'selftext_html', regex: /(DL|Download):? *&lt;a href="(.+?)"/im},
                    {t: 'selftext', regex: /\[download\]\((.+?)\)/im}
                ];

                $.each(search, function (i, search) {
                    var target = info[search.t];

                    if (target && search.regex.test(target)) {
                        download = target.match(search.regex).pop();
                        return true;
                    }
                });

                return download;
            }
        },
        process: function(info) {
            var temp = this.parse(info);

            if (temp !== false)
                VitaThemes.cache.push(temp);
        },
        reddit: function(callback, noSave) {
            var that = this;

            if (VitaThemes.config.page.after == null) { //If this is null, we've hit the end of the results.
                VitaThemes.config.page.running = false;
                (callback || VitaThemes.run());
                return false;
            }

            $("#infinite_scroll #pending").show();
            $("#infinite_scroll #chickens").hide();

            //Obtain search box for options
            var search = encodeURIComponent($("#search").val()),
                sort = $("select#sort").val(),
                t = $("select#t").val(),
                scope = "sort="+sort+"&t="+t,
                pagination = "after=" + (VitaThemes.config.page.after || "") + "&limit=" + VitaThemes.config.page.size,
                out = (search.length > 0) ? "search.json?restrict_sr=on&"+scope+"&"+pagination+"&q="+search : ".json?"+scope+"&"+pagination;

            if (!noSave) VitaThemes.saveConfig(t, sort, search); //Store search options in URL hash.

            $.getJSON("https://www.reddit.com/"+VitaThemes.config.target+"/"+out, function(data) {
                var after = data.data.after,
                    before = data.data.before;
                //console.log(after, before, data);

                $.each(data.data.children, function(index, content) {
                    that.process(content.data);
                });

                VitaThemes.config.page.after = data.data.after; //Store for pagination.

                VitaThemes.config.page.running = false;
                $("#infinite_scroll #pending").hide();
                $("#infinite_scroll #chickens").show();
                (callback || VitaThemes.run());
            });
        }
    },
    generate: {
        item: function(info) {
            //info.name, info.url, info.votes?, img.preview, etc.
            var item = $("<div />", {class: 'item'});

            //Populate
            $("<a />", {href: info.url, target: '_blank'}).append(
                $("<img />", {class: 'preview ' + ((info.nsfw)?'nsfw':''), src: info.previewUrl}) //Append the preview image.
            ).appendTo(item);
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
                $("<a />", {href: info.downloadUrl, target: '_blank', title: 'Download'}).append($("<i />", {class:fa_global+'fa-download'})).appendTo(quicklinks);
            }

            var discuss = $("<a />", {class: 'discuss', href: info.permalink, target: '_blank', title: 'Discussion'})
            $("<div />", {class: 'comments', text: (info.stats.comments > 99) ? '99+' : info.stats.comments}).appendTo(discuss);
            $("<i />", {class: fa_global+'fa-comments'}).appendTo(discuss);
            discuss.appendTo(quicklinks);

            //Stats
            var icon = $("<i />", {class:fa_global+'fa-bar-chart'})[0].outerHTML,
                icon_comment = $("<span />", {class: fa_global+'fa-comment'})[0].outerHTML,
                icon_author = $("<span />", {class: fa_global+'fa-pencil'})[0].outerHTML,
                up = $("<span />", {class: 'up boats', title: 'Upvotes', text: +info.stats.votes.up})[0].outerHTML,
                down = $("<span />", {class: 'down boats', title: 'Downvotes', text: info.stats.votes.down})[0].outerHTML,

                author = $("<span />", {class: 'author', title: 'Search by author', html: icon_author + info.author})[0].outerHTML;

            $("<div />", {class: 'stats', html: icon + " " + up + " / " + down + "<br>" + author}).appendTo(quicklinks);

            return quicklinks;
        }
    }
}

$(document).ready(function() { VitaThemes.init() });