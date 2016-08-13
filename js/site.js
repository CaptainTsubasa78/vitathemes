var VitaThemes = {
    cache: [],
    config: {
        'blah': false,
        'page': 0
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
            console.log('hi?');
            e.preventDefault();
            
            //Empty cache, clear page, reset pagination.
            that.cache = [];
            $('#items').html("");
            that.config.page = 0;

            that.fetch.reddit();
        });
    },
    run: function(empty) {
        var that = this;
        
        
        $.each(this.cache, function(index, value) {
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

            //Obtain search box for options
            var search = encodeURIComponent($("#search").val()),
                sort = $("select#sort").val();
                t = $("select#t").val();
                out = (search.length > 0) ? "search.json?restrict_sr=on&sort="+sort+"&t="+t+"&q="+search : ".json";

            //format url
            //fetch
            $.getJSON("https://www.reddit.com/r/vitathemes/"+out, function(data) {
                $.each(data.data.children, function(index, content) {
                    that.process(content.data);
                });
                
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
                
            
            $("<i />", {class:fa_global+'fa-download'}).appendTo(quicklinks);
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