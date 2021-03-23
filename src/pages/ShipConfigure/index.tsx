import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory } from 'ice';
import { Table, Field, Divider, Form, Loading, Button, TreeSelect, Message, Dialog, NumberPicker, Input } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { renderTime, convertDictByCode, getWareName } from '@/utils/index';
import API from './api';

const FormItem = Form.Item;

export default injectIntl(({ intl }) => {
  const searchField = Field.useField({ values: {} });
  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState('');
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setLoading(true);
    getList()
  }, [warehouse]);

  const getList = () => {
    API.getList(warehouse || '').then(res => {
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
          val.carrier = `${convertDictByCode('CARRIER_TYPE', val.carrierType)}: ${d} ${lang['fb4.day']}`;
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
  const handleDelete = (record) => {
    Dialog.confirm({
      title: lang['fb4.reminder'],
      content: lang['are.you.sure.about.this.action'],
      onOk: () => {
        API.delShipConfig(record.shipConfigNo).then(res => {
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
      </Form>
    </div>
  );
  const triggerUpdate = (r) => {
    setVisible(true);
    searchField.setValues({
      shipDate: r.shipDate,
      shipConfigNo: r.shipConfigNo
    })
  }
  const handleUpdate = () => {
    searchField.validate((errors, values: any) => {
      if (errors) {
        return;
      }
      let r = {
        shipConfigNo: values.shipConfigNo,
        shipDate: values.shipDate,
      }
      API.update(r).then(res => {
        if (res.success) {
          setVisible(false);
          Message.success(res.msg);
          getList();
        } else {
          Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
        }
      })
    })
  };
  const Dialog_update = (
    <Dialog
      title={lang['edit.schedule.settings']}
      visible={visible}
      onOk={handleUpdate}
      onCancel={() => setVisible(false)}
      onClose={() => setVisible(false)} >
      <Form field={searchField} labelAlign="left">
        <FormItem required label={lang['sailing.schedule.days']}>
          <Input htmlType="hidden" name="shipConfigNo" />
          <NumberPicker step={1} min={0} name="shipDate" style={{ width: '100%' }} />
        </FormItem>
      </Form>
    </Dialog >
  )

  const List = (
    <div className="List">
      <Loading visible={loading} style={{ display: 'block' }}>
        <div className="add">
          <Button type="primary" onClick={() => history.push('/appointmentConfigure/addShipPage')}>
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
              <Table.Column title={lang['sailing.schedule.days']} dataIndex="shipDate" />
              <Table.Column title={lang['fb4.create.user']} dataIndex="createUser" />
              <Table.Column title={lang['fb4.create.time']} dataIndex="createTime" cell={(v, i, r) => {
                return v || '-'
              }} />
              <Table.Column
                title={lang['fb4.operation']}
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    <a onClick={() => handleDelete(record)} className="ahref">
                      {lang['fb4.delete']}
                    </a>
                    <Divider direction="ver" />
                    <a onClick={() => triggerUpdate(record)} className="ahref">
                      {lang['fb4.update']}
                    </a>
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
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['fb4.reservation.ship.manage'] }]}
      />
      {Search}
      {Dialog_update}
      {List}
    </>
  );
});
