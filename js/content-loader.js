/**
 * 启商智策管理咨询 — 内容加载器
 * 从 CMS 管理的 JSON 文件加载页面内容，替换硬编码内容
 * 如果加载失败，保留默认内容作为后备
 */

var ContentLoader = (function () {
    'use strict';

    var BASE = 'content/sections/';

    // 从同域加载 JSON 文件
    function fetchJSON(path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    callback(JSON.parse(xhr.responseText));
                } catch (e) {
                    console.warn('JSON parse error for', path);
                    callback(null);
                }
            } else {
                console.warn('Failed to load', path, xhr.status);
                callback(null);
            }
        };
        xhr.onerror = function () {
            console.warn('Network error loading', path);
            callback(null);
        };
        xhr.send();
    }

    // ========== 更新 Hero ==========
    function updateHero(data) {
        if (!data || !data.hero) return;
        var h = data.hero;
        var title = document.querySelector('.hero-title');
        var subtitle = document.querySelector('.hero-subtitle');
        var desc = document.querySelector('.hero-description');
        var btnPrimary = document.querySelector('.hero-buttons .btn-primary');
        var btnSecondary = document.querySelector('.hero-buttons .btn-outline');

        if (title) title.textContent = h.title;
        if (subtitle) subtitle.textContent = h.subtitle;
        if (desc) desc.textContent = h.description;
        if (btnPrimary) btnPrimary.textContent = h.btnPrimary;
        if (btnSecondary) btnSecondary.textContent = h.btnSecondary;
    }

    // ========== 更新导航和页面标题 ==========
    function updateBranding(data) {
        if (!data) return;
        var logoTexts = document.querySelectorAll('.logo-text');
        logoTexts.forEach(function (el) {
            // 保持结构：主标题 + 高亮部分
            var highlight = el.querySelector('.logo-highlight');
            if (data.hero && data.hero.title && highlight) {
                // 尝试分离品牌名
                var fullTitle = data.hero.title;
                el.childNodes[0].textContent = fullTitle.replace('管理咨询', '');
            }
        });

        // 更新页面 title
        if (data.hero && data.hero.title) {
            document.title = data.hero.title + ' | 赋能企业成长';
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && data.hero.description) {
                metaDesc.setAttribute('content', data.hero.title + ' — ' + data.hero.description);
            }
        }
    }

    // ========== 更新页脚 ==========
    function updateFooter(data) {
        if (!data || !data.footer) return;
        var f = data.footer;
        var brandH3 = document.querySelector('.footer-brand h3');
        var brandP = document.querySelector('.footer-brand p');
        var copyright = document.querySelector('.footer-bottom p');

        if (brandH3) brandH3.textContent = f.brandName;
        if (brandP) brandP.textContent = f.tagline;
        if (copyright) copyright.textContent = f.copyright;

        // 微信公众号
        var qrPlaceholder = document.querySelector('.footer-wechat');
        if (qrPlaceholder && f.wechatQr) {
            qrPlaceholder.innerHTML = '<img src="' + f.wechatQr + '" alt="微信公众号" style="width:120px;height:120px;object-fit:contain;border-radius:8px;">' +
                (f.wechatName ? '<p style="margin-top:8px;font-size:0.82rem;color:rgba(255,255,255,0.55);">' + f.wechatName + '</p>' : '');
        }
    }

    // ========== 更新关于我们 ==========
    function updateAbout(data) {
        if (!data) return;
        var about = document.getElementById('about');
        if (!about) return;

        // 标题
        var heading = about.querySelector('.section-title');
        var subtitle = about.querySelector('.section-subtitle');
        if (heading) heading.textContent = data.heading;
        if (subtitle) subtitle.textContent = data.subtitle;

        // 公司名称
        var companyH3 = about.querySelector('.about-text h3');
        if (companyH3) companyH3.textContent = data.companyName;

        // 简介段落
        var paragraphs = about.querySelectorAll('.about-text p');
        if (data.intro && data.intro.length) {
            for (var i = 0; i < Math.min(paragraphs.length, data.intro.length); i++) {
                paragraphs[i].textContent = data.intro[i];
            }
        }

        // 统计数据
        var statItems = about.querySelectorAll('.stat-item');
        if (data.stats && data.stats.length) {
            for (var j = 0; j < Math.min(statItems.length, data.stats.length); j++) {
                var numEl = statItems[j].querySelector('.stat-number');
                var labelEl = statItems[j].querySelector('.stat-label');
                if (numEl) numEl.textContent = data.stats[j].number;
                if (labelEl) labelEl.textContent = data.stats[j].label;
            }
        }

        // 使命/愿景/价值观
        var valueCards = about.querySelectorAll('.value-card p');
        if (valueCards.length >= 3) {
            if (data.mission) valueCards[0].textContent = data.mission;
            if (data.vision) valueCards[1].textContent = data.vision;
            if (data.values) valueCards[2].textContent = data.values;
        }
    }

    // ========== 更新服务项目 ==========
    function updateServices(data) {
        if (!data) return;
        var services = document.getElementById('services');
        if (!services) return;

        var heading = services.querySelector('.section-title');
        var subtitle = services.querySelector('.section-subtitle');
        if (heading) heading.textContent = data.heading;
        if (subtitle) subtitle.textContent = data.subtitle;

        // 服务卡片
        if (!data.items || !data.items.length) return;
        var grid = services.querySelector('.services-grid');
        if (!grid) return;

        var html = '';
        data.items.forEach(function (item) {
            var detailsHtml = '';
            if (item.details && item.details.length) {
                detailsHtml = '<ul>' + item.details.map(function (d) {
                    return '<li>' + d + '</li>';
                }).join('') + '</ul>';
            }
            html += '' +
                '<div class="service-card">' +
                '<div class="service-icon">' + (item.icon || '📌') + '</div>' +
                '<h3>' + item.title + '</h3>' +
                '<p>' + item.description + '</p>' +
                detailsHtml +
                '</div>';
        });
        grid.innerHTML = html;

        // 重新触发滚动动画
        if (typeof window.reinitAnimations === 'function') {
            window.reinitAnimations();
        }
    }

    // ========== 更新联系方式 ==========
    function updateContact(data) {
        if (!data) return;
        var contact = document.getElementById('contact');
        if (!contact) return;

        var heading = contact.querySelector('.section-title');
        var subtitle = contact.querySelector('.section-subtitle');
        if (heading) heading.textContent = data.heading;
        if (subtitle) subtitle.textContent = data.subtitle;

        var contactItems = contact.querySelectorAll('.contact-item p');
        // contact-items: address, phone, email, hours
        if (contactItems.length >= 4) {
            if (data.address) contactItems[0].textContent = data.address;
            if (data.phone) contactItems[1].textContent = data.phone;
            if (data.email) contactItems[2].textContent = data.email;
            if (data.hours) contactItems[3].textContent = data.hours;
        }
    }

    // ========== 主初始化 ==========
    function init() {
        // 加载网站配置 → Hero + 页脚
        fetchJSON(BASE + 'site-config.json', function (data) {
            if (data) {
                updateHero(data);
                updateBranding(data);
                updateFooter(data);
            }
        });

        // 加载关于我们
        fetchJSON(BASE + 'about.json', function (data) {
            if (data) updateAbout(data);
        });

        // 加载服务项目
        fetchJSON(BASE + 'services.json', function (data) {
            if (data) updateServices(data);
        });

        // 加载联系方式
        fetchJSON(BASE + 'contact.json', function (data) {
            if (data) updateContact(data);
        });
    }

    // ========== 公开 API ==========
    return {
        init: init
    };

})();

// 自动初始化
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        ContentLoader.init();
    });
}
