$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'project/project/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', index: 'id', width: 50, key: true },
			{ label: '项目名称', name: 'projectName', index: 'project_name', width: 80 }, 			
			{ label: '影片id', name: 'movieId', index: 'movie_id', width: 80 }, 			
			{ label: '项目成本', name: 'projectCost', index: 'project_cost', width: 80 }, 			
			{ label: '项目发起人', name: 'projectHeader', index: 'project_header', width: 80 }, 			
			{ label: '筹资金额', name: 'financingMoney', index: 'financing_money', width: 80 }, 			
			{ label: '投资开始时间', name: 'startTime', index: 'start_time', width: 80 }, 			
			{ label: '投资结束时间', name: 'endTime', index: 'end_time', width: 80 }, 			
			{ label: '项目标签 如 永久版权 永久福利等', name: 'projectLabel', index: 'project_label', width: 80 }, 			
			{ label: '项目服务费', name: 'projectCoverCharge', index: 'project_cover_charge', width: 80 }, 			
			{ label: '创建时间', name: 'createTime', index: 'create_time', width: 80 }, 			
			{ label: '项目类型 1 网络电影 2 院线电影', name: 'projectType', index: 'project_type', width: 80 }, 			
			{ label: '项目状态 1 即将上线 2 正在募集 3 募集完成', name: 'projectStatus', index: 'project_status', width: 80 }, 			
			{ label: '更新时间', name: 'updateTime', index: 'update_time', width: 80 }, 			
			{ label: '状态 1、可用 2、已删除', name: 'status', index: 'status', width: 80 }, 			
			{ label: '审核状态 1、新建 2、已提交未审核 3 驳回 4 审核通过', name: 'examineStatus', index: 'examine_status', width: 80 }, 			
			{ label: '是否发布 1 发布 0 未发布', name: 'publishStatus', index: 'publish_status', width: 80 }, 			
			{ label: '项目介绍', name: 'projectDes', index: 'project_des', width: 80 }, 			
			{ label: '审核意见', name: 'remark', index: 'remark', width: 80 }			
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