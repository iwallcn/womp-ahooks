import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory, withRouter } from 'ice';
import { Grid, Table, Field, Form, Loading, Button, TreeSelect, DatePicker, Select,Pagination,Message, Input,NumberPicker,Dialog } from '@alifd/next';
import styles from './index.module.scss';
import moment from 'moment';
import PageHeader from '@/components/PageHeader';
import {  convertDictByType,convertDictByCode, getWareName } from '@/utils/index';
import { CustomIcon } from '@/components/Iconfont';
import API from './api';
import { isEmptyObject } from 'jquery';

const FormItem = Form.Item;
const { Row, Col } = Grid;

export default withRouter(injectIntl(({ history, location, intl }) => {
  const searchField = Field.useField({ values: {} });
  const { init, setError } = searchField
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const [tableData, setTableData] = useState<any>([]);
  const [addDialogVisible, setAddDialogVisible] = useState(''); // 添加柜型
  const [containerType, setContainerType] = useState(''); // 柜型
  const [consignmentNos,setConsignmentNos] = useState('');
  const [containerTypeList, setContainerTypeList] = useState<any[]>([])


  const [loadingMethod, setLoadingMethod] = useState(''); // 装柜
  const [loadingMethodList, setLoadingMethodList] = useState<any[]>([])
  const [loadingTime, setLoadingTime] = useState<any>(''); // 装柜

  const [exportType, setExportType] = useState(''); // 出口
  const [exportTypeList, setExportTypeList] = useState<any[]>([])
  
  const [importType, setImportType] = useState(''); // 进口
  const [importTypeList, setImportTypeList] = useState<any[]>([])

  const [detailList, setDetailList] = useState<any[]>([])

  const formLayout = {
    labelCol: {
      fixedSpan: 6,
    },
    wrapperCol: {
      span: 18,
    },
  };
  const formItemLayout = {
    labelCol: {
      fixedSpan: 6,
    },
    wrapperCol: {
      span: 16,
    },
  };
    // 获取柜型
    const getContainerTypeList = () => {
      const source = convertDictByType('CABINET_TYPE');
      console.log(source)
      let temp: any = []
      for (let key in source) {
        let obj = {
          label: source[key].name,
          value: source[key].name
        }
        temp.push(obj);
      }
      setContainerTypeList(temp);
    }
  // 获取状态
  const changeContainerType = (v) => {
    setContainerType(v);
  }

    // 获取委托单号
    const changeConsignmentNos = (v) => {
      setConsignmentNos(v);
    }

   // 获取柜型
   const getLoadingModeList = () => {
    const source = convertDictByType('LOADING_MODE');
    console.log(source)
    let temp: any = []
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].name
      }
      temp.push(obj);
    }
    setLoadingMethodList(temp);
  }
// 获取状态
const changeLoadingMethod = (v) => {
  setLoadingMethod(v);
}

  // 获取出口
  const getExportTypeList = () => {
    const source = convertDictByType('EXPORT_DECLARE_TYPE');
    console.log(source)
    let temp: any = []
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].name
      }
      temp.push(obj);
    }
    setExportTypeList(temp);
  }
// 获取状态
const changeExportType = (v) => {
  setExportType(v);
}

 // 获取出口
 const getImportTypeList = () => {
  const source = convertDictByType('IMPORT_DECLARE_TYPE');
  console.log(source)
  let temp: any = []
  for (let key in source) {
    let obj = {
      label: source[key].name,
      value: source[key].name
    }
    temp.push(obj);
  }
  setImportTypeList(temp);
}
// 获取状态
const changeImportType = (v) => {
  setImportType(v);
}

const delDetail = (record,index) => {
  var newTableData = tableData.filter((item, i) => { return i !== index });
  setTableData(newTableData)
}

const changeLoadingTime = (v) => {
  console.log(v)
  setLoadingTime(v);
}

const submit = (v) => {
  var detailList: any[] = [];
  if(tableData && tableData.length){
    tableData.forEach((item1) => {
      detailList.push({
        consignmentNo: item1.consignmentNo
      })
    })
  }
  if(!detailList.length){
    Message.warning('请添加委托单信息')
    return;
  }
  var totalVolume = searchField.getValue('totalVolume')
  var totalWeight = searchField.getValue('totalWeight')
  var remarks = searchField.getValue('remarks')
  var loadingTime:any = searchField.getValue('loadingTime')
  var params:any = {
    "containerType": containerType,
    "loadingMethod": loadingMethod,
    "importType":importType,
    "exportType": exportType,
    "totalVolume": totalVolume,
    "totalWeight": totalWeight,
    "loadingTime": loadingTime?loadingTime.format('YYYY-MM-DD'):'',
    "remarks": remarks,
    "detailList":detailList
  }
  if(location.state){
    params.containerId = location.state.containerId;
  }
  API.saveOrupdatePlanContainer(params).then(res => {
    if (res.success) {
      Message.success('提交成功')
      history.push('/logistics/planCabinetPage');
    } else {
      Message.error(res.msg)
    }
  });
 
}
const handleAddBtn = () => {
  var consignmentNoArr = consignmentNos.split('\n');
  if(consignmentNoArr && consignmentNoArr.length){
    for(var i =0;i<consignmentNoArr.length;i++){
      var consignmentNo = consignmentNoArr[i];
      if(!consignmentNo){
        consignmentNoArr.splice(i,1)
      }
    }
    var existConsignmentArr:any = [];
    tableData.forEach(item => {
      existConsignmentArr.push(item.consignmentNo)
    });
    var saveArr = getSaveArr(consignmentNoArr,existConsignmentArr)
    if(saveArr && saveArr.length){
      Message.error(saveArr.join(',')+'已存在');
      return;
    }
  }else{
    Message.error('请输入委托单号');
    return;
  }
  API.getPlanContainerDetail(consignmentNoArr).then(res => {
    if (res.success) {
      var detailList = res.data && res.data.length?res.data:[];
      convertTableData(detailList)
    } else {
      Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
    }
  })
}

const getSaveArr = (arr1,arr2) => {
  var saveArr:any = [];
  arr1.forEach((item) => {
    if (arr2.indexOf(item) > -1) {
      saveArr.push(item);
    }
  })
 
  console.log(saveArr)
  return saveArr
}

const convertTableData = (detailList) => {
  console.log('23')
  detailList.forEach((item) => {
    item.toLogicWarehouseCode = '';
    item.logisticsProduct = '';
    item.totalBoxs = '';
    item.totalVolume = '';
    item.totalWeight = '';
    item.time ='';
    item.status = '';

    item.icustomsType = '';
    item.ocustomsType = '';
    item.containerType = '';
    item.loadingTime = '';
    item.batchNo = item.planTransportDTO && item.planTransportDTO.batchNo?item.planTransportDTO.batchNo:'';
    if(item.inboundConsignmentDetailDTO){
      var consignmentData = item.inboundConsignmentDetailDTO;
      item.toLogicWarehouseCode = getWareName(whAll,consignmentData.toLogicWarehouseCode);
      item.logisticsProduct = consignmentData.logisticsProduct;
      item.totalBoxs = consignmentData.totalBoxs || '';
      item.totalVolume = consignmentData.totalVolume || '';
      item.totalWeight = consignmentData.totalWeight || '';
     var actualArriveTime = consignmentData.actualArriveTime?moment(consignmentData.actualArriveTime).format('YYYY-MM-DD'):'';
     var createTime = consignmentData.createTime?moment(consignmentData.createTime).format('YYYY-MM-DD'):'';
      if(actualArriveTime && createTime){
        item.time = actualArriveTime+"/"+createTime
      }else{
        item.time = actualArriveTime || createTime;
      }
      item.status = convertDictByCode('INSTOCK_CONSIGNMENT_STATUS',consignmentData.status);

      item.ocustomsType = convertDictByCode('EXPORT_DECLARE_TYPE',consignmentData.ocustomsType);
      item.icustomsType = convertDictByCode('IMPORT_DECLARE_TYPE',consignmentData.icustomsType);
      if(consignmentData.loadingCabinet){
        var loadingTime = consignmentData.loadingCabinet.loadingTime;
        console.log(loadingTime,'loadingTime')
        var containerType = consignmentData.loadingCabinet.containerType;
        item.loadingTime = loadingTime?moment(loadingTime).format('YYYY-MM-DD'):'';
        item.containerType = containerType?convertDictByCode('CABINET_TYPE',containerType):'';
      }
    }
   
  
  })
  setTableData(detailList.concat(tableData))
}
  useEffect(() => {
    getContainerTypeList()
    getLoadingModeList()
    getExportTypeList()
    getImportTypeList()
  }, []);

  useEffect(() => {
    if (location.state) {
      getDetail(); // 获取详情
    }
  }, [containerTypeList]);
  
  const getDetail = () => {
    //　获取详情
    var params = {
      id:location.state.containerId
    }
    console.log(params)
    API.getPlanContainer(location.state.containerId).then(res => {
      console.log(res)
      if (res.success) {
        if(!res.data){
          return;
        }
        setContainerType(res.data.containerType)
        setLoadingMethod(res.data.loadingMethod)
        setImportType(res.data.importType)
        setExportType(res.data.exportType)
        var loadingTime = res.data.loadingTime?moment(new Date(res.data.loadingTime), 'YYYY-MM-DD', true):'';
        console.log(loadingTime)
        setLoadingTime(loadingTime)
       
        searchField.setValues({
          totalVolume: res.data.totalVolume || '',
          totalWeight: res.data.totalWeight || '',
          remark: res.data.remark || '',
          loadingTime:loadingTime
        })
        var detailList = res.data && res.data.detailList && res.data.detailList.length?res.data.detailList:[];
        convertTableData(detailList)
      } else {
        Message.error(res.msg)
      }
    });
  }
  const FormPage = (
    <div className="Search" style={{marginBottom:0}}>
      <div style={{textAlign:'right'}}>
        <Form.Submit
          type="primary"
          onClick={submit}
          >
         提交
        </Form.Submit>
      </div>
      <Form field={searchField} labelAlign="left" {...formLayout}>
        <h5 className="Title_h5">
          基本信息
        </h5>
        <Row>
          <Col span={12}>
            <FormItem label='柜型' {...formItemLayout} required>
               <Select dataSource={containerTypeList} onChange={changeContainerType}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                 value={containerType} name='containerType'/>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='装柜方式' {...formItemLayout} required>
               <Select dataSource={loadingMethodList} onChange={changeLoadingMethod}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                 value={loadingMethod} name="loadingMethod" />
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <FormItem label='进口报关类型' {...formItemLayout} required>
               <Select dataSource={importTypeList} onChange={changeImportType}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                 value={importType} name="importType" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='出口报关类型' {...formItemLayout} required>
               <Select dataSource={exportTypeList} onChange={changeExportType}
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                 value={exportType} name="exportType"/>
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <FormItem label='体积' {...formItemLayout} required>
              <NumberPicker step={1} min={0} style={{ width: '100%' }} name="totalVolume" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label='装柜方式' {...formItemLayout} required>
              <DatePicker format="YYYY-MM-DD"  style={{ width: '100%' }} 
               {...init('loadingTime')} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label='总重量' {...formItemLayout} required>
               <NumberPicker step={1} min={0} style={{ width: '100%' }} name="totalWeight" />
            </FormItem>
          </Col>
        
        </Row>
        <Row>
          <Col span={24}>
            <FormItem label='备注' {...formItemLayout}>
              <Input.TextArea style={{ width: '100%' }} name="maxAdvanceDay" />
            </FormItem>
          </Col>
        
        </Row>
        <h5 className="Title_h5">
           委托单信息
        </h5>
        <Row>
          <Col span={12}>
            <FormItem label='委托单号' {...formItemLayout}>
               <Input.TextArea style={{ width: '100%' }} onChange={changeConsignmentNos} />
            </FormItem>
          </Col>
          <Col span={12}>
            <Button  type="primary" onClick={handleAddBtn}>添加</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );

  const List = (
    <div className="List">
        {Object.keys(tableData).length > 0 && (
          <>
            <Table
              hasBorder={false}
              className={styles.Table}
              dataSource={tableData}
            >
              <Table.Column title='委托单号' dataIndex="consignmentNo" width={200}/>
              <Table.Column title='目的仓' dataIndex="toLogicWarehouseCode" width={200}/>
              <Table.Column title='物流产品' dataIndex="logisticsProduct" width={200}/>
              <Table.Column title='箱数' dataIndex="totalBoxs" width={200}/>
              <Table.Column title='体积' dataIndex="totalVolume" width={200}/>
              <Table.Column title='重量' dataIndex="totalWeight" width={200}/>
              <Table.Column title='批次#' dataIndex="batchNo" width={200}/>
              <Table.Column title='到货时间/下单日期' dataIndex="time" width={200}/>
              <Table.Column title='客服' dataIndex="frontCustomeSrervice" width={200}/>
              <Table.Column title='销售' dataIndex="valueAddedReceivableQty" width={200}/>
              <Table.Column title='装柜时间' dataIndex="loadingTime" width={200}/>
              <Table.Column title='柜型' dataIndex="containerType" width={200}/>
              <Table.Column title='货物品名' dataIndex="declareGoodsName" width={200}/>
              <Table.Column title='带电类型' dataIndex="isBattery" width={200}/>
              <Table.Column title='总件数' dataIndex="skuCount" width={200}/>
              <Table.Column title='板数' dataIndex="plateNumber" width={200}/>
              <Table.Column title='状态' dataIndex="status" width={200}/>
              <Table.Column title='出口报关类型' dataIndex="ocustomsType" width={200}/>
              <Table.Column title='进口报关类型' dataIndex="icustomsType" width={200}/>
              <Table.Column
                lock='right'
                width={100}
                title='操作'
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    <a onClick={() => delDetail(record,index)} className="ahref">
                     删除
                    </a>
                    
                  </div>
                )}
              />
            </Table>
            {/* <Pagination onChange={pageChange} total={total} current={pageIndex} pageSize={pageSize} className="mgt10" /> */}
          </>
        )}
       
    </div >
  )

  // const AddDialog = (
  //   <Dialog
  //     title='上传船期'
  //     visible={addDialogVisible}
  //     onCancel={() => setAddDialogVisible(false)}
  //     onClose={() => setAddDialogVisible(false)} >
  //    sdf
  //   </Dialog >
  // );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['fb4.appointment.set.manage'] }]}
      />
      {FormPage}
      {List}
    </>
  );
}));
