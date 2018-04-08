$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'sys/news/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', index: 'id', width: 50, key: true },
			{ label: '资讯标题', name: 'title', index: 'title', width: 80 }, 			
			{ label: '资讯类型', name: 'type', index: 'type', width: 80, formatter:typeFmatter  },
			{ label: '状态', name: 'status', index: 'status', width: 80, formatter:currencyFmatter  },
			{ label: '是否显示', name: 'showFlag', index: 'show_flag', width: 80, formatter:showFmatter  },
			{ label: '创建时间', name: 'createTime', index: 'create_time', width: 80 }			
        ],
		viewrecords: true,
        height: 385,
        rowNum: 10,
		rowList : [10,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader : {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames : {
            page:"page", 
            rows:"limit", 
            order: "order"
        },
        sortname: "create_time",
        sortorder: "desc",
        gridComplete:function(){
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
        }
    });
});
function currencyFmatter(cellvalue, options, rowObject) {

    if(rowObject.status === 1){
        return "正常";
    }
    if(rowObject.status === 2){
        return "已删除";
    }
}
function showFmatter(cellvalue, options, rowObject) {

    if(rowObject.showFlag == 1){
        return "是";
    }
    if(rowObject.showFlag == 0){
        return "否";
    }
}
function typeFmatter(cellvalue, options, rowObject) {
    if(rowObject.type == 1){
        return "广告";
    }
    if(rowObject.type == 2){
        return "新闻";
    }
}
var vm = new Vue({
	el:'#rrapp',
	data:{
        q:{
            title: null,
			status:""
        },
		showList: true,
		title: null,
		news: {},
        ue: ''
	},
    mounted() {
		//实例化编辑器
		//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
        this.ue = UE.getEditor('editor',{
            toolbars: [[
                'fullscreen', 'source', '|', 'undo', 'redo', '|',
                'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', '|', 'forecolor','insertorderedlist', 'insertunorderedlist','|',
                'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
                'insertimage', 'insertvideo'
            ]]
        });
    },
	methods: {
		query: function () {
            var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
            	_search: true,
                page:page,
                postData:{'title':vm.q.title,'status':vm.q.status}
            }).trigger("reloadGrid");
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
            vm.news = {};
            vm.ue.setContent('');
			//window.location.href = "../news/newsadd.html";
		},
		update: function (event) {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改";
            
            vm.getInfo(id);
		},
		saveOrUpdate: function (event) {
            var url = null;
            var flag = null;//1 代表增加 2 代表更新
            if(vm.news.id == null){
                url = "sys/news/save";
                flag = "1";
            }else{
                url = "sys/news/update";
                vm.news.content = null;
                flag = "2";
            }
            if(vm.checkForm()){
                $.ajax({
                    type: "POST",
                    url: baseURL + url,
                    contentType: "application/json",
                    data: JSON.stringify(vm.news),
                    success: function(r){
                        if(r.code === 0){
                            alert('操作成功', function(index){
                                var newsId;
                                if(flag == "1"){
                                    newsId = r.id;
                                }else{
                                    newsId = vm.news.id
                                }
                                $.ajax({
                                    type: "POST",
                                    url: baseURL + "sys/news/updateContent",
                                    data: {
                                        content: vm.ue.getContent(),
                                        id: newsId
                                    },
                                    success: function(r){
                                        vm.reload();
                                    }
                                });
                            });
                        }else{
                            alert(r.msg);
                        }
                    }
                });
            }
		},
		del: function (event) {
			var ids = getSelectedRows();
			if(ids == null){
				return ;
			}
			
			confirm('确定要删除选中的记录？', function(){
				$.ajax({
					type: "POST",
				    url: baseURL + "sys/news/delete",
                    contentType: "application/json",
				    data: JSON.stringify(ids),
				    success: function(r){
						if(r.code == 0){
							alert('操作成功', function(index){
								$("#jqGrid").trigger("reloadGrid");
							});
						}else{
							alert(r.msg);
						}
					}
				});
			});
		},
		getInfo: function(id){
			$.get(baseURL + "sys/news/info/"+id, function(r){
                vm.news = r.news;
                vm.ue.setContent(r.news.content);
            });
		},
		reload: function (event) {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
                page:page
            }).trigger("reloadGrid");
        },
        checkForm: function(){
            if(vm.news.title === "" || vm.news.title === undefined){
				layer.msg('资讯标题不能为空！', {icon: 0});
				return false;
            }
            if(vm.news.type === "" || vm.news.type === undefined){
				layer.msg('请选择资讯类型！', {icon: 0});
				return false;
            }
            if(vm.news.showFlag === "" || vm.news.showFlag === undefined){
				layer.msg('请选择是否显示！', {icon: 0});
				return false;
            }
            return true;
        }
	}
});
$(function () {
    var $list=$("#thelist"),
        ratio = window.devicePixelRatio || 1,
        thumbnailWidth = 100 * ratio,
        thumbnailHeight = 100 * ratio;

    var uploader = WebUploader.create({  
        // 选完文件后，是否自动上传。  
        auto: true,  
    
        // swf文件路径  
        swf: '../../plugins/webuploader/Uploader.swf',  
    
        // 文件接收服务端。  
        server: '/apm-web/a/test/',  
    
        // 选择文件的按钮。可选。  
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.  
        pick: '#filePicker',  
    
        // 只允许选择图片文件。  
        accept: {  
            title: 'Images',  
            extensions: 'gif,jpg,jpeg,bmp,png',  
            mimeTypes: 'image/*'  
        },  
        method:'POST',  
    });
    uploader.on( 'fileQueued', function( file ) {
        var $li = $(
                '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '<img>' +
                    '<div class="info">' + file.name + '</div>' +
                '</div>'
                ),
            $img = $li.find('img');
    
    
        // $list为容器jQuery实例
        $list.append( $li );
    
        // 创建缩略图
        // 如果为非图片文件，可以不用调用此方法。
        // thumbnailWidth x thumbnailHeight 为 100 x 100
        uploader.makeThumb( file, function( error, src ) {
            if ( error ) {
                $img.replaceWith('<span>不能预览</span>');
                return;
            }
    
            $img.attr( 'src', src );
        }, thumbnailWidth, thumbnailHeight );
    });
    // 文件上传过程中创建进度条实时显示。
    uploader.on( 'uploadProgress', function( file, percentage ) {
        var $li = $( '#'+file.id ),
            $percent = $li.find('.progress span');

        // 避免重复创建
        if ( !$percent.length ) {
            $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
        }

        $percent.css( 'width', percentage * 100 + '%' );
    });

    // 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on( 'uploadSuccess', function( file ) {
        $( '#'+file.id ).addClass('upload-state-done');
    });

    // 文件上传失败，显示上传出错。
    uploader.on( 'uploadError', function( file ) {
        var $li = $( '#'+file.id ),
            $error = $li.find('div.error');

        // 避免重复创建
        if ( !$error.length ) {
            $error = $('<div class="error"></div>').appendTo( $li );
        }

        $error.text('上传失败');
    });

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on( 'uploadComplete', function( file ) {
        $( '#'+file.id ).find('.progress').remove();
    });
});