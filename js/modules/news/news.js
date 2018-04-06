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