import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory, Link } from 'ice';
import { Table, Divider, Form, Loading, Button, TreeSelect, DatePicker, Select,Pagination,Message, Input } from '@alifd/next';
import styles from './index.module.scss';
import moment from 'moment';
import PageHeader from '@/components/PageHeader';
import {  convertDictByType, getWareName } from '@/utils/index';
import API from './api';

const FormItem = Form.Item;

export default injectIntl(({ intl }) => {
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const history = useHistory();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchNo, setBatchNo] = useState(''); // 批次号
  const [containerId, setContainerId] = useState(''); // 装柜订单号
  const [destWarehouse, setDestWarehouse] = useState(''); // 目的仓
  const [loadingMethod, setloadingMethod] = useState(''); // 装柜方式

  const [pageIndex, setpageIndex] = useState(1); // 当前页
  const [pageSize, setPageSize] = useState(20); // 每页条数
  const [total, setTotal] = useState(0); // 总条数

  const [loadingModeList, setLoadingModeList] = useState<any[]>([])
  


  // 获取装柜方式
  const getLoadingModeList = () => {
    const source = convertDictByType('LOADING_MODE');
    let temp: any = []
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].name
      }
      temp.push(obj);
    }
    setLoadingModeList(temp);
  }
  // 获取状态
  const pageChange = (v) => {
    getList(v);
  }


  
    // 批次号
    const changeBatchNo = (v) => {
      setBatchNo(v);
    }
      // 订单号
   const changeContainerId = (v) => {
    setContainerId(v);
  }
  
   // 切换目的仓
   const changeDestWh = (v) => {
    setDestWarehouse(v);
  }
  
   // 切换装柜方式
   const changeLoadingMethod = (v) => {
    setloadingMethod(v);
  }

  
   // 点击查询
   const query = () => {
    getList(1);
  }

   // 清空
   const clear = () => {
     setBatchNo('');
     setContainerId('')
     setDestWarehouse('')
     setloadingMethod('')
    getList(1)
  }

  // 获取链接上参数
  const getUrlParams = (param) => {
    var ps = decodeURI(location.href);
    if (ps == '') return '';
    var params = (ps.substr(ps.lastIndexOf("?") + 1)).split("&");
    if (params != null) {
        for (var i = 0; i < params.length; i++) {
            var strs = params[i].split("=");
            if (strs[0] == param && strs[1]) {
                return strs[1];
            }
        }
    }
    return "";
  }

    /**
   * 表单查询各种兼容处理
   */
     const getList = (currentPage) => {
      setpageIndex(currentPage)
     var params = {
      "batchNo": batchNo,
      "containerId": containerId,
      "loadingMethod": loadingMethod,
      "destinationWarehouse": destWarehouse,
      "pageNum": currentPage || 1,
      "pageSize": pageSize,
      "tid": getUrlParams('tid')
     }
     API.getPlanContainerList(params).then(res => {
       setLoading(false);
      console.log(res)
       if (res.success && res.data) {
         var data = res.data;
         console.log(data)
         if (!data.data.length) {
           setTotal(0);
           setTableData([]);
           return
         }
         // res.data.map(val => {
         //   let day = val.advanceDayFpx || val.advanceDayCustomer;
         //   let d = day > 0 ? day : '';
         //   val.createTime = renderTime(val.createTime);
         //   val.carrier = val.carrierType ? `${convertDictByCode('CARRIER_TYPE', val.carrierType)}: ${d} ${lang['fb4.day']}` : '';
         // })
         setTotal(data.total)
         setTableData(data.data || []);
       } else {
         Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
       }
     })
   }

  
  useEffect(() => {
    getLoadingModeList();
    setLoading(true);
    getList(1);
  }, []);
  

  const Search = (
    <div className="Search">
      <Form responsive labelAlign="left">
        <FormItem colSpan={4} label=''>
          <FormItem  label='批次号'>
            <Input onChange={changeBatchNo}/>
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label='装柜订单号'>
            <Input onChange={changeContainerId}/>
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label={lang['fb4.destination.warehouse']}>
            <TreeSelect
              hasClear
              showSearch
              placeholder={lang['fb4.warehouse.choose']}
              treeDefaultExpandAll
              dataSource={whAll}
              defaultValue={destWarehouse}
              onChange={changeDestWh}
              style={{ width: '100%' }} />
          </FormItem>
        </FormItem>
      
        <FormItem colSpan={4} label=''>
          <FormItem  label='装柜方式'>
            <Select dataSource={loadingModeList} onChange={changeLoadingMethod}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                 value={loadingMethod} />
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
         
        </FormItem>
        <FormItem colSpan={4} label=" " >
           <FormItem  label="&nbsp;" style={{textAlign:'right'}}>
            <Form.Submit
              type="primary"
              onClick={query}
              >
              {lang['fb4.search']}
            </Form.Submit>
            <Form.Submit
              type="normal"
              onClick={clear}
              style={{marginLeft:10}}
              >
              {lang['fb4.clear']}
            </Form.Submit>
            </FormItem>
        </FormItem>
      </Form>
    </div>
  );

  const List = (
    <div className="List">
      <Loading visible={loading} style={{ display: 'block' }}>
        {Object.keys(tableData).length > 0 && (
          <>
            <Table
              hasBorder={false}
              className={styles.Table}
              dataSource={tableData}
            >
              <Table.Column title='批次' dataIndex="batchNo"/>
              <Table.Column title='拼柜订单号' dataIndex="containerId"/>
              <Table.Column title='起始站' dataIndex="departureWarehouse"/>
              <Table.Column title='目的仓库' dataIndex="destinationWarehouse"/>
              <Table.Column title='装柜日期' dataIndex="latestDate"/>
              <Table.Column title='装柜时间' dataIndex="loadingTime"/>
              <Table.Column title='柜型' dataIndex="containerType"/>
              <Table.Column title='装柜方式' dataIndex="loadingMethod"/>
              <Table.Column
                lock='right'
                width={200}
                title='操作'
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    <Link to={{ pathname: '/logistics/planCabinetEditPage', state: record }}>{lang['fb4.modify']}</Link>
                  </div>
                )}
              />
            </Table>
            <Pagination onChange={pageChange} total={total} current={pageIndex} pageSize={pageSize} style={{marginTop:'10px'}} />
          </>
        )}
        {Object.keys(tableData).length == 0 && (
          <div className="dataEmpty">{lang['fb4.common.date.empty']}</div>
        )}
      </Loading>
    </div >
  )

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['fb4.appointment.set.manage'] }]}
      />
      {Search}
      {List}
    </>
  );
});
