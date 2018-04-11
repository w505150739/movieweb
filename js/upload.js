(function(window){

    this.initWebUploader = function(webUploaderId, filePickerId, fileAddId, uploadUrl) {  //前三个参数对应的是jsp页面的div的id，最后一个参数，是后台调用的上传方法名字
        var $ = jQuery, // just in case. Make sure it's not an other library.

            $wrap = $(webUploaderId),

            // 图片容器
            $queue = $('<ul class="filelist"></ul>')
                .appendTo($wrap.find('.queueList')),

            // 状态栏，包括进度和控制按钮
            $statusBar = $wrap.find('.statusBar'),

            // 文件总体选择信息。
            $info = $statusBar.find('.info'),

            // 上传按钮
            $upload = $wrap.find('.uploadBtn'),

            // 没选择文件之前的内容。
            $placeHolder = $wrap.find('.placeholder'),

            // 总体进度条
            $progress = $statusBar.find('.progress').hide(),

            // 添加的文件数量
            fileCount = 0,

            // 添加的文件总大小
            fileSize = 0,

            // 优化retina, 在retina下这个值是2
            ratio = window.devicePixelRatio || 1,

            // 缩略图大小
            thumbnailWidth = 110 * ratio,
            thumbnailHeight = 110 * ratio,
            // thumbnailWidth = ratio,
            // thumbnailHeight = ratio,

            // 可能有pedding, ready, uploading, confirm, done.
            state = 'pedding',

            // 所有文件的进度信息，key为file id
            percentages = {},

            // WebUploader实例
            wuploader;
        if (!WebUploader.Uploader.support()) {
            //alert('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
            layer.msg('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器', { icon: 2 });
            throw new Error('WebUploader does not support the browser you are using.');
        }
        // 实例化
        wuploader = WebUploader.create({
            pick : {
                id : filePickerId,
                label : '点击选择图片'
            },
            dnd : webUploaderId + ' .queueList',
            paste : window.document.body,

            accept : {
                title : 'Images',
                extensions : 'gif,jpg,jpeg,bmp,png',
                mimeTypes : 'image/gif,image/jpg,image/jpeg,image/bmp,image/png'
            },

            // swf文件路径
            swf : '../../dist/Uploader.swf',

            disableGlobalDnd : true,

            chunked : true,
            server : uploadUrl,
            fileNumLimit : 10
        //fileSizeLimit: 5 * 1024 * 1024,    // 5 M
        //fileSingleSizeLimit: 1 * 1024 * 1024    // 1 M
        });
        // 添加“添加文件”的按钮，
        wuploader.addButton({
            id : fileAddId,
            label : '继续添加'
        });
        // 当有文件添加进来时执行，负责view的创建
        function addFile(file) {
            var $li = $('<li id="' + file.id + '">' +
                    // '<p class="title">' + file.name + '</p>' +
                    '<p class="imgWrap"></p>' +
                    '<p class="progress"><span></span></p>' +
                    '</li>'),
                $btns = $('<div class="file-panel">' +
                    '<span class="cancel">删除</span></div>').appendTo($li),
                $prgress = $li.find('p.progress span'),
                $wrap = $li.find('p.imgWrap'),
                $info = $('<p class="error"></p>'),
                showError = function(code) {
                    switch (code) {
                    case 'exceed_size':
                        text = '文件大小超出';
                        break;

                    case 'interrupt':
                        text = '上传暂停';
                        break;

                    default:
                        text = '上传失败，请重试';
                        break;
                    }

                    $info.text(text).appendTo($li);
                };

            if (file.getStatus() === 'invalid') {
                showError(file.statusText);
            } else {
                // @todo lazyload
                $wrap.text('预览中');
                wuploader.makeThumb(file, function(error, src) {
                    if (error) {
                        $wrap.text('不能预览');
                        return;
                    }
                    var img = $('<img src="'+src+'">');

                    // 使用data-fancybox-href，解决IE中图片显示的问题。
                    // TODO data-fancybox-group怎么确保唯一性？
                    // var img = $('<a class="fancybox" data-fancybox-group="gallery' + webUploaderId + '" data-fancybox-href="' + src + '"><img src="' + src + '"></a>');

                    $wrap.empty().append(img);
                }, thumbnailWidth, thumbnailHeight);

                percentages[file.id] = [ file.size, 0 ];
            }

            file.on('statuschange', function(cur, prev) {
                if (prev === 'progress') {
                    $prgress.hide().width(0);
                } else if (prev === 'queued') {
                    $li.off('mouseenter mouseleave');
                    $btns.remove();
                }
                // 成功
                if (cur === 'error' || cur === 'invalid') {
                    console.log(file.statusText);
                    showError(file.statusText);
                    percentages[file.id][1] = 1;
                } else if (cur === 'interrupt') {
                    showError('interrupt');
                } else if (cur === 'queued') {
                    percentages[file.id][1] = 0;
                } else if (cur === 'progress') {
                    $info.remove();
                    $prgress.css('display', 'block');
                } else if (cur === 'complete') {
                    $li.append('<span class="success"></span>');
                }
                $li.removeClass('state-' + prev).addClass('state-' + cur);
            });

            $li.on('mouseenter', function() {
                $btns.stop().animate({
                    height : 30
                });
            });

            $li.on('mouseleave', function() {
                $btns.stop().animate({
                    height : 0
                });
            });

            $btns.on('click', 'span', function() {
                var index = $(this).index(),
                    deg;
                switch (index) {
                case 0:
                    wuploader.removeFile(file);
                    return;
                }
            });
            $li.appendTo($queue);
        }
        // 负责view的销毁
        function doRemoveFile(file) {
            delete percentages[file.id];
            // 不处理“进度”的更新。让调用方自己负责更新。   by tanzx 2017-08-01
            //updateTotalProgress();

            var $li = $('#' + file.id);
            // 当文件显示出来时，才做移除。
            if ($li) {
                $li.off().find('.file-panel').off().end().remove();
            }

        }

        function updateTotalProgress() {
            var loaded = 0,
                total = 0,
                spans = $progress.children(),
                percent;

            $.each(percentages, function(k, v) {
                total += v[0];
                loaded += v[0] * v[1];
            });

            percent = total ? loaded / total : 0;

            spans.eq(0).text(Math.round(percent * 100) + '%');
            spans.eq(1).css('width', Math.round(percent * 100) + '%');
            updateStatus();
        }
        function updateStatus() {
            var text = '',
                stats;

            if (state === 'ready') {
                text = '选中' + fileCount + '张图片，共' +
                    WebUploader.formatSize(fileSize) + '。';
            } else if (state === 'confirm') {
                stats = wuploader.getStats();
                if (stats.uploadFailNum) {
                    text = '已成功上传' + stats.successNum + '张照片至XX相册，' +
                        stats.uploadFailNum + '张照片上传失败，<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>'
                }

            } else {
                stats = wuploader.getStats();
                text = '共' + fileCount + '张（' +
                    WebUploader.formatSize(fileSize) +
                    '），已上传' + stats.successNum + '张';

                if (stats.uploadFailNum) {
                    text += '，失败' + stats.uploadFailNum + '张';
                }
            }

            $info.html(text);
        }
        function setState(val) {
            var file,
                stats;

            if (val === state) {
                return;
            }

            $upload && $upload.removeClass('state-' + state);
            $upload && $upload.addClass('state-' + val);
            state = val;

            switch (state) {
            case 'pedding':
                $placeHolder.removeClass('element-invisible');
                $queue.parent().removeClass('filled');
                $queue.hide();
                $statusBar.addClass('element-invisible');
                wuploader.refresh();
                break;

            case 'ready':
                $placeHolder.addClass('element-invisible');
                $(fileAddId).removeClass('element-invisible');
                // 修改上传按钮为可用。   by tanzx 2017-08-01
                $upload && $upload.removeClass('disabled');
                $queue.parent().addClass('filled');
                $queue.show();
                $statusBar.removeClass('element-invisible');
                wuploader.refresh();
                break;

            case 'uploading':
                $(fileAddId).addClass('element-invisible');
                $progress.show();
                $upload && $upload.text('暂停上传');
                break;

            case 'paused':
                $progress.show();
                $upload && $upload.text('继续上传');
                break;

            case 'confirm':
                $progress.hide();
                $upload && $upload.text('开始上传').addClass('disabled');

                stats = wuploader.getStats();
                if (stats.successNum && !stats.uploadFailNum) {
                    setState('finish');
                    return;
                }
                break;
            case 'finish':
                stats = wuploader.getStats();
                if (stats.successNum) {
                    //alert('上传成功');
                    layer.msg('上传成功', { icon: 1, offset: 't' });
                } else {
                    // 没有成功的图片，重设
                    state = 'done';
                    location.reload();
                }
                break;
            }

            updateStatus();
        }
        wuploader.onUploadProgress = function(file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress span');

            $percent.css('width', percentage * 100 + '%');
            percentages[file.id][1] = percentage;
            updateTotalProgress();
        };

        wuploader.onFileQueued = function(file) {
            fileCount++;
            fileSize += file.size;

            if (fileCount === 1) {
                $placeHolder.addClass('element-invisible');
                $statusBar.show();
            }

            addFile(file);
            // 不需要每次添加文件，都调用setState('ready')。by tanzx 2017-08-01
            setState('ready');
            updateTotalProgress();
        };
        wuploader.onFileDequeued = function(file) {
            fileCount--;
            fileSize -= file.size;

            if (!fileCount) {
                setState('pedding');
            }

            doRemoveFile(file);
            updateTotalProgress();

        };

        // 添加Reset监听。by tanzx 2017-08-01
        // TODO reset不知道有没有问题。是否选择用destroy？
        wuploader.onReset = function() {
            fileCount = 0;
            fileSize = 0;

            setState('pedding');

            // 移除页面上的图片。
            $.each(wuploader.getFiles(), function(index, value) {
                doRemoveFile(value);
            });
            updateTotalProgress();

        };

        wuploader.on('all', function(type) {
            var stats;
            switch (type) {
            case 'uploadFinished':
                setState('confirm');
                break;

            case 'startUpload':
                setState('uploading');
                break;

            case 'stopUpload':
                setState('paused');
                break;

            }
        });
        wuploader.onError = function(code) {
            //alert('Error: ' + code);
            var text = '';
            if (code == 'F_DUPLICATE') {
                text = '文件重复！';
            } else {
                text = 'Error: ' + code;
            }
            layer.msg(text, { icon: 2, offset: 't' });
        };

        $upload && $upload.on('click', function() {
            if ($(this).hasClass('disabled')) {
                return false;
            }

            if (state === 'ready') {
                wuploader.upload();
            } else if (state === 'paused') {
                wuploader.upload();
            } else if (state === 'uploading') {
                wuploader.stop();
            }
        });

        $info.on('click', '.retry', function() {
            wuploader.retry();
        });

        $info.on('click', '.ignore', function() {
            //alert('todo');
            //layer.msg('todo', { icon: 3, offset: 't' });
            //执行忽略动作，重置
            wuploader.reset();
        });
        $upload && $upload.addClass('state-' + state);
        updateTotalProgress();
        // WebUploader实例
        return wuploader;
    }
    window.CommonWebUploader = this;
})( window );