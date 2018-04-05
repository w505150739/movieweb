$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'project/list',
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
		examineFlag: true,
		title: null,
		project: {},
		ue: null
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
			var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
            	_search: true,
                page:page,
                postData:{'projectName':vm.q.projectName,'publishStatus':vm.q.publishStatus}
            }).trigger("reloadGrid");
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.project = {};
			vm.ue.setContent('');
		},
		update: function (event) {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			if(vm.checkUpdate(id)){
				vm.showList = false;
				vm.title = "修改";
				
				vm.getInfo(id)
			}
		},
		saveOrUpdate: function (event) {
			//var url = vm.project.id == null ? "project/project/save" : "project/project/update";
			var url;
            var flag;//1 代表增加 2 代表更新
            if(vm.project.id == null){
                url = "project/save";
                flag = "1";
            }else{
                url = "project/update";
                vm.project.projectDes = null;
                flag = "2";
			}
			vm.project.startTime = $("#start_time").val();
			vm.project.endTime = $("#end_time").val();
			if(vm.checkForm()){
				$.ajax({
					type: "POST",
					url: baseURL + url,
					contentType: "application/json",
					data: JSON.stringify(vm.project),
					success: function(r){
						if(r.code === 0){
							alert('操作成功', function(index){
								var projectId;
								if(flag === "1"){
									projectId = r.id;
								}else{
									projectId = vm.project.id
								}
								$.ajax({
									type: "POST",
									url: baseURL + "project/updateContent",
									data: {
										content: vm.ue.getContent(),
										id: projectId
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
		checkUpdate: function(id){
			$.ajax({
				type: "POST",
				url: baseURL + "project/checkUpdate",
				contentType: "application/json",
				data: JSON.stringify(id),
				success: function(r){
					if(r.code == 0){
						return true;
					}else{
						layer.msg(r.msg, {icon: 0});
						return false;
					}
				}
			});
		},
		del: function (event) {
			var ids = getSelectedRow();
			if(ids == null){
				return ;
			}
			if(vm.checkUpdate(ids)){
				confirm('确定要删除选中的记录？', function(){
					$.ajax({
						type: "POST",
						url: baseURL + "project/delete",
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
			}
		},
		getInfo: function(id){
			$.get(baseURL + "project/info/"+id, function(r){
				vm.project = r.project;
				vm.ue.setContent(r.project.projectDes);
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
		approval: function(event){
			var id = getSelectedRow();
			if(id == null){
				return false;
			}
			var approvalFrom = {};
			approvalFrom.id = id;
			approvalFrom.examineStatus = 2;
			layer.confirm('确定要提审选中的记录？', {
				btn: ['确定','取消'] //按钮
			}, function(){
				$.ajax({
					type: "POST",
				    url: baseURL + "project/approval",
                    contentType: "application/json",
				    data: JSON.stringify(approvalFrom),
				    success: function(r){
						if(r.code == 0){
							layer.msg('操作成功', {icon: 1});
							vm.reload();
						}else{
							layer.msg(r.msg, {icon: 0});
						}
					}
				});
			});
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
						vm.examineFlag = false;
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
		publish: function(){
			var id = getSelectedRow();
			if(id == null){
				return false;
			}
			layer.confirm('确定要发布/下架选中的记录？', {
				btn: ['确定','取消'] //按钮
			}, function(){
				$.ajax({
					type: "POST",
				    url: baseURL + "project/publish",
                    contentType: "application/json",
				    data: JSON.stringify(id),
				    success: function(r){
						if(r.code == 0){
							layer.msg('操作成功', {icon: 1});
							vm.reload();
						}else{
							layer.msg(r.msg, {icon: 0});
						}
					}
				});
			});
		},
		checkForm: function(){
			var reg=/^\d*(?:\.\d{0,2})?$/;//金额
			if(vm.project.projectName === "" || vm.project.projectName === undefined){
				layer.msg('项目名称不能为空！', {icon: 0});
				return false;
			}
			var cost = vm.project.projectCost;
			if(!reg.test(cost)){
				layer.msg('项目成本输入格式错误，最多有两位小数！', {icon: 0});
				return false;
			}
			if(vm.project.projectHeader === "" || vm.project.projectHeader === undefined){
				layer.msg('项目发起人不能为空！', {icon: 0});
				return false;
			}
			var financingMoney = vm.project.financingMoney;
			if(!reg.test(financingMoney)){
				layer.msg('筹资金额输入格式错误，最多有两位小数！', {icon: 0}); 
				return false;
			}
			var startTime = vm.project.startTime;
			var endTime = vm.project.endTime;
			if(startTime === "" || startTime === undefined){
				layer.msg('投资开始时间不能为空！', {icon: 0}); 
				return false;
			}
			if(endTime === "" || endTime === undefined){
				layer.msg('投资结束时间不能为空！', {icon: 0}); 
				return false;
			}
			if(startTime > endTime){
				layer.msg('投资结束时间不能早于开始时间！', {icon: 0}); 
				return false;
			}
			var projectCoverCharge = vm.project.projectCoverCharge;
			if(!reg.test(projectCoverCharge)){
				layer.msg('项目服务费输入格式错误，最多有两位小数！', {icon: 0}); 
				return false;
			}
			if(vm.project.projectType === "" || vm.project.projectType === undefined){
				layer.msg('请选择项目类型！', {icon: 0});
				return false;
			}
			if(vm.project.projectStatus === "" || vm.project.projectStatus === undefined){
				layer.msg('请选择项目状态！', {icon: 0});
				return false;
			}
			if(vm.project.publishStatus === "" || vm.project.publishStatus === undefined){
				layer.msg('请选择发布状态！', {icon: 0});
				return false;
			}
			return true;
		}
	}
});