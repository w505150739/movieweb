$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'sys/member/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', index: 'id', width: 50, key: true },
			{ label: '用户名', name: 'userName', index: 'user_name', width: 80 },
			{ label: '邮箱', name: 'email', index: 'email', width: 80 },
			{ label: '手机号', name: 'phone', index: 'phone', width: 80 },
			{ label: '注册时间', name: 'createTime', index: 'create_time', width: 80 },
			{ label: '姓名', name: 'name', index: 'name', width: 80 },
			{ label: '性别', name: 'sex', index: 'sex', width: 80, formatter:currencyFmatter },
			{ label: '年龄', name: 'age', index: 'age', width: 80 }, 			
			{ label: '通讯地址', name: 'address', index: 'address', width: 80 }
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

	if(rowObject.sex === 1){
        return "男";
    }
    if(rowObject.sex === 0){
        return "女";
    }
    if(rowObject.sex == null){
        return "保密";
    }
}
var vm = new Vue({
	el:'#rrapp',
	data:{
		q:{
			userName:'',
			phone:''
		},
		showList: true,
		title: null,
		member: {}
	},
	methods: {
		query: function () {
			var page = $("#jqGrid").jqGrid('getGridParam','page');
            $("#jqGrid").jqGrid('setGridParam',{
            	_search: true,
                page:page,
                postData:{'userName':vm.q.userName,'phone':vm.q.phone}
            }).trigger("reloadGrid");
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.member = {};
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
			var url = vm.member.id == null ? "sys/member/save" : "sys/member/update";
			$.ajax({
				type: "POST",
			    url: baseURL + url,
                contentType: "application/json",
			    data: JSON.stringify(vm.member),
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
				    url: baseURL + "sys/member/delete",
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
			$.get(baseURL + "sys/member/info/"+id, function(r){
                vm.member = r.member;
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