/**
 * 启商智策管理咨询 — 新闻加载器
 * 负责加载 news.json，渲染新闻列表和详情
 */

var NewsLoader = (function () {
    'use strict';

    var NEWS_JSON_URL = 'content/news.json';
    var NEWS_DIR = 'content/news/';
    var ITEMS_PER_PAGE = 6;
    var allNews = [];
    var currentPage = 0;
    var currentCategory = 'all';
    var markedReady = false;

    // ========== Markdown 简易渲染 ==========
    function renderMarkdown(md) {
        if (!md) return '';
        var html = md
            // 标题
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // 粗体 + 斜体
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // 行内代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 无序列表
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            // 有序列表
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 段落：连续两个换行
            .replace(/\n\n/g, '</p><p>')
            // 单个换行
            .replace(/\n/g, '<br>')
            // 水平线
            .replace(/^---$/gm, '<hr>');

        // 包裹段落
        html = '<p>' + html + '</p>';
        // 清理空段落和嵌套问题
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p><ul>/g, '<ul>');
        html = html.replace(/<\/ul><\/p>/g, '</ul>');
        html = html.replace(/<p><h([1-3])>/g, '<h$1>');
        html = html.replace(/<\/h([1-3])><\/p>/g, '</h$1>');
        html = html.replace(/<p><hr><\/p>/g, '<hr>');

        return html;
    }

    // ========== 日期格式化 ==========
    function formatDate(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        var year = d.getFullYear();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return year + '年' + month + '月' + day + '日';
    }

    // ========== 加载 JSON 索引 ==========
    function loadNewsIndex(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', NEWS_JSON_URL, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    allNews = JSON.parse(xhr.responseText);
                } catch (e) {
                    allNews = [];
                }
            } else {
                allNews = [];
            }
            if (callback) callback(allNews);
        };
        xhr.onerror = function () {
            allNews = [];
            if (callback) callback([]);
        };
        xhr.send();
    }

    // ========== 创建新闻卡片 HTML ==========
    function createNewsCard(article) {
        var categoryClass = '';
        switch (article.category) {
            case '公司新闻': categoryClass = 'cat-company'; break;
            case '行业洞察': categoryClass = 'cat-insight'; break;
            case '案例分享': categoryClass = 'cat-case'; break;
            case '活动预告': categoryClass = 'cat-event'; break;
        }

        return '' +
            '<article class="news-card" data-slug="' + article.slug + '">' +
            (article.image ? '<div class="news-card-image"><img src="' + article.image + '" alt="' + article.title + '" loading="lazy"></div>' : '') +
            '<div class="news-card-body">' +
            '<span class="news-card-category ' + categoryClass + '">' + article.category + '</span>' +
            '<h3 class="news-card-title"><a href="javascript:void(0)" onclick="NewsLoader.openDetail(\'' + article.slug + '\')">' + article.title + '</a></h3>' +
            '<p class="news-card-summary">' + (article.summary || '') + '</p>' +
            '<span class="news-card-date">' + formatDate(article.date) + '</span>' +
            '</div>' +
            '</article>';
    }

    // ========== 过滤新闻 ==========
    function filterNews() {
        if (currentCategory === 'all') return allNews;
        return allNews.filter(function (a) {
            return a.category === currentCategory;
        });
    }

    // ========== 初始化列表页 ==========
    function initListPage() {
        loadNewsIndex(function () {
            renderListPage();
            setupFilters();
        });
    }

    function renderListPage() {
        var grid = document.getElementById('newsGrid');
        var loadMore = document.getElementById('newsLoadMore');
        if (!grid) return;

        var filtered = filterNews();
        currentPage = 0;

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="news-empty"><p>暂无新闻</p></div>';
            if (loadMore) loadMore.style.display = 'none';
            return;
        }

        // 显示第一页
        var pageItems = filtered.slice(0, ITEMS_PER_PAGE);
        grid.innerHTML = pageItems.map(createNewsCard).join('');

        // 显示/隐藏加载更多
        if (filtered.length > ITEMS_PER_PAGE) {
            if (loadMore) loadMore.style.display = 'block';
        } else {
            if (loadMore) loadMore.style.display = 'none';
        }
    }

    function setupFilters() {
        var filters = document.getElementById('newsFilters');
        if (!filters) return;

        filters.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-btn');
            if (!btn) return;

            // 更新 active 状态
            filters.querySelectorAll('.filter-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-category');
            renderListPage();
        });

        // 加载更多
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function () {
                var filtered = filterNews();
                currentPage++;
                var start = currentPage * ITEMS_PER_PAGE;
                var end = start + ITEMS_PER_PAGE;
                var pageItems = filtered.slice(start, end);

                var grid = document.getElementById('newsGrid');
                pageItems.forEach(function (article) {
                    var temp = document.createElement('div');
                    temp.innerHTML = createNewsCard(article);
                    grid.appendChild(temp.firstElementChild);
                });

                if (end >= filtered.length) {
                    document.getElementById('newsLoadMore').style.display = 'none';
                }
            });
        }
    }

    // ========== 初始化首页模块 ==========
    function initHomeModule(containerId) {
        loadNewsIndex(function () {
            var container = document.getElementById(containerId);
            if (!container) return;

            // 取最近 3 条
            var recent = allNews.slice(0, 3);

            if (recent.length === 0) {
                container.innerHTML = '<div class="news-empty"><p>暂无新闻</p></div>';
                return;
            }

            container.innerHTML = recent.map(function (article) {
                return '' +
                    '<div class="news-card home-news-card" data-slug="' + article.slug + '" onclick="NewsLoader.openDetail(\'' + article.slug + '\')" style="cursor:pointer;">' +
                    '<span class="news-card-category">' + article.category + '</span>' +
                    '<h3>' + article.title + '</h3>' +
                    '<p class="news-card-summary">' + (article.summary || '') + '</p>' +
                    '<span class="news-card-date">' + formatDate(article.date) + '</span>' +
                    '</div>';
            }).join('');

            // 添加"查看全部"链接
            container.innerHTML += '' +
                '<div class="news-view-all">' +
                '<a href="news.html" class="btn btn-outline-dark">查看全部新闻 →</a>' +
                '</div>';
        });
    }

    // ========== 打开新闻详情弹窗 ==========
    function openDetail(slug) {
        var modal = document.getElementById('newsModal');
        var content = document.getElementById('newsModalContent');
        if (!modal || !content) return;

        modal.classList.add('active');
        content.innerHTML = '<div class="news-loading"><p>加载中...</p></div>';
        document.body.style.overflow = 'hidden';

        // 加载 markdown 文件
        var xhr = new XMLHttpRequest();
        xhr.open('GET', NEWS_DIR + slug + '.md', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var text = xhr.responseText;
                // 解析 frontmatter
                var match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
                var meta = {};
                var bodyHtml = '';

                if (match) {
                    // 解析 frontmatter
                    match[1].split('\n').forEach(function (line) {
                        var kv = line.match(/^(\w+):\s*(.*)$/);
                        if (kv) {
                            meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
                        }
                    });
                    bodyHtml = renderMarkdown(match[2]);
                } else {
                    bodyHtml = renderMarkdown(text);
                }

                content.innerHTML = '' +
                    '<div class="news-detail">' +
                    '<span class="news-card-category">' + (meta.category || '') + '</span>' +
                    '<h1 class="news-detail-title">' + (meta.title || '') + '</h1>' +
                    '<p class="news-detail-date">' + formatDate(meta.date) + '</p>' +
                    (meta.image ? '<img src="' + meta.image + '" alt="' + meta.title + '" class="news-detail-image">' : '') +
                    '<div class="news-detail-body">' + bodyHtml + '</div>' +
                    '</div>';
            } else {
                content.innerHTML = '<div class="news-empty"><p>文章加载失败，请稍后重试</p></div>';
            }
        };
        xhr.onerror = function () {
            content.innerHTML = '<div class="news-empty"><p>文章加载失败，请稍后重试</p></div>';
        };
        xhr.send();
    }

    function closeDetail() {
        var modal = document.getElementById('newsModal');
        if (modal) {
            modal.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    // ========== 弹窗关闭事件 ==========
    function setupModal() {
        var modal = document.getElementById('newsModal');
        var closeBtn = document.getElementById('newsModalClose');
        if (!modal) return;

        closeBtn.addEventListener('click', closeDetail);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeDetail();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeDetail();
        });
    }

    // 初始化弹窗
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function () {
            setupModal();
        });
    }

    // ========== 公开 API ==========
    return {
        initListPage: initListPage,
        initHomeModule: initHomeModule,
        openDetail: openDetail,
        closeDetail: closeDetail,
        loadNewsIndex: loadNewsIndex
    };

})();
