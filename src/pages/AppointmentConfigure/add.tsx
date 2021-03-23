import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'ice';
import { Grid, Field, Form, TreeSelect, Input, Select, Table, DatePicker, TimePicker, Message, NumberPicker, Button, Checkbox } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { convertDictByType } from '@/utils/index';
import globalContext from '@/contexts/globalContext'
import { CustomIcon } from '@/components/Iconfont';
import InputCount from './inputCount';
import InputTime from './inputTime';
import moment from 'moment';
import API from './api';

const { Row, Col } = Grid;
const FormItem = Form.Item;
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

/**
 * 新增，修改共用
 */
export default withRouter(injectIntl(({ history, location, intl }) => {
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const searchField = Field.useField({ values: {} });
  const { init, setError } = searchField;
  const [tableList, setTableList] = useState<any[]>([]); // 表格数据
  const [receiptType, setReceiptType] = useState<any[]>([]); // 收货量类型
  const [selType, setSelType] = useState('A'); // 选择收获量
  const [hList, setHlist] = useState<any[]>([]); // 节假日
  const configNoNew = useRef(''); // 局部新增生成configNo
  const [saturdayDisabledType, setSaturdayDisabledType] = useState(false);
  const [sundayDisabledType, setSundayDisabledType] = useState(false);

  // 获取收货量类型
  const getReceiptType = () => {
    const source = convertDictByType('RECEIPT_QUANTITY_TYPE');
    let temp: any = []
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].code
      }
      temp.push(obj);
    }
    setReceiptType(temp);
  }

  useEffect(() => {
    if (!location.state) {
      getReceiptType(); // 获取select下拉
    } else {
      getDetail(); // 获取详情
    }
  }, []);

  const getDetail = () => {
    //　获取详情
    API.selectOneBy(location.state.configNo).then(res => {
      if (res.success) {
        let list = res.data.configureGoodsHorizontalList;
        if (list && list.length) {
          let customerIds: any = [];
          for (let i = 0; i < list.length; i++) {
            if (customerIds.length && customerIds.indexOf(list[i].customerId) > -1) {
              continue;
            }
            if (list[i].customerId) {
              customerIds.push({
                label: list[i].customerId,
                value: list[i].customerId
              });
            }
          }
          const source = convertDictByType('RECEIPT_QUANTITY_TYPE');
          let temp: any = []
          for (let key in source) {
            let obj = {
              label: source[key].name,
              value: source[key].code
            }
            temp.push(obj);
          }
          setReceiptType([...temp, ...customerIds]);
        }
        list.sort((a, b) => {
          return Date.parse('20 Aug 2000 ' + a.startTime) - Date.parse('20 Aug 2000 ' + b.startTime);
        });
        for (let i = 0; i < list.length; i++) {
          list[i].id = Math.random();
        }
        setTableList(list)
        searchField.setValues({
          warehouseCode: res.data.warehouseCode,
          advanceDay: res.data.advanceDay,
          maxAdvanceDay: res.data.maxAdvanceDay,
          maxAdvanceTime: res.data.maxAdvanceTime,
          performAdvanceTime: res.data.performAdvanceTime,
          performDelayTime: res.data.performDelayTime,
          type: res.data.type,
          customerId: res.data.customerId,
          totalUnit: res.data.totalUnit,
        })
        setSaturdayDisabledType(res.data.saturdayDisabledType == 'Y' ? true : false);
        setSundayDisabledType(res.data.sundayDisabledType == 'Y' ? true : false)
        let dis = res.data.appointmentDisabledConfigureList;
        if (dis && dis.length) {
          for (let i = 0; i < dis.length; i++) {
            let id = new Date().getTime();
            hList.push({ beginTime: '', id });
            searchField.setValues({
              [`beginTime${id}`]: [moment(dis[i].beginTime, 'YYYY-MM-DD', true), moment(dis[i].endTime, 'YYYY-MM-DD', true)]
            });
          }
          setHlist([...hList]);
        }
      } else {
        Message.error(res.msg)
      }
    });
  }
  // 收货量类型下拉
  const changeSelect = (v) => {
    setSelType(v);
  }
  /**
   * 根据货量类型，过滤表格数据
   * 1. 如果表格无数据，则返回[]
   * 2. 如果当前是新增页面：则只需要根据货量类型过滤数据即可
   * 3. 如果当前是编辑页面：则根据货量类型过滤，
   *       如果是客户类型，则不显示数据，需要输入客户id，添加数据
   *       其他客户类型，则展示，也可以继续在当前客户类型下添加数据
   */
  const isMounted = useRef(true); // FIXME
  const filterTableList = () => {
    if (!tableList.length) {
      return [];
    }
    if (location.state) { // 编辑
      if (selType.length > 1) {  // 特殊客户类型，根据customerId判断
        return tableList.filter(v => v.customerId == selType);
      } else if (selType == 'C' && isMounted.current) {
        return []
      } else if (selType == 'C' && !isMounted.current) {
        let id = searchField.getValue('customerId');
        return tableList.filter(v => v.type == selType && v.customerId == id);
      } else {
        return tableList.filter(v => v.type == selType);
      }
    } else { // 新增
      return tableList.filter(v => v.type == selType);
    }
  }
  useEffect(() => {
    filterTableList();
  }, [tableList]);
  /**
   * 表格新增一行
   * 必须先配置全部类型
   * 如果是客户类型，必须要填写客户id
   */
  const handleAdd = () => {
    let id: string = searchField.getValue('customerId');
    // 如果是客户类型，则一定要输入客户id
    if (selType == 'C' && !id) {
      Message.warning(lang['must.fill.customer.id']);
      return;
    }
    let obj = {
      id: new Date().getTime(),
      startTime: '',
      endTime: '',
      mondayUnit: 0,
      tuesdayUnit: 0,
      wednesdayUnit: 0,
      thursdayUnit: 0,
      fridayUnit: 0,
      saturdayUnit: 0,
      sundayUnit: 0,
      type: selType,
      customerId: ''
    }
    if (location.state) { // 修改
      if (selType.length > 1) { // 特殊客户类型
        obj.customerId = selType;
        obj.type = 'C';
      } else if (selType == 'C') { // 普通客户
        isMounted.current = false
        obj.customerId = id;
      }
    } else { // 新增
      if (selType == 'C' && id) {
        obj.customerId = id;
      }
    }
    setTableList([...tableList, obj]);
  }
  // 表格删除一行
  const handleDelete = (value, i, record) => {
    let arr = tableList.filter(v => v.id != record.id);
    setTableList(arr);
  }
  // 单独保存表格
  const saveTable = () => {
    if (searchField.getValue('warehouseCode') == '') {
      Message.warning(lang['fb4.html.select.warehouseCode']);
      return;
    }
    let configureGoodsHorizontalList = filterTableList();
    if (!configureGoodsHorizontalList.length) {
      Message.warning(lang['configuration.cannot.empty']);
      return;
    }
    if (!chkStartEnd()) return;
    if (!checkTotal()) return;
    let data = {
      warehouseCode: searchField.getValue('warehouseCode'),
      configureGoodsHorizontalList,
      configNo: location.state ? location.state.configNo : configNoNew.current
    }
    API.addOrUpdateConfigureGoods(data).then(res => {
      if (res.success) {
        configNoNew.current = res.data;
        Message.success(res.msg);
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  }
  /**
 * 先组装不可约日期
 * 然后再组装收获量类型
 */
  const submit = () => {
    console.log(saturdayDisabledType, sundayDisabledType)
    searchField.validate((errors, values: any) => {
      if (errors) {
        if (selType != 'C') {
          setError('customerId', '');
        }
        return;
      }
      if (!tableList.filter(v => v.type == 'A').length) { // 必须要配置全部
        Message.warning(lang['config.type.must.configured']);
        return;
      }
      if (!chkStartEnd()) return;
      if (!checkTotal()) return;
      let data = {
        warehouseCode: values.warehouseCode,
        enabled: 'Y',
        advanceDay: values.advanceDay * 1,
        maxAdvanceDay: values.maxAdvanceDay * 1,
        maxAdvanceTime: moment(values.maxAdvanceTime, 'HH:mm', true).format('HH:mm'),
        performAdvanceTime: values.performAdvanceTime * 1,
        performDelayTime: values.performDelayTime * 1,
        totalUnit: values.totalUnit * 1,
        configureGoodsHorizontalList: tableList,
        appointmentDisabledConfigureList: [],
        saturdayDisabledType: saturdayDisabledType ? 'Y' : 'N',
        sundayDisabledType: sundayDisabledType ? 'Y' : 'N',
      }
      // 组装不可用日期
      let temp: any = [];
      for (let i = 0; i < hList.length; i++) {
        let t = searchField.getValue(`beginTime${hList[i].id}`);
        if (t) {
          let obj = {
            beginTime: t[0].format('YYYY-MM-DD'),
            endTime: t[1].format('YYYY-MM-DD')
          }
          if (location.state && location.state.configNo) {
            obj.configNo = location.state.configNo;
          }
          temp.push(obj);
        }
      }

      data.appointmentDisabledConfigureList = temp;
      if (!location.state) { // 新增
        let configNo = configNoNew.current;
        API.insert({ ...data, configNo }).then(res => {
          if (res.success) {
            Message.success(res.msg)
            history.push('/appointmentConfigure/listPage');
          } else {
            Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
          }
        })
      } else { // 修改
        let configNo = location.state.configNo;
        API.update({ ...data, configNo }).then(res => {
          if (res.success) {
            Message.success(res.msg)
            history.push('/appointmentConfigure/listPage');
          } else {
            Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
          }
        })
      }
    });
  }
  /**
   * 全部收货总量 >=4px头程用户量+增值量+客户量  按照每天去对比
   * 先将数据分为全部+其他，然后再把全部的每天和其他的每天进行对比，只要有一个其他的大于全部，则不允许提交
   */
  const checkTotal = () => {
    let mondayUnit = 0, tuesdayUnit = 0, wednesdayUnit = 0, thursdayUnit = 0, fridayUnit = 0, saturdayUnit = 0, sundayUnit = 0;
    let _mondayUnit = 0, _tuesdayUnit = 0, _wednesdayUnit = 0, _thursdayUnit = 0, _fridayUnit = 0, _saturdayUnit = 0, _sundayUnit = 0;
    for (let i = 0; i < tableList.length; i++) {
      let v = tableList[i];
      if (v.type == 'A') {
        mondayUnit += v['mondayUnit'] * 1;
        tuesdayUnit += v['tuesdayUnit'] * 1;
        wednesdayUnit += v['wednesdayUnit'] * 1;
        thursdayUnit += v['thursdayUnit'] * 1;
        fridayUnit += v['fridayUnit'] * 1;
        saturdayUnit += v['saturdayUnit'] * 1;
        sundayUnit += v['sundayUnit'] * 1;
      } else {
        _mondayUnit += v['mondayUnit'] * 1;
        _tuesdayUnit += v['tuesdayUnit'] * 1;
        _wednesdayUnit += v['wednesdayUnit'] * 1;
        _thursdayUnit += v['thursdayUnit'] * 1;
        _fridayUnit += v['fridayUnit'] * 1;
        _saturdayUnit += v['saturdayUnit'] * 1;
        _sundayUnit += v['sundayUnit'] * 1;
      }
    }
    // return totalA - totalO;
    if (mondayUnit < _mondayUnit) {
      Message.warning(lang['monday.total.unit.must.configured']);
      return false;
    }
    if (tuesdayUnit < _tuesdayUnit) {
      Message.warning(lang['tuesday.total.unit.must.configured']);
      return false;
    }
    if (wednesdayUnit < _wednesdayUnit) {
      Message.warning(lang['wednesday.total.unit.must.configured']);
      return false;
    }
    if (thursdayUnit < _thursdayUnit) {
      Message.warning(lang['thursday.total.unit.must.configured']);
      return false;
    }
    if (fridayUnit < _fridayUnit) {
      Message.warning(lang['friday.total.unit.must.configured']);
      return false;
    }
    if (saturdayUnit < _saturdayUnit) {
      Message.warning(lang['saturday.total.unit.must.configured']);
      return false;
    }
    if (sundayUnit < _sundayUnit) {
      Message.warning(lang['sunday.total.unit.must.configured']);
      return false;
    }
    return true;
  }

  /**
   * 渲染表格
   */
  const tableColumn = {
    startTime: lang['fb4.start.time'],
    endTime: lang['fb4.time.end'],
    mondayUnit: lang['fb4.Monday'],
    tuesdayUnit: lang['fb4.tuesday'],
    wednesdayUnit: lang['fb4.wednesday'],
    thursdayUnit: lang['fb4.thursday'],
    fridayUnit: lang['fb4.friday'],
    saturdayUnit: lang['fb4.saturday'],
    sundayUnit: lang['fb4.sunday']
  }

  /**
   * 校验开始时间和结束时间
   */
  const chkStartEnd = () => {
    let data = filterTableList();
    for (let i = 0; i < data.length; i++) {
      if (!data[i]['startTime'] || !data[i]['endTime']) {
        Message.warning(lang['fb4.notempty.starttime'] + ',' + lang['fb4.notempty.endtime']);
        return false;
      }
      let startTime = Date.parse('20 Aug 2000 ' + moment(data[i]['startTime'], 'HH:mm', true).format('HH:mm'));
      let endTime = Date.parse('20 Aug 2000 ' + moment(data[i]['endTime'], 'HH:mm', true).format('HH:mm'));
      if (startTime > endTime) {
        Message.warning(lang['start.cant.end']);
        return false;
      }
    }
    return true;
  }

  /**
   * 表格渲染
   */
  const renderRow = (
    Object.keys(tableColumn).map((key, i) => (
      <Table.Column title={tableColumn[key]} dataIndex={key} key={key} cell={(value, index, record) => {
        if (i < 2) {
          return <InputTime value={value} _key={key} record={record} index={i} />
        } else {
          return <InputCount value={value} _key={key} record={record} index={i} />
        }
      }
      }></Table.Column>
    ))
  );

  /**
   * 不可约日期设置渲染
   */
  const disabledDate = (date, view) => {
    const currentDate = moment();
    switch (view) {
      case 'date':
        return date.valueOf() <= currentDate.valueOf();
      case 'year':
        return date.year() < currentDate.year();
      case 'month':
        return date.year() * 100 + date.month() < currentDate.year() * 100 + currentDate.month();
      default: return false;
    }
  }
  // 遍历不可用日期
  const renderHHoliday = (
    Object.keys(hList).map((v, i) => {
      let id = hList[v].id;
      return (
        <div className={styles.holiday} key={id}>
          <FormItem key={id}>
            <DatePicker.RangePicker disabledDate={disabledDate} name={`beginTime${id}`} format="YYYY-MM-DD" key={id} hasClear={false} />
            <CustomIcon type="close" className={styles.news} onClick={() => handleDeleteH(i, `beginTime${id}`)} />
          </FormItem>
        </div>
      )
    })
  )
  // 不可约节节假日新增一行
  const handleAddH = () => {
    let obj = {
      beginTime: '',
      id: new Date().getTime()
    }
    setHlist([...hList, obj]);
  }
  // 不可约节节假日删除一行
  const handleDeleteH = (i, name) => {
    let arr = hList.filter((val, index) => index !== i);
    searchField.remove(name);
    setHlist([...arr]);
  }
  const validatorEnd = (rule, value, callback) => {
    let start: number = searchField.getValue('performAdvanceTime')
    if (value < start) {
      setError('performDelayTime', lang['start.cant.end']);
    }
    return callback();
  }

  const FormPage = (
    <div className="Search">
      <Form field={searchField} labelAlign="left" {...formLayout}>
        <Row>
          <Col span={12}>
            <FormItem label={lang['fb4.warehouse']} {...formItemLayout} required>
              <TreeSelect
                hasClear
                showSearch
                placeholder={lang['fb4.warehouse.choose']}
                treeDefaultExpandAll
                dataSource={whAll}
                disabled={location.state ? true : false}
                style={{ width: 300 }}
                {...init('warehouseCode', {
                  initValue: '',
                  rules: [{
                    required: true,
                    message: lang['fb4.warehouse.choose']
                  }]
                })} />
            </FormItem>
          </Col>
        </Row>
        <h5 className="Title_h5">
          {lang['fb4.but.goods.quantity']}
          <span className={styles.tips}>
            <CustomIcon type="tishi" size="small"></CustomIcon>
            <span>{lang['ormula.total.receipt']}</span>
          </span>
          <Button className={styles.save} onClick={saveTable} type="primary">{lang['fb4.save']}</Button>
        </h5>
        <Row>
          <Col span={8}>
            <FormItem required label={lang['receipt.quantity.type']} {...formItemLayout}>
              <Select dataSource={receiptType} name="type" placeholder={lang['fb4.please.choose']} style={{ width: '100%' }} onChange={changeSelect} value={selType} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem required={selType !== 'C' ? false : true} >
              <Input name="customerId" style={{ width: 120 }} htmlType={selType !== 'C' ? 'hidden' : ''} />
            </FormItem>
          </Col>
          <Col offset={9} span={1} className={styles.Cursor}>
            <CustomIcon type="news" onClick={handleAdd} className={styles.news} />
          </Col>
        </Row>
        <Row>
          <Col offset={1} span={23}>
            <Table
              size="small"
              hasBorder={true}
              className={styles.Table}
              dataSource={filterTableList()}
              primaryKey="id"
            >
              {renderRow}
              <Table.Column
                title={lang['fb4.action']}
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    <span onClick={() => handleDelete(value, index, record)}><CustomIcon type="close" className={styles.news} /></span>
                  </div>
                )}
              />
            </Table>
          </Col>
        </Row>
        <h5 className="Title_h5">{lang['fb4.carrier.type.set']}</h5>
        <Row>
          <Col span={9} offset={1}>
            <FormItem className={styles.ItemSpan} required>
              <span>{lang['fb4.days.in.advance']}</span>
              <NumberPicker step={1} min={0} style={{ width: 100 }} name="advanceDay" />
              <span>{lang['fb4.set.no.day.warehousing.reservation']}</span>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={9} offset={1}>
            <FormItem className={styles.ItemSpan} required>
              <span>{lang['fb4.maximum.number.days.book']}</span>
              <NumberPicker step={1} min={0} style={{ width: 100 }} name="maxAdvanceDay" />
              <span>{lang['fb4.set.no.day.warehousing.reservation']}</span>
            </FormItem>
          </Col>
          <Col span={3}>
            <FormItem required >
              <TimePicker hourStep={1} minuteStep={30} format="HH:mm" name="maxAdvanceTime" />
            </FormItem>
          </Col>
        </Row>

        <h5 className="Title_h5">{lang['performance.time.setting']}</h5>
        <Row gutter="8">
          <Col span={4} offset={1}>
            <FormItem required >
              <NumberPicker step={1} min={0} style={{ width: '100%' }} name="performAdvanceTime" innerAfter="min" />
            </FormItem>
          </Col>
          <Col span={2} className={styles.timePoint}>
            &lt;={lang['point.in.time']}&lt;=
          </Col>
          <Col span={4}>
            <FormItem required >
              <NumberPicker step={1} min={0} style={{ width: '100%' }} innerAfter="min"
                {...init('performDelayTime', {
                  initValue: 1,
                  rules: [{
                    required: true,
                    pattern: /^\d+(\.\d+)?$/,
                    validator: validatorEnd
                  }]
                })} />
            </FormItem>
          </Col>
        </Row>

        <h5 className="Title_h5">{lang['reservation.amount.setting']}</h5>
        <Row>
          <Col offset={1} span={8}>
            <FormItem className={styles.ItemSpan} required>
              <span>{lang['reservation.amount']}</span>
              <NumberPicker step={0.1} min={0} style={{ width: 100 }} name="totalUnit" />
              <span>UNIT</span>
            </FormItem>
          </Col>
        </Row>
        <h5 className="Title_h5">{lang['fb4.cannot.appointment.date.set']}
          <CustomIcon type="news" onClick={handleAddH} className={styles.news} />
          {/* <Checkbox.Group value={isweekday} dataSource={isweek} onChange={weekChange} /> */}
          <Checkbox onChange={setSaturdayDisabledType} style={{ margin: '0 16px' }} checked={saturdayDisabledType}>{lang['fb4.html.Saturday']}</Checkbox>
          <Checkbox onChange={setSundayDisabledType} checked={sundayDisabledType}>{lang['fb4.html.Sunday']}</Checkbox>
        </h5>
        <div className={styles.holidays}>
          {renderHHoliday}
        </div>

        <Row gutter="8">
          <Col offset={1} span={1}>
            <Form.Submit
              type="primary"
              onClick={submit}
              validate>
              {lang['fb4.save']}
            </Form.Submit>
          </Col>
          <Col offset={1} span={1}>
            <Form.Reset >{lang['fb4.reset']}</Form.Reset>
          </Col>
        </Row>
      </Form>
    </div>
  );

  return (
    <globalContext.Provider
      value={{
        tableList,
        setTableList
      }}
    >
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: location.state ? lang['fb4.appointment.set.edit'] : lang['fb4.appointment.set.add'] }]}
      />
      {FormPage}
    </globalContext.Provider>
  );
}));
