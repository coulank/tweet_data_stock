var done = "TLから集計するスクリプトを実行しました";
var observer = null;
var itv = null;
function tweet_data_get(doscr = false) {
    if (!doscr) return;
    tweet_data_stop(false);
    window.tweet_data = {};
    window.tweet_data.list = {};
    window.tweet_check = {};
    window.ogf = () => {
        document
            .querySelectorAll('[data-testid="tweet"]:not(.done)')
            .forEach((e) => {
                var t = e.querySelector("time"),
                    m,
                    x;
                if (t === null) return;
                var href = t.parentElement.href,
                    s = { href: href, img: [] };
                var dotask = (m = href.match(/status\/(\d+)/)) !== null;
                if (dotask)
                    dotask = typeof window.tweet_check[m[1]] === "undefined";
                if (dotask) {
                    s.id = m[1];
                    window.tweet_check[m[1]] = null;
                    e.querySelectorAll(
                        'div[role="group"] div[data-testid]'
                    ).forEach((x) => {
                        if (
                            (mm = x.dataset.testid.match(
                                /^(\w*)(retweet|like)$/
                            ))
                        ) {
                            s[mm[2]] = Number(
                                x
                                    .querySelector("div>span")
                                    .innerText.replace(/,/, "")
                            );
                            if (mm[1] === "un") {
                                s[mm[2]]--;
                            }
                        }
                    });
                    s.date = new Date(t.dateTime).toJSON();
                    if ((x = e.querySelector("[lang]"))) {
                        s.text = x.innerText;
                    } else {
                        s.text = "";
                    }
                    if (e.children.length > 1) {
                        e.children[1].querySelectorAll("img").forEach((x) => {
                            if (!x.src.match("/emoji/"))
                                s.img.push(x.src.replace(/&name[^&]*(|$)/, ""));
                        });
                    }
                    window.tweet_data.list[s.id] = s;
                }
                e.classList.add("done");
            });
    };
    //document.addEventListener("scroll", (e)=>{ogf()});
    document.onscroll = (e) => {
        ogf();
    };
    observer = new MutationObserver((records) => {
        console.log(records);
        tweet_data_stop();
    });
    observer.observe(document.querySelector("main"), { childList: true });
}
function tweet_data_stop(blmsg = true) {
    document.onscroll = null;
    if (itv !== null) {
        clearInterval(itv);
        itv = null;
    }
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    if (blmsg) console.log("停止完了");
}
function tweet_data_save_json() {
    var sn = "tweet_data.json";
    var b = new Blob([JSON.stringify(window.tweet_data)], {
        type: "application/json",
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = sn;
    a.click();
    return "JSONに出力";
}
async function tweet_data_load_json() {
    return new Promise((resolve, reject) => {
        var idi = "fs",
            LoadFile = (t, ol = () => {}) => {
                var file;
                if (t === null) {
                    return;
                } else {
                    file = t.files[0];
                    document.body.dataset.filename = file.name;
                }
                var rd = new FileReader();
                rd.readAsText(file);
                rd.onload = (e) => {
                    ol(rd.result);
                    resolve();
                };
                rd.onerror = (e) => {
                    resolve();
                };
            };
        var changed = false;
        var f = document.getElementById(idi);
        if (f !== null) {
            f.remove();
        }
        f = document.createElement("input");
        f.id = idi;
        f.type = "file";
        f.accept = ".json";
        f.addEventListener("change", (e) => {
            changed = true;
            LoadFile((bf = e.target), (e) => {
                window.tweet_data = JSON.parse(e);
                var yl = tweet_data_year_list();
                Object.keys(yl).forEach((e) => {
                    yl[e] = yl[e].length;
                });
                yl[0] = "JSONファイルを開きました";
                console.log(yl);
            });
        });
        document.head.appendChild(f);
        f.click();
        document.body.onfocus = () => {
            setTimeout(() => {
                document.body.onfocus = null;
                if (!changed) {
                    console.log("JSONの読み込みはしないままにしました");
                    resolve();
                }
            }, 500);
        };
        console.log("JSON用のファイルを開く");
    });
}
function tweet_data_list() {
    return Object.keys(tweet_data.list).map((e) => {
        return tweet_data.list[e];
    });
}
function tweet_data_year_list(year = null) {
    var list = {};
    if (year !== null) year = Number(year);
    tweet_data_list().forEach((e) => {
        var prc = true,
            y = new Date(e.date).getFullYear();
        if (year !== null && y !== year) prc = false;
        if (prc) {
            if (typeof list[y] === "undefined") {
                list[y] = [];
            }
            list[y].push(e);
        }
    });
    if (year !== null) {
        return list[year];
    } else {
        return list;
    }
}
function tweet_data_dump(until = -1, data = null, easy = true) {
    if (data === null) data = window.tweet_data.list;
    var list = Object.keys(data);
    if (until < 0 || until > list.length) until = list.length;
    for (var i = 0; i < until; i++) {
        var e = data[list[i]];
        console.log([
            e.text,
            e.retweet + " rt",
            e.like + " fv",
            new Date(e.date).toLocaleString({ timeZone: "Asia/Tokyo" }),
            e.href,
        ]);
    }
}
function tweet_data_sort(until = -1, view = "like", list = null, dump = false) {
    if (dump) {
        var retval = tweet_data_sort(view, until, list, false);
        console.log(view.toUpperCase() + "順のツイート一覧");
        tweet_data_sort(view, until, list, false).forEach((e) => {
            console.log([
                e.text,
                e.retweet + " rt",
                e.like + " fv",
                new Date(e.date).toLocaleString({ timeZone: "Asia/Tokyo" }),
                e.href,
            ]);
            return retval;
        });
    } else {
        if (list === null) list = tweet_data_list();
        var sort_list = list.sort((a, b) => {
            return b[view] - a[view];
        });
        var out_list = [];
        if (until < 0 || until > sort_list.length) until = sort_list.length;
        for (var i = 0; i < until; i++) {
            out_list.push(sort_list[i]);
        }
        return out_list;
    }
}
function tweet_data_top_num(until = 3, view = "like", since = 0, dump = true) {
    var list = {};
    var yl = tweet_data_year_list();
    Object.keys(yl)
        .filter((e) => {
            return e >= since;
        })
        .forEach((e) => {
            list[e] = tweet_data_sort(until, view, yl[e]);
            if (dump) {
                console.log(e + "年のトップ" + until);
                tweet_data_dump(until, list[e], true);
            }
        });
    return list;
}
function tweet_data_border_count(
    until = 30,
    view = "like",
    since = 0,
    dump = false
) {
    var list = {};
    var yl = tweet_data_year_list();
    Object.keys(yl)
        .filter((e) => {
            return e >= since;
        })
        .forEach((e) => {
            list[e] = yl[e].filter((e) => {
                return e[view] > until;
            }).length;
            if (dump) {
                console.log(e + "年:" + list[e]);
            }
        });
    return list;
}
function scrollAuto(height = innerHeight, interval = 500, func = () => {}) {
    var csy = scrollY;
    const itvf = () => {
        window.scrollBy(0, height);
        if (csy === scrollY) {
            clearInterval(itv);
        } else {
            csy = scrollY;
            func(csy, itv);
        }
    };
    var itv = setInterval(itvf, interval);
    itvf();
    return itv;
}
(async () => {
    var blm = Boolean(location.href.match(/twitter\.com\/search/));
    tweet_data_get(blm);
    await tweet_data_load_json();
    if (blm) itv = scrollAuto();
    return done;
})();
