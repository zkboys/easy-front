(this["webpackJsonpreact-adminv4"]=this["webpackJsonpreact-adminv4"]||[]).push([[9],{208:function(e,t,n){},231:function(e,t,n){e.exports={root:"root-fIjVT","role-menu-tip":"role-menu-tip-2A5Pr"}},246:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return x}));n(114);var a,r=n(84),l=(n(115),n(85)),i=(n(65),n(33)),o=(n(21),n(24)),c=n(5),s=n(1),u=n(2),d=n(3),f=n(4),p=n(0),m=n.n(p),h=n(77),v=n(18),b=n(8),y=n(9),g=n(12),S=n(22);n(208);var j,E,O=Object(v.a)({ajax:!0})(a=function(e){Object(f.a)(n,e);var t=Object(d.a)(n);function n(){var e;Object(s.a)(this,n);for(var a=arguments.length,r=new Array(a),l=0;l<a;l++)r[l]=arguments[l];return(e=t.call.apply(t,[this].concat(r))).state={loading:!1,menus:[],allMenuKeys:[],expandedRowKeys:[]},e.columns=[{title:"\u540d\u79f0",dataIndex:"text",key:"text",render:function(e,t){var n=t.icon;return n?m.a.createElement("span",null,m.a.createElement(g.e,{type:n})," ",e):e}},{title:"\u7c7b\u578b",dataIndex:"type",key:"type",render:function(e,t){return t.url?"\u7ad9\u5916\u83dc\u5355":"1"===e?"\u7ad9\u5185\u83dc\u5355":"2"===e?"\u529f\u80fd":"\u83dc\u5355"}}],e.handleSelect=function(t,n,a,r){var l,i,o=e.props.value,c=void 0===o?[]:o,s=e.state.menus,u=t.key,d=Object(y.a)(c),f=Object(S.b)(s,u),p=t.parentKeys,m=void 0===p?[]:p;n?d=(i=d=(l=d).concat.apply(l,[u].concat(Object(y.a)(f)))).concat.apply(i,Object(y.a)(m)):(d=d.filter((function(e){return![u].concat(Object(y.a)(f)).includes(e)})),m.reverse().forEach((function(e){Object(S.b)(s,e).some((function(e){return d.includes(e)}))?d.push(e):d=d.filter((function(t){return t!==e}))})));var h=e.props.onChange;h&&h(Array.from(new Set(d)))},e.handleSelectAll=function(t){var n=e.state.allMenuKeys,a=e.props.onChange;a&&a(t?n:[])},e.indeterminate=function(t){var n=e.props.value,a=e.state.menus,r=t.key,l=Object(S.b)(a,r);return n.includes(r)&&n.some((function(e){return l.includes(e)}))&&!l.every((function(e){return n.includes(e)}))},e}return Object(u.a)(n,[{key:"componentDidMount",value:function(){this.handleSearch()}},{key:"handleSearch",value:function(){var e=this;this.setState({loading:!0}),this.props.ajax.get("/menus").then((function(t){var n=t.map((function(e){return Object(c.a)({key:e.id,parentKey:e.parentId},e)})),a=n.map((function(e){return e.key})),r=Object(y.a)(n).sort((function(e,t){var n=e.order||0,a=t.order||0;return n||a?a-n:e.text>t.text?1:-1})),l=Object(S.a)(r),i=n.map((function(e){return e.key}));e.setState({menus:l,allMenuKeys:a,expandedRowKeys:i})})).finally((function(){return e.setState({loading:!1})}))}},{key:"render",value:function(){var e=this,t=this.state,n=t.menus,a=t.loading,r=t.expandedRowKeys,l=this.props,i=l.value,o=(l.onChange,Object(b.a)(l,["value","onChange"]));return m.a.createElement(g.k,Object.assign({expandable:{expandedRowKeys:r,onExpandedRowsChange:function(t){return e.setState({expandedRowKeys:t})}},rowSelection:{selectedRowKeys:i,onSelect:this.handleSelect,onSelectAll:this.handleSelectAll,getCheckboxProps:function(t){return{indeterminate:e.indeterminate(t)}}},loading:a,columns:this.columns,dataSource:n,pagination:!1},o))}}]),n}(p.Component))||a,k=Object(v.a)({ajax:!0,modal:{title:function(e){return e.isEdit?"\u4fee\u6539":"\u6dfb\u52a0"}}})(j=function(e){Object(f.a)(n,e);var t=Object(d.a)(n);function n(){var e;Object(s.a)(this,n);for(var a=arguments.length,r=new Array(a),l=0;l<a;l++)r[l]=arguments[l];return(e=t.call.apply(t,[this].concat(r))).state={loading:!1,data:{}},e.fetchData=function(){if(!e.state.loading){var t=e.props.id;e.setState({loading:!0}),e.props.ajax.get("/roles/".concat(t)).then((function(t){e.setState({data:t||{}}),e.form.setFieldsValue(t)})).finally((function(){return e.setState({loading:!1})}))}},e.handleSubmit=function(t){if(!e.state.loading){var n=e.props.isEdit,a=n?"\u4fee\u6539\u6210\u529f\uff01":"\u6dfb\u52a0\u6210\u529f\uff01",r=n?e.props.ajax.put:e.props.ajax.post,l=n?"/roles/".concat(t.id):"/roles";e.setState({loading:!0}),r(l,t,{successTip:a}).then((function(){var t=e.props.onOk;t&&t()})).finally((function(){return e.setState({loading:!1})}))}},e}return Object(u.a)(n,[{key:"componentDidMount",value:function(){this.props.isEdit&&this.fetchData()}},{key:"render",value:function(){var e=this,t=this.props.isEdit,n=this.state,a=n.loading,r=n.data,l={labelWidth:100};return m.a.createElement(g.g,{loading:a,okText:"\u4fdd\u5b58",cancelText:"\u91cd\u7f6e",onOk:function(){return e.form.submit()},onCancel:function(){return e.form.resetFields()}},m.a.createElement(i.default,{ref:function(t){return e.form=t},onFinish:this.handleSubmit,initialValues:r},t?m.a.createElement(g.c,Object.assign({},l,{type:"hidden",name:"id"})):null,m.a.createElement(g.c,Object.assign({},l,{label:"\u89d2\u8272\u540d\u79f0",name:"name",required:!0,autoFocus:!0})),m.a.createElement(g.c,Object.assign({},l,{label:"\u63cf\u8ff0",name:"description"}))))}}]),n}(p.Component))||j;n(231);var x=Object(v.a)({path:"/roles",ajax:!0})(E=function(e){Object(f.a)(n,e);var t=Object(d.a)(n);function n(){var e;Object(s.a)(this,n);for(var a=arguments.length,r=new Array(a),l=0;l<a;l++)r[l]=arguments[l];return(e=t.call.apply(t,[this].concat(r))).state={loading:!1,dataSource:[],deleting:!1,visible:!1,id:null,loadingRoleMenu:!1,selectedKeys:[],selectedRoleId:void 0},e.columns=[{title:"\u89d2\u8272\u540d\u79f0",dataIndex:"name",width:150},{title:"\u63cf\u8ff0",dataIndex:"description"},{title:"\u64cd\u4f5c",dataIndex:"operator",width:100,render:function(t,n){var a=n.id,r=n.name,l=[{label:"\u4fee\u6539",onClick:function(t){t.stopPropagation(),e.setState({visible:!0,id:a})}},{label:"\u5220\u9664",color:"red",confirm:{title:'\u60a8\u786e\u5b9a\u5220\u9664"'.concat(r,'"?'),onConfirm:function(t){t.stopPropagation(),e.handleDelete(a)}}}];return m.a.createElement(g.h,{items:l})}}],e.handleSearch=function(t){if(!e.state.loading){var n=Object(c.a)({},t);e.setState({loading:!0}),e.props.ajax.get("/roles",n).then((function(t){var n=t||[];e.setState({dataSource:n}),n[0]&&e.handleRowClick(n[0])})).finally((function(){return e.setState({loading:!1})}))}},e.handleDelete=function(t){e.state.deleting||(e.setState({deleting:!0}),e.props.ajax.del("/roles/".concat(t),null,{successTip:"\u5220\u9664\u6210\u529f\uff01",errorTip:"\u5220\u9664\u5931\u8d25\uff01"}).then((function(){return e.form.submit()})).finally((function(){return e.setState({deleting:!1})})))},e.handleRowClick=function(t){var n=t.id;e.setState({selectedRoleId:n,selectedKeys:[]}),e.setState({loadingRoleMenu:!0}),e.props.ajax.get("/roles/".concat(n)).then((function(t){var n=((null===t||void 0===t?void 0:t.menus)||[]).map((function(e){return e.id}));e.setState({selectedKeys:n})})).finally((function(){return e.setState({loadingRoleMenu:!1})}))},e.handleSaveRoleMenu=function(){var t=e.state,n=t.selectedKeys,a={roleId:t.selectedRoleId,menuIds:n};e.setState({loading:!0}),e.props.ajax.put("/relateRoleMenus",a,{successTip:"\u4fdd\u5b58\u89d2\u8272\u6743\u9650\u6210\u529f\uff01"}).then((function(e){})).finally((function(){return e.setState({loading:!1})}))},e}return Object(u.a)(n,[{key:"componentDidMount",value:function(){this.handleSearch()}},{key:"render",value:function(){var e,t=this,n=this.state,a=n.loading,c=n.dataSource,s=n.visible,u=n.id,d=n.selectedRoleId,f=n.selectedKeys,p=n.loadingRoleMenu,v={form:this.props.form,width:220,style:{paddingLeft:16}},b=null===(e=c.find((function(e){return e.id===d})))||void 0===e?void 0:e.name;return m.a.createElement(h.a,{className:"root-fIjVT",loading:a||p},m.a.createElement(g.j,null,m.a.createElement(i.default,{onFinish:this.handleSearch,ref:function(e){return t.form=e}},m.a.createElement(g.d,null,m.a.createElement(g.c,Object.assign({},v,{label:"\u89d2\u8272\u540d",name:"name"})),m.a.createElement(g.c,{layout:!0},m.a.createElement(o.default,{type:"primary",htmlType:"submit"},"\u67e5\u8be2"),m.a.createElement(o.default,{onClick:function(){return t.form.resetFields()}},"\u91cd\u7f6e"),m.a.createElement(o.default,{type:"primary",onClick:function(){return t.setState({visible:!0,id:null})}},"\u6dfb\u52a0")),m.a.createElement("div",{className:"role-menu-tip-2A5Pr"},b?m.a.createElement("span",null,"\u5f53\u524d\u89d2\u8272\u6743\u9650\uff1a\u300c",b,"\u300d"):m.a.createElement("span",null,"\u8bf7\u5728\u5de6\u4fa7\u5217\u8868\u4e2d\u9009\u62e9\u4e00\u4e2a\u89d2\u8272\uff01"),m.a.createElement(o.default,{disabled:!b,type:"primary",onClick:this.handleSaveRoleMenu},"\u4fdd\u5b58\u6743\u9650"))))),m.a.createElement(r.default,null,m.a.createElement(l.default,{span:14},m.a.createElement(g.k,{rowClassName:function(e){return e.id===d?"role-table selected":"role-table"},serialNumber:!0,columns:this.columns,dataSource:c,rowKey:"id",onRow:function(e,n){return{onClick:function(){return t.handleRowClick(e,n)}}}})),m.a.createElement(l.default,{span:10},m.a.createElement(O,{value:f,onChange:function(e){return t.setState({selectedKeys:e})}}))),m.a.createElement(k,{visible:s,id:u,isEdit:null!==u,onOk:function(){return t.setState({visible:!1},t.form.submit)},onCancel:function(){return t.setState({visible:!1})}}))}}]),n}(p.Component))||E}}]);
//# sourceMappingURL=9.a66c01de.chunk.js.map