import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory } from 'ice';
import { Table, Field, Divider, Form, Loading, Button, NumberPicker, TreeSelect, Message, Dialog, Select, Input, NumberPicker } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { renderTime, convertDictByCode, convertDictByType } from '@/utils/index';
import API from './api';

const FormItem = Form.Item;

export default injectIntl(({ intl }) => {
  const history = useHistory();
  const searchField = Field.useField({ values: {} });
  const { init, setError } = searchField

  const lang = window.GLOBAL_LANG;
  const whAll = window.GLOBAL_WHALL;
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState('');
  const [visible, setVisible] = useState(false);
  // const [record, setRecord] = useState({});
  const [cabinetType, setCabinetType] = useState([]);

  // 获取柜型
  const getCabinetType = () => {
    const source = convertDictByType('CABINET_TYPE');
    let temp: any = []
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].code
      }
      temp.push(obj);
    }
    setCabinetType(temp);
  }

  useEffect(() => {
    setLoading(true);
    getList();
    getCabinetType();
  }, []);

  const getList = () => {
    API.getList(warehouse).then(res => {
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
  const handleDelete = (record) => {
    Dialog.confirm({
      title: lang['fb4.reminder'],
      content: lang['are.you.sure.about.this.action'],
      onOk: () => {
        API.delUnitConfig(record.unitConfigNo).then(res => {
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
      containerType: r.containerType,
      unit: r.unit,
      volumeStartRange: r.volumeStartRange,
      volumeEndRange: r.volumeEndRange,
      unitConfigNo: r.unitConfigNo
    })
  }
  const handleUpdate = () => {
    searchField.validate((errors, values: any) => {
      if (errors) {
        return;
      }
      let r = {
        containerType: values.containerType,
        unit: values.unit,
        volumeStartRange: values.volumeStartRange * 1,
        volumeEndRange: values.volumeEndRange * 1,
        unitConfigNo: values.unitConfigNo
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
  /**
   * 校验体积，结束只能大于等于起始
   * @param rule 
   * @param value 
   */
  const validatorEnd = (rule, value, callback) => {
    let start: any = searchField.getValue('volumeStartRange')
    if (value < start) {
      setError('volumeEndRange', lang['start.cant.end']);
    }
    return callback();
  }
  const Dialog_update = (
    <Dialog
      title={lang['fb4.reservation.reference.value']}
      visible={visible}
      onOk={handleUpdate}
      onCancel={() => setVisible(false)}
      onClose={() => setVisible(false)} >
      <Form field={searchField} labelAlign="left">
        <FormItem required label={lang['fb4.cabinet.type']}>
          <Select dataSource={cabinetType} placeholder={lang['fb4.please.choose']} style={{ width: '100%' }} name="containerType" />
        </FormItem>
        <FormItem required label={lang['fb4.volume']}>
          <Input htmlType="hidden" name="unitConfigNo" />
          {/* <Input style={{ width: 120 }}
            {...init('volumeStartRange', {
              initValue: '',
              rules: [{
                required: true,
                pattern: /^\d+(\.\d+)?$/,
                message: '请输入正确的数字'
              }]
            })} /> */}
          <NumberPicker step={0.1} min={0} style={{ width: 120 }}
            {...init('volumeStartRange', {
              initValue: 0,
              rules: [{
                required: true,
                pattern: /^\d+(\.\d+)?$/
              }]
            })} />
                -
                {/* <Input style={{ width: 120 }}
            {...init('volumeEndRange', {
              initValue: '',
              rules: [{
                required: true,
                pattern: /^\d+(\.\d+)?$/,
                message: '请输入正确的数字',
                validator: validatorEnd
              }]
            })} /> */}
          <NumberPicker step={0.1} min={0} style={{ width: 120 }}
            {...init('volumeEndRange', {
              initValue: 1,
              rules: [{
                required: true,
                pattern: /^\d+(\.\d+)?$/,
                validator: validatorEnd
              }]
            })} />
        </FormItem>
        <FormItem required label="UNIT">
          <NumberPicker step={0.1} min={0} name="unit" style={{ width: '100%' }} />
        </FormItem>
      </Form>
    </Dialog >
  )

  const List = (
    <div className="List" style={{ marginTop: '16px' }}>
      <Loading visible={loading} style={{ display: 'block' }}>
        <div className="add">
          <Button type="primary" onClick={() => history.push('/appointmentConfigure/addUnitPage')}>
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
              {/* <Table.Column title={lang['fb4.warehouse']} dataIndex="warehouseCode" cell={(v, i, r) => {
                return getWareName(whAll, v)
              }} /> */}
              <Table.Column title={lang['fb4.cabinet.type']} dataIndex="containerType" />
              <Table.Column title={lang['fb4.volume.m3']} cell={(v, i, r) => {
                return `${r.volumeStartRange} - ${r.volumeEndRange}`
              }} />
              <Table.Column title="unit" dataIndex="unit" />
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
                    {/* <Divider direction="ver" /> */}
                    {/* <Link to={{ pathname: '/appointmentConfigure/detailPage', state: record }}>{lang['fb4.view']}</Link> */}
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
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['fb4.reservation.reference.value'] }]}
      />
      {/* {Search} */}
      {Dialog_update}
      {List}
    </>
  );
});
