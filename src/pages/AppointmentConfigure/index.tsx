import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory, Link } from 'ice';
import { Table, Divider, Form, Loading, Button, TreeSelect, Message, Dialog } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { renderTime, convertDictByCode, getWareName } from '@/utils/index';
import API from './api';

const FormItem = Form.Item;

export default injectIntl(({ intl }) => {
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const history = useHistory();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState('');

  useEffect(() => {
    setLoading(true);
    getList()
  }, [warehouse]);

  /**
   * 表单查询各种兼容处理
   */
  const getList = () => {
    API.getList(warehouse || '', '').then(res => {
      setLoading(false);
      if (res.success && res.data) {
        if (!res.data.length) {
          setTableData([]);
          return
        }
        res.data.map(val => {
          let day = val.advanceDayFpx || val.advanceDayCustomer;
          let d = day > 0 ? day : '';
          val.createTime = renderTime(val.createTime);
          val.carrier = val.carrierType ? `${convertDictByCode('CARRIER_TYPE', val.carrierType)}: ${d} ${lang['fb4.day']}` : '';
        })
        setTableData(res.data);
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  }
  // 选择仓库加载数据
  const changeWh = (v) => {
    setWarehouse(v);
  }
  // 启用禁用
  const handleModify = (record) => {
    let e = record.enabled === 'Y' ? 'N' : 'Y';
    let obj = {
      configNo: record.configNo,
      enabled: e
    }
    Dialog.confirm({
      title: lang['fb4.reminder'],
      content: lang['are.you.sure.about.this.action'],
      onOk: () => {
        API.updateEnabled(obj).then(res => {
          if (res.success) {
            Message.success(res.msg)
            getList();
          } else {
            Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
          }
        })
      },
      onCancel: () => console.log('cancel')
    });
  }

  const Search = (
    <div className="Search">
      <Form responsive labelAlign="left">
        <FormItem colSpan={6} label={lang['fb4.warehouse']}>
          <TreeSelect
            hasClear
            showSearch
            placeholder={lang['fb4.warehouse.choose']}
            treeDefaultExpandAll
            dataSource={whAll}
            defaultValue={warehouse}
            name="warehouseCode"
            onChange={changeWh}
            style={{ width: '100%' }} />
        </FormItem>

        {/* <Cell colSpan={3} className={styles.btns}>
          <Box
            spacing={8}
            direction="row"
            align="flex-end"
            justify="center"
            style={{ height: '100%' }}
          ><Form.Submit type="primary" onClick={search}>{lang['fb4.search']}</Form.Submit></Box></Cell> */}
      </Form>
    </div>
  );

  const List = (
    <div className="List">
      <Loading visible={loading} style={{ display: 'block' }}>
        <div className="add">
          <Button type="primary" onClick={() => history.push('/appointmentConfigure/addPage')}>
            {lang['fb4.new']}
          </Button>
        </div>
        {Object.keys(tableData).length > 0 && (
          <>
            <Table
              hasBorder={false}
              className={styles.Table}
              dataSource={tableData}
            >
              <Table.Column title={lang['fb4.warehouse']} dataIndex="warehouseCode" cell={(v, i, r) => {
                return getWareName(whAll, v)
              }} />
              <Table.Column title="履行时间(单位min)" cell={(v, i, r) => (
                <span>{r.performAdvanceTime}&lt;={lang['point.in.time']}&lt;={r.performDelayTime}</span>
              )} />
              <Table.Column title={lang['fb4.but.goods.quantity']} dataIndex="receivableQty" />
              <Table.Column title={lang['fpx.receivable.quantity']} dataIndex="fpxReceivableQty" />
              <Table.Column title={lang['valueadded.receivable.qty']} dataIndex="valueAddedReceivableQty" />
              <Table.Column title={lang['warehouse.volume']} dataIndex="totalUnit" />
              <Table.Column title={lang['fb4.create.user']} dataIndex="createUser" />
              <Table.Column title={lang['fb4.create.time']} dataIndex="createTime" cell={(v, i, r) => {
                return v || '-'
              }} />
              <Table.Column title={lang['fb4.status']} dataIndex="enabled" cell={(v, i, r) => {
                return v == 'Y' ? lang['fb4.enabled'] : lang['fb4.html.disable'];
              }} />
              <Table.Column
                title={lang['fb4.operation']}
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    <a onClick={() => handleModify(record)} className="ahref">
                      {record.enabled === 'Y' ? lang['fb4.html.disable'] : lang['fb4.enabled']}
                    </a>
                    <Divider direction="ver" />
                    <Link to={{ pathname: '/appointmentConfigure/addPage', state: record }}>{lang['fb4.modify']}</Link>
                    <Divider direction="ver" />
                    <Link to={{ pathname: '/appointmentConfigure/detailPage', state: record }}>{lang['fb4.view']}</Link>
                  </div>
                )}
              />
            </Table>
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
