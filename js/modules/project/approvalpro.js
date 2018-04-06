$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'project/approvallist',
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
					return '<span class="label label-primary">网络电影</span>';
				}
				if(value === 2){
					return '<span class="label label-success">院线电影</span>';
				}
			}},		
			{ label: '项目状态', name: 'projectStatus', index: 'project_status', width: 60, formatter: function(value, options, row){
				if(value === 1){
					return '<span class="label label-primary">即将上线</span>';
				}
				if(value === 2){
					return '<span class="label label-info">正在募集</span>';
				}
				if(value === 3){
					return '<span class="label label-success">募集完成</span>';
				}
			}},
			{ label: '审核状态', name: 'examineStatus', index: 'examine_status', width: 60, formatter: function(value, options, row){
				if(value === 1){
					//return '<button type="button" class="btn btn-primary">（首选项）Primary</button>'
					return '<span class="label label-primary">新建</span>';
				}
				if(value === 2){
					return '<span class="label label-info">已提交未审核</span>';
				}
				if(value === 3){
					return '<span class="label label-danger">驳回</span>';
				}
				if(value === 4){
					return '<span class="label label-success"> 审核通过</span>';
				}
			}}, 			
			{ label: '是否发布', name: 'publishStatus', index: 'publish_status', width: 60, formatter: function(value, options, row){
				if(value === 1){
					return '<span class="label label-success">发布</span>';
				}
				if(value === 0){
					return '<span class="label label-info">未发布</span>';
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
		q:{
			projectName: null,
			publishStatus: ""
        },
		showList: true,
		title: null,
		project: {}
	},
	methods: {
		query: function () {
			var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
            	_search: true,
                page:page,
                postData:{'projectName':vm.q.projectName,'publishStatus':vm.q.publishStatus}
            }).trigger("reloadGrid");
		},
		getInfo: function(id){
			$.get(baseURL + "project/info/"+id, function(r){
				vm.project = r.project;
            });
		},
		reload: function (event) {
			vm.showList = true;
			vm.examineFlag = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
                page:page
            }).trigger("reloadGrid");
		},
		examine: function(){
			var id = getSelectedRow();
			if(id == null){
				return false;
			}
            $.ajax({
				type: "POST",
				url: baseURL + "project/checkExamine",
				contentType: "application/json",
				data: JSON.stringify(id),
				success: function(r){
					if(r.code == 0){
						vm.getInfo(id);
						vm.showList = false;
						vm.title = "审核";
					}else{
						layer.msg(r.msg, {icon: 0});
						return false;
					}
				}
			});
		},
		addExamine: function(){
			var examineFrom = {};
			examineFrom.id = vm.project.id;
			examineFrom.examineStatus = vm.project.examineStatus;
			examineFrom.remark = vm.project.remark;
			if(examineFrom.examineStatus === "" || examineFrom.examineStatus === undefined){
				layer.msg('请选择审核结果！', {icon: 0});
				return false;
			}
			$.ajax({
				type: "POST",
				url: baseURL + "project/examine",
				contentType: "application/json",
				data: JSON.stringify(examineFrom),
				success: function(r){
					if(r.code == 0){
						alert('操作成功', function(index){
							vm.reload();
						});
					}else{
						alert(r.msg);
					}
				}
			});
		},
		checkForm: function(){
			if(vm.project.examineStatus === "" || vm.project.examineStatus === undefined){
				layer.msg('请选择发布状态！', {icon: 0});
				return false;
			}
			return true;
		}
	}
});