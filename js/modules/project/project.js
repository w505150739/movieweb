$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'project/project/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', index: 'id', width: 50, key: true },
			{ label: '项目名称', name: 'projectName', index: 'project_name', width: 80 },	
			{ label: '项目成本', name: 'projectCost', index: 'project_cost', width: 80 }, 			
			{ label: '项目发起人', name: 'projectHeader', index: 'project_header', width: 80 }, 			
			{ label: '筹资金额', name: 'financingMoney', index: 'financing_money', width: 60 },	
			{ label: '筹资开始', name: 'startTime', index: 'start_time', width: 90 },	
			{ label: '筹资结束', name: 'endTime', index: 'end_time', width: 90 },	
			{ label: '创建时间', name: 'createTime', index: 'create_time', width: 90 }, 			
			{ label: '项目类型', name: 'projectType', index: 'project_type', width: 60,  formatter: function(value, options, row){
				if(value === 1){
					return '<span class="label label-success">网络电影</span>';
				}
				if(value === 2){
					return '<span class="label label-danger">院线电影</span>';
				}
			}}, 			
			{ label: '项目状态', name: 'projectStatus', index: 'project_status', width: 60, formatter: function(value, options, row){
				if(value === 1){
					return '<span class="label label-success">即将上线</span>';
				}
				if(value === 2){
					return '<span class="label label-danger">正在募集</span>';
				}
				if(value === 3){
					return '<span class="label label-danger">募集完成</span>';
				}
			}},
			{ label: '审核状态', name: 'examineStatus', index: 'examine_status', width: 60, formatter: function(value, options, row){
				if(value === 1){
					return '<span class="label label-success">新建</span>';
				}
				if(value === 2){
					return '<span class="label label-danger">已提交未审核</span>';
				}
				if(value === 3){
					return '<span class="label label-danger">驳回</span>';
				}
				if(value === 4){
					return '<span class="label label-danger"> 审核通过</span>';
				}
			}}, 			
			{ label: '是否发布', name: 'publishStatus', index: 'publish_status', width: 60, formatter: function(value, options, row){
				if(value === 1){
					return '<span class="label label-success">发布</span>';
				}
				if(value === 0){
					return '<span class="label label-danger">未发布</span>';
				}
			}}		
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
var vm = new Vue({
	el:'#rrapp',
	data:{
		showList: true,
		title: null,
		project: {}
	},
	mounted() {
		laydate.render({
			elem: '#start_time',
			type: 'datetime'
		});
		laydate.render({
			elem: '#end_time'
			,type: 'datetime'
		});
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
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.project = {};
		},
		update: function (event) {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改";
            
            vm.getInfo(id)
		},
		saveOrUpdate: function (event) {
			var url = vm.project.id == null ? "project/project/save" : "project/project/update";
			vm.project.startTime = $("#start_time").val();
			vm.project.endTime = $("#end_time").val();
			$.ajax({
				type: "POST",
			    url: baseURL + url,
                contentType: "application/json",
			    data: JSON.stringify(vm.project),
			    success: function(r){
			    	if(r.code === 0){
						alert('操作成功', function(index){
							vm.reload();
						});
					}else{
						alert(r.msg);
					}
				}
			});
		},
		del: function (event) {
			var ids = getSelectedRows();
			if(ids == null){
				return ;
			}
			
			confirm('确定要删除选中的记录？', function(){
				$.ajax({
					type: "POST",
				    url: baseURL + "project/project/delete",
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
			$.get(baseURL + "project/project/info/"+id, function(r){
                vm.project = r.project;
            });
		},
		reload: function (event) {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
                page:page
            }).trigger("reloadGrid");
		}
	}
});