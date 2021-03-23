import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'ice';
import { Grid, Form, Field, TreeSelect, Button, Table, Message, NumberPicker } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { CustomIcon } from '@/components/Iconfont';
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
  const searchField = Field.useField({ values: {} });
  const [tableList, setTableList] = useState<any[]>([]);
  const [warehouseName, setWarehouseName] = useState('');


  //表格title
  const tableColumn = {
    warehouseName: lang['fb4.warehouse'],
    shipDate: lang['sailing.schedule'],
  }
  /**
   * 渲染表格每行数据
   * 第一列和第二列合并为select
   * 周日input默认不可编辑
   */
  const renderRow = (
    Object.keys(tableColumn).map((col, key) => (
      <Table.Column title={tableColumn[col]} dataIndex={col} key={col} cell={(value, index, record) => {
        return value
      }
      }></Table.Column>
    ))
  );
  // 删除一行
  const handleDelete = (value, i, record) => {
    let arr = tableList.filter((val, index) => index !== i);
    setTableList([...arr]);
  }
  // 新增一行
  const handleAdd = () => {
    searchField.validate((errors, values: any) => {
      if (errors) {
        return;
      }
      if (tableList.filter(v => v.warehouseCode == values.warehouseCode).length > 0) {
        Message.warning(lang['cannot.added.repeatedly']);
        return;
      }
      let obj: any = {
        warehouseCode: values.warehouseCode,
        warehouseName: warehouseName,
        shipDate: values.shipDate
      }
      setTableList([...tableList, obj])
    });
  }
  // 选择仓库，设置仓库名称
  const changeWh = (v, r) => {
    setWarehouseName(r.label);
  }
  // 提交
  const submit = () => {
    searchField.validate((errors, values) => {
      if (errors) {
        return;
      }
    });
    if (!tableList.length) {
      return Message.warning(lang['fb4.no.data']);
    }
    API.insertShipConfig(tableList).then(res => {
      if (res.success) {
        Message.success(res.msg)
        history.push('/appointmentConfigure/shipListPage');
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  };

  const FormPage = (
    <div className="Search">
      <Form field={searchField} labelAlign="left" {...formLayout}>
        {/* <Row>
          <Col span={8}>
            <FormItem required label="船期配置" {...formItemLayout}>
              <Select dataSource={configName} name="unitConfigNo" placeholder="请选择" style={{ width: 274 }} defaultValue={configName[0]} />
            </FormItem>
          </Col>
        </Row> */}
        <h5 className="Title_h5">{lang['fb4.config.rule']}</h5>
        <Row>
          <Col span={6}>
            <FormItem label={lang['fb4.warehouse']} {...formItemLayout} required>
              <TreeSelect
                hasClear
                showSearch
                placeholder={lang['fb4.warehouse.choose']}
                treeDefaultExpandAll
                dataSource={whAll}
                name="warehouseCode"
                onChange={changeWh}
                style={{ width: '100%' }} />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem required label={lang['sailing.schedule']} {...formItemLayout}>
              <NumberPicker step={1} min={0} name="shipDate" innerAfter={lang['fb4.day']} style={{ width: 100 }} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" onClick={handleAdd}>{lang['fb4.add']}</Button>
          </Col>
        </Row>
        <Row>
          <Col offset={1} span={16}>
            <Table
              size="small"
              hasBorder={true}
              className={styles.Table}
              dataSource={tableList}
            >
              {renderRow}
              <Table.Column
                title={lang['fb4.add']}
                cell={(value, index, record) => (
                  <div className={styles.opt}>
                    <span onClick={() => handleDelete(value, index, record)}><CustomIcon type="close" className={styles.news} /></span>
                  </div>
                )}
              />
            </Table>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
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
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['fb4.reservation.ship.manage'] }]}
      />
      {FormPage}
    </>
  );
}));

