import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'ice';
import { Grid, Form, Select, Table, Message } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { convertDictByType, getWareName, renderTime } from '@/utils/index';
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

export default withRouter(injectIntl(({ history, location, intl }) => {
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const [receiptType, setReceiptType] = useState<any[]>([]); // 收货量类型
  const [selType, setSelType] = useState('A'); // 选择收获量
  const [basic, setBasic] = useState<any>({});
  const [tableList, setTableList] = useState<any[]>([]); // 表格数据
  useEffect(() => {
    if (!location.state) {
      return history.replace('/appointmentConfigure/listPage');
    }
    getDetail();
  }, []);
  const getDetail = () => {
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
        setTableList(list)
        res.data.appointmentConfigureLogList.sort((a, b) => {
          return moment(b.operationTime).valueOf() - moment(a.operationTime).valueOf();
        });
        setBasic(res.data);
      } else {
        Message.error(res.msg)
      }
    })
  }

  //表格title
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
   * 渲染表格每行数据
   * 第一列和第二列合并为select
   * 周日input默认不可编辑
   */
  const renderRow = (
    Object.keys(tableColumn).map((col, key) => (
      <Table.Column title={tableColumn[col]} dataIndex={col} key={col} cell={(value, index, record) => (
        <span>{value}</span>
      )
      }></Table.Column>
    ))
  );
  const renderHoliday = () => {
    let list = basic.appointmentDisabledConfigureList;
    if (list && list.length) {
      return Object.keys(list).map((v, i) => {
        return <span key={i}>{list[v].beginTime}  -  {list[v].endTime}</span>
      })
    } else {
      return ''
    }
  }
  /**
   * 根据货量类型，过滤表格数据
   * 1. 如果表格无数据，则返回[]
   * 2. 如果当前是新增页面：则只需要根据货量类型过滤数据即可
   * 3. 如果当前是编辑页面：则根据货量类型过滤，
   *       如果是客户类型，则不显示数据，需要输入客户id，添加数据
   *       其他客户类型，则展示，也可以继续在当前客户类型下添加数据
   */
  const filterTableList = () => {
    if (!tableList.length) {
      return [];
    }
    if (selType.length > 1) {  // 特殊客户类型，根据customerId判断
      return tableList.filter(v => v.customerId == selType);
    } else if (selType == 'C') {
      return []
    } else {
      return tableList.filter(v => v.type == selType);
    }
  }
  useEffect(() => {
    filterTableList();
  }, [tableList]);
  const changeSelect = (v) => {
    setSelType(v);
  }

  const FormPage = (
    <div className="Search">
      <Form labelAlign="left" {...formLayout}>
        <div className={styles.setting}>
          <span>{lang['fb4.warehouse']}：{getWareName(whAll, basic.warehouseCode)}</span>
        </div>

        <h5 className="Title_h5">{lang['fb4.carrier.type.set']}</h5>
        <div className={styles.setting}>
          <span>{lang['fb4.maximum.number.days.book']}: {basic.maxAdvanceDay}</span>
          <span>{lang['fb4.days.in.advance']}： {basic.advanceDay}</span>
          <span>{basic.maxAdvanceTime}</span>
        </div>

        <h5 className="Title_h5">{lang['performance.time.setting']}</h5>
        <div className={styles.setting}>
          <span>{basic.performAdvanceTime}min</span>
          <span>-</span>
          <span>{basic.performDelayTime}min</span>
        </div>

        <h5 className="Title_h5">{lang['fb4.but.goods.quantity']}</h5>
        <Row>
          <Col span={8}>
            <FormItem required label={lang['receipt.quantity.type']} {...formItemLayout}>
              <Select dataSource={receiptType} name="type"
                placeholder={lang['fb4.please.choose']} style={{ width: '100%' }}
                onChange={changeSelect} value={selType} />
            </FormItem>
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
            </Table>
          </Col>
        </Row>

        <h5 className="Title_h5">{lang['reservation.amount.setting']}</h5>
        <Row>
          <Col offset={1} span={8}>
            <FormItem className={styles.ItemSpan} required>
              <span>{lang['reservation.amount']}:</span>
              {basic.totalUnit}
              <span>UNIT</span>
            </FormItem>
          </Col>
        </Row>

        <h5 className="Title_h5">{lang['fb4.cannot.appointment.date.set']}</h5>
        <div className={styles.setting}>
          {renderHoliday()}
        </div>

        <h5 className="Title_h5">{lang['fb4.operation.log']}</h5>
        <Row>
          <Col offset={1} span={23}>
            <Table
              size="small"
              hasBorder={true}
              className={styles.Table}
              dataSource={basic.appointmentConfigureLogList}
            >
              <Table.Column title={lang['fb4.operate.time']} dataIndex="operationTime" cell={(v, i, r) => {
                return renderTime(v)
              }} />
              <Table.Column title={lang['fb4.operator']} dataIndex="operationUser" />
              <Table.Column title={lang['fb4.description']} dataIndex="operation" />
            </Table>
          </Col>
        </Row>
      </Form>
    </div>
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['appointment.setting.details'] }]}
      />
      {Object.keys(basic).length > 0 && FormPage}
    </>
  );
}));

