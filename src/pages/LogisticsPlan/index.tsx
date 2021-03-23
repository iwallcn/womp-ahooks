import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory, Link } from 'ice';
import { Table,Grid, Divider, Form, Loading, Button, TreeSelect, Message, Dialog, Input, Select, Pagination,Tab,DatePicker,Radio } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { renderTime, convertDictByType, getWareName } from '@/utils/index';
import ExportJsonExcel from 'js-export-excel'
import API from './api';
import moment from 'moment';

const FormItem = Form.Item;
const { Row, Col } = Grid;


export default injectIntl(({ intl }) => {
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const history = useHistory();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consignmentNos,setConsignmentNos] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [custom, setCustom] = useState('');
  const [status, setStatus] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pickUp, setPickUp] = useState(''); // 提货方式
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false); // 提货方式

  const [pageIndex, setpageIndex] = useState(1); // 当前页
  const [pageSize, setPageSize] = useState(20); // 每页条数
  const [total, setTotal] = useState(0); // 总条数

  const [pickUpList, setPickUpList] = useState<any[]>([])
  const tabs = [
    { tab: '待收货', key: 'A'},
    { tab: '已收货', key: 'V'},
    { tab: '已查验', key: 'K'},
    { tab: '已装柜', key: 'C'},
    { tab: '全部', key: 'All'}
  ];

    // 选择仓库加载数据
    const changeWh = (v) => {
      setWarehouse(v);
    }
     // 切换提货方式
  const changeConsignmentNo = (v) => {
    
    setConsignmentNos(v);
  }

    // 切换提货方式
    const changeCustom = (v) => {
      setCustom(v);
    }

  // 切换提货方式
  const changePickUp = (v) => {
    setPickUp(v);
  }
  const pageChange = (v) => {
    getList(v);
  }

  // 切换提货方式
  const changeTime = (v) => {
    if(v && v.length){
      setStartTime(v[0]?v[0]:'');
      setEndTime(v[1]?v[1]:'');
    }
   console.log(v)
  }
 
  const changeTab = (key) => {
    console.log(key)
    setStatus(key=='All'?'':key);   
    console.log(status)
    getList(1)
  }

  

  const handleExportBtn = (key) => {
    var consignmentNoArr = consignmentNos.split('\n');
    if(consignmentNoArr && consignmentNoArr.length){
      for(var i =0;i<consignmentNoArr.length;i++){
        var consignmentNo = consignmentNoArr[i];
        if(!consignmentNo){
          consignmentNoArr.splice(i,1)
        }
      }
    }
    var params = {
      "consignmentNos":consignmentNoArr,
      "pageNum":pageIndex,//页码
      "pageSize":pageSize,//页数
      "toWarehouseCode":warehouse,//起始仓库代码
      "pickType":pickUp,//提货方式代码
      "custom":custom,//客服号码
      "status":status,//入库单状态
      "createTime":startTime,//开始时间
      "endTime":endTime//结束时间
     }
    API.exportLogisticsCabinet(params).then(res => {
      setLoading(false);
      if (res.success) {
       var exportDataList = res.data && res.data && res.data.data && res.data.data.length?res.data.data:[];
       if(!exportDataList.length){
         Message.error('没有可导出数据')
       }else{
         exportData(exportDataList)
       }
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  }

  const exportData = (data) => {
      let dataTable =  [{'aa':'3322','bb': '232','cc':"322"}];
      var option={
        fileName:'text',
        datas:[
          {
          sheetData:dataTable,
          sheetName:'sheet',
          sheetFilter:['aa','bb','cc'],
          sheetHeader:['aa1','bb','cc'],
          }
        ]
      };
      var toExcel = new ExportJsonExcel(option); 
      toExcel.saveExcel();        

  }
    // 点击查询
    const query = () => {
      getList(1);
    }

    const clear = () => {
      setConsignmentNos('')
      setWarehouse('')
      setPickUp('')
      setStartTime('')
      setEndTime('')
      setCustom('')
      getList(1)
    }

     // 点击查询
     const handleUptBtn = (record) => {
       setUpdateDialogVisible(true)
    }
    // 获取提货方式
    const getPickUpList = () => {
      const source = convertDictByType('PICK_UP_TYPE');
      let temp: any = [{label:'全部',value:''}]
      for (let key in source) {
        let obj = {
          label: source[key].name,
          value: source[key].code
        }
        temp.push(obj);
      }
      setPickUpList(temp);
    }
      /**
   * 表单查询各种兼容处理
   */
       const getList = (currentPage) => {
        setpageIndex(currentPage)
        var consignmentNoArr = consignmentNos.split('\n');
        if(consignmentNoArr && consignmentNoArr.length){
          for(var i =0;i<consignmentNoArr.length;i++){
            var consignmentNo = consignmentNoArr[i];
            if(!consignmentNo){
              consignmentNoArr.splice(i,1)
            }
          }
        }
       var params = {
        "consignmentNos":consignmentNoArr,
        "pageNum":currentPage || 1,//页码
        "pageSize":pageSize,//页数
        "toWarehouseCode":warehouse,//起始仓库代码
        "pickType":pickUp,//提货方式代码
        "custom":custom,//客服号码
        "status":status,//入库单状态
        "createTime":startTime,//开始时间
        "endTime":endTime//结束时间
       }
       API.getLogisticsCabinetList(params).then(res => {
         setLoading(false);
         if (res.success) {
           var data = res.data;
           if (!data || (data && !data.data.length)) {
             setTotal(0);
             setTableData([]);
             return
           }
           data.data.map(item => {
             item.toWarehouseCode = getWareName(whAll,item.toWarehouseCode)
             item.actualArriveTime = moment(item.actualArriveTime).format('YYYY-MM-DD')
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
           setTotal(data.total)
           setTableData(data.data || []);
         } else {
           Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
         }
       })
     }

    useEffect(() => {
      getPickUpList();
      getList(1);
    }, []);
    
  const Search = (
    <div className="Search">
      <Form responsive labelAlign="left">
        <FormItem colSpan={4} label=''>
          <FormItem  label={lang['fb4.consignmentNo']}>
            <Input.TextArea onChange={changeConsignmentNo} value={consignmentNos}  style={{height:'100px'}} />
          </FormItem>
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label={lang['fb4.to.warehouse']}>
            <TreeSelect
              hasClear
              showSearch
              treeCheckable 
              placeholder={lang['fb4.warehouse.choose']}
              treeDefaultExpandAll
              dataSource={whAll}
              defaultValue={warehouse}
              onChange={changeWh}
              style={{ width: '100%' }} />
          </FormItem>
          <FormItem label='创建时间'>
             <DatePicker.RangePicker defaultValue={[startTime, endTime]} onChange={changeTime} style={{ width: '100%' }} />
          </FormItem>
        
        </FormItem>
        <FormItem colSpan={4} label=''>
          <FormItem  label='提货方式'>
            <Select dataSource={pickUpList} name="type" onChange={changePickUp}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                 value={pickUp} />
          </FormItem>
          <FormItem  label={lang['fb4.customer.service']}>
            <Input onChange={changeCustom} value={custom}/>
          </FormItem>
        </FormItem>
        <FormItem colSpan={12}  label="&nbsp;" style={{textAlign:'right'}}>
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
      </Form>
    </div>
  );

  const List = (
    <div className="List">
     
        <div className="add">
          <Button type="primary" onClick={() => history.push('/logistics/planCabinetEditPage')}>安排装柜</Button>
          <Button type="primary" onClick={handleExportBtn}>导出</Button>
        </div>
        {Object.keys(tableData).length > 0 && (
          <>
            <Table
              hasBorder={false}
              className={styles.Table}
              dataSource={tableData}
            >
              <Table.Column title='IC' dataIndex="consignmentNo" width={200}/>
              <Table.Column title='目的仓' dataIndex="toWarehouseCode" width={200}/>
              <Table.Column title='批次' dataIndex="batchNo" width={200}/>
              <Table.Column title='状态' dataIndex="status" width={200}/>
              <Table.Column title='客户编码' dataIndex="customerCode" width={200}/>
              <Table.Column title='收货时间' dataIndex="actualArriveTime" width={200}/>
              <Table.Column title='预估重量/预估立方数' dataIndex="valueAddedReceivableQty" width={200} />
              <Table.Column title='总箱数' dataIndex="valueAddedReceivableQty" width={200}/>
              <Table.Column title='箱单发票审核时间' dataIndex="boxInvoice" width={200}/>
              <Table.Column title='出口报关类型' dataIndex="ocustomsType" width={200}/>
              <Table.Column title='进口报关类型' dataIndex="icustomsType" width={200}/>
              <Table.Column title='物流产品' dataIndex="logisticsProduct" width={200}/>
              <Table.Column title='前线客服' dataIndex="valueAddedReceivableQty" width={200}/>
              <Table.Column title='异常完结时间' dataIndex="finishTime" width={200}/>
              <Table.Column title='装柜号' dataIndex="cabinetNo" width={200}/>
              <Table.Column title='带电类型' dataIndex="isBattery" width={200}/>
              <Table.Column title='品名' dataIndex="declareGoodsName" width={200}/>
              <Table.Column
                lock='right'
                width={140}
                title='调整物流计划'
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    {!record.arrange ? (
                        <a onClick={() => handleUptBtn(record)} className="ahref">
                        调整物流计划
                      </a>
                    ) : null}
                    
                  </div>
                )}
              />
            </Table>
            <Pagination onChange={pageChange} total={total} current={pageIndex} pageSize={pageSize} style={{marginTop:'10px'}}/>
          </>
        )}
        {Object.keys(tableData).length == 0 && (
          <div className="dataEmpty">{lang['fb4.common.date.empty']}</div>
        )}
    </div >
  )

    const UpdateDialog = (
    <Dialog
      title='修改物流计划'
      visible={updateDialogVisible}
      onCancel={() => setUpdateDialogVisible(false)}
      onClose={() => setUpdateDialogVisible(false)} >
      <Table
              hasBorder={false}
              className={styles.Table}
              dataSource={tableData}
            >
               <Table.Column
                width={100}
                title=''
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                   <Radio name="radioCheck" value={record.consignmentNo}></Radio>
                  </div>
                )}
              />
              <Table.Column title='物流计划批次#' dataIndex="consignmentNo" />
              <Table.Column title='起运港' dataIndex="toWarehouseCode" />
              <Table.Column title='目的港' dataIndex="batchNo" />
              <Table.Column title='截补料日期' dataIndex="status" />
              <Table.Column title='截补料时间' dataIndex="customerCode" />
              <Table.Column title='截关日期' dataIndex="actualArriveTime" />
              <Table.Column title='预计离港日期' dataIndex="valueAddedReceivableQty" />
              <Table.Column title='预计到港日期' dataIndex="valueAddedReceivableQty" />
              <Table.Column title='预计航程' dataIndex="boxInvoice" />
            </Table>
            <Row style={{marginTop:20}}>
              <Col>
                备注：<Input.TextArea style={{width:'60%'}}></Input.TextArea>
              </Col>
            </Row>
    </Dialog >
  );
  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['fb4.appointment.set.manage'] }]}
      />
       <Loading visible={loading} style={{ display: 'block' }}>
        {Search}
        <Tab size="small" shape="wrapped" onChange={changeTab}>
            {
                tabs.map(tab => <Tab.Item title={tab.tab} key={tab.key}>
                  {List}
                </Tab.Item>)
            }
        </Tab>
        {UpdateDialog}
      </Loading>
    </>
  );
});
