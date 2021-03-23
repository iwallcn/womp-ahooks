import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory, Link } from 'ice';
import { Table, Grid,Field, Form, Loading, Button, TreeSelect, DatePicker, Select,Pagination,Message,Dialog,Upload } from '@alifd/next';
import styles from './index.module.scss';
import moment from 'moment';
import ExportJsonExcel from 'js-export-excel'
import PageHeader from '@/components/PageHeader';
import {  convertDictByType, getWareName } from '@/utils/index';
import API from './api';

const FormItem = Form.Item;
const { Row, Col } = Grid;

export default injectIntl(({ intl }) => {
  const searchField = Field.useField({ values: {} });
  const { init, setError } = searchField
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  console.log(whAll,'whAll')
  const history = useHistory();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setpageIndex] = useState(1); // 当前页
  const [pageSize, setPageSize] = useState(20); // 每页条数
  const [total, setTotal] = useState(0); // 总条数

  const [pickUpList, setPickUpList] = useState<any[]>([])
  const [statusList, setStatusList] = useState<any[]>([])
  


  // 获取提货方式
  const getPickUpList = () => {
    const source = convertDictByType('PICK_UP_TYPE');
    let temp: any = [{label:'全部',value:''}]
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].name
      }
      temp.push(obj);
    }
    setPickUpList(temp);
  }
  // 获取状态
  const pageChange = (v) => {
    getList(v);
  }

   // 获取状态
   const getStatusList = () => {
     var statusArr = [{'label':'全部','value':""},{'label':'启用','value':"0"},{'label':'禁用','value':"1"}];
    setStatusList(statusArr);
  }


   // 禁用 启用
   const optRecord = (record) => {
    var oldStatus = record.status;
    Dialog.confirm({
      title: '提示',
      content: oldStatus=='0'?'确定要禁用吗?':'确定要启用吗',
      onOk: () => {
        API.updateStatus(oldStatus,record.tid).then(res => {
          if (res.success) {
            Message.success('操作成功')
            getList(1);
          } else {
            Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
          }
        })
      },
      onCancel: () => console.log('cancel')
    });
  }
   // 点击查询
   const query = () => {
    getList(1);
  }

    // 点击下载模板
    const downloadTemp = () => {
      let dataTable =  [];
      var option={
        fileName:'物流计划上传模板',
        datas:[
          {
          sheetData:dataTable,
          sheetName:'sheet',
          sheetHeader:['批次#','提货方式','起始站','起运港','目的港','目的仓库','截止收货日期','截止收货时间','异常处理截止日期','时间','最迟装柜日期','截补料日期','截补料日期时间','截关日期','预计离港日期','预计到港日期','预计航程','预计送仓日期','预计上架日期'],
          }
        ]
      };
      var toExcel = new ExportJsonExcel(option); 
      toExcel.saveExcel();   
    }
     // 点击导入
     const onUploadChange = (info) => {
      console.log(info,'onUploadChange')
    }
    const uploadCustomRequest = (file) => {
      console.log(file,'uploadCustomRequest')
      var formData = new FormData()
      formData.append('file', file.file);
      setLoading(true);
      API.upload(formData).then(res => {
        console.log(res)
        setLoading(false);
        if (res.success) {
          Message.success('导入成功');
          getList(1);
        } else {
          Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
        }
      })
    
    }

    const onSuccess = (info) => {
      console.log(info,'onSuccess')
    }

    const clear = () => {
      searchField.setValues({
        startWarehouse:'',
        destWarehouse:'',
        date:moment(''),
        pickUp:'',
        status:''
      })
      getList(1)
    }

    /**
   * 表单查询各种兼容处理
   */
     const getList = (currentPage) => {
      setpageIndex(currentPage)
      var date:any = searchField.getValue('date');
      console.log(date)
      date = date == 'Invalid date'?'':date;
      var startWarehouse = searchField.getValue('startWarehouse');
      var destWarehouse = searchField.getValue('destWarehouse');
      var pickUp = searchField.getValue('pickUp');
      var status = searchField.getValue('status');
      
      var params = {
        "pickUp":pickUp,
        "departureWarehouse":  startWarehouse?getWareName(whAll, startWarehouse) : '',//启示仓库
        "destinationWarehouse": destWarehouse?getWareName(whAll, destWarehouse) : '',//目的仓
        "status": status,
        "date":date?date.format('YYYY-MM-DD') : '',
        "pageNum": currentPage || 1,
        "pageSize": pageSize
      }
      console.log(params)
      API.getList(params).then(res => {
        setLoading(false);
        if (res.success && res.data) {
          var data = res.data;
          if (!data.data.length) {
            setTotal(0);
            setTableData([]);
            return
          }
          data.data.map(item => {
            var receivingTime = item.receivingTime?" "+item.receivingTime:'';
            var receivingDate = item.receivingDate?item.receivingDate+receivingTime:'';
            item.overdue = false;
            if(receivingDate){
              var receiveTimestamp =  new Date(receivingDate).getTime();
              if(new Date().getTime()>receiveTimestamp){
                item.overdue = true;
              }
            }
          })
          console.log(data.data)
          setTotal(data.total)
          setTableData(data.data || []);
        } else {
          Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
        }
      })
   }

  useEffect(() => {
    getPickUpList();
    getStatusList();
    setLoading(true);
    getList(1);
  }, []);
  

  const Search = (
    <div className="Search">
      <Form responsive labelAlign="left">
        <FormItem colSpan={4} label=''>
          <FormItem  label={lang['fb4.start.warehouse']}>
            <TreeSelect
                hasClear
                showSearch
                placeholder={lang['fb4.warehouse.choose']}
                treeDefaultExpandAll
                dataSource={whAll}
                {...init('startWarehouse')}
                style={{ width: '100%' }} />
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
              {...init('destWarehouse')}
              style={{ width: '100%' }} />
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label='最迟装柜日期'>
             <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} {...init('date')}/>
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label={lang['fb4.shopping.ideas']}>
            <Select dataSource={pickUpList}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                {...init('pickUp')} />
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label={lang['fb4.status']}>
            <Select dataSource={statusList}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                {...init('status')}  />
          </FormItem>
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
     
        <div className="add">
           <Row>
             <Col span={2}>
                <Upload
                  onChange={onUploadChange}
                  request={uploadCustomRequest}
                  onSuccess={onSuccess}
                  
              >
                  <Button type="primary" style={{margin: '0 0 10px'}}>导入船期</Button>
              </Upload>
          </Col>
          <Col>
          <Button type="primary" onClick={downloadTemp}>
            下载导入模板
          </Button></Col>
           </Row>
        </div>
        {Object.keys(tableData).length > 0 && (
          <>
            <Table
              hasBorder={false}
              className={styles.Table}
              dataSource={tableData}
            >
              <Table.Column title='批次' dataIndex="batchNo" width={200}/>
              <Table.Column title='提货方式' dataIndex="pickUp" width={200}/>
              <Table.Column title='始发仓' dataIndex="departureWarehouse" width={140}/>
              <Table.Column title='起运港' dataIndex="departurePort" width={140}/>
              <Table.Column title='目的港' dataIndex="destinationPort" width={140}/>
              <Table.Column title='目的仓库' dataIndex="destinationWarehouse" width={200}/>
              <Table.Column title='截止收货日期' dataIndex="receivingDate" width={140}/>
              <Table.Column title='截止收货时间' dataIndex="receivingTime" width={140}/>
              <Table.Column title='异常处理截止日期' dataIndex="exceptionDate" width={140}/>
              <Table.Column title='异常处理截止时间' dataIndex="exceptionTime" width={140}/>
              <Table.Column title='最迟装柜日期' dataIndex="latestDate" width={140}/>
              <Table.Column title='截补料日期' dataIndex="supplementDate" width={140}/>
              <Table.Column title='截补料日期时间' dataIndex="supplementTime" width={140}/>
              <Table.Column title='截关日期' dataIndex="customsDate" width={140}/>
              <Table.Column title='预计离港日期' dataIndex="planLeavePortDate" width={140}/>
              <Table.Column title='预计到港日期' dataIndex="planArrivePortDate" width={140}/>
              <Table.Column title='预计航程' dataIndex="planDays" width={140}/>
              <Table.Column title='预计送仓日期' dataIndex="planArriveDate" width={140}/>
              <Table.Column title='预计上架日期' dataIndex="planPutDate" width={140}/>
              <Table.Column
                lock='right'
                width={100}
                title='操作'
                cell={(value, index, record) => (
                  
                  <div className={styles.opt}>
                    <a onClick={() => optRecord(record,)} className="ahref">
                      {record.status == '0' ? lang['fb4.html.disable'] : lang['fb4.enabled']}
                    </a>
                    
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
    </div >
  )

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: '基础配置' }, { name: '物流计划导入' }]}
      />
       <Loading visible={loading} style={{ display: 'block' }}>
      {Search}
      {List}
      </Loading>
    </>
  );
});
