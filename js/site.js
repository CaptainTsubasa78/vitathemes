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

        $("#run_search").click(function(e) {
            e.preventDefault();
            that.search();
        });
        
        $(window).scroll(function() {
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

            /* info.self, info.is_self */
            if (!info.preview) return false; //For now. Eventually add enhanced support for text posts.

            var info = {
                'name': info.title.replace(/\[(Theme|Release)\]/ig, ""),
                'author': info.author,
                'previewUrl': (info.preview && info.preview.images[0].source.url || ''),
                'url': info.url,
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


            //$("<i />", {class:fa_global+'fa-download'}).appendTo(quicklinks);
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