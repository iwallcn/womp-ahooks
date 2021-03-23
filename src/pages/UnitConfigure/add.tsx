import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { useHistory } from 'ice';
import { Grid, Form, Select, Input, Field, Button, Table, Message, NumberPicker } from '@alifd/next';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import { convertDictByType } from '@/utils/index';
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

export default injectIntl(({ intl }) => {
  const history = useHistory();
  const lang = window.GLOBAL_LANG;
  const searchField = Field.useField({ values: {} });
  const { init, setError } = searchField
  const [tableList, setTableList] = useState<any[]>([]);
  const [cabinetType, setCabinetType] = useState([]);
  const [configName, setConfigName] = useState([]);

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
  // 获取配置项名称
  const getConfigName = () => {
    const source = convertDictByType('UINT_CONFIG_NAME');
    let temp: any = []
    for (let key in source) {
      let obj = {
        label: source[key].name,
        value: source[key].code
      }
      temp.push(obj);
    }
    setConfigName(temp);
  }

  //表格title
  const tableColumn = {
    containerType: lang['fb4.cabinet.type.repeat'],
    volume: lang['fb4.volume.m3'],
    unit: 'unit'
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
  // 新增一行，每行体积不能交叉
  const handleAdd = () => {
    searchField.validate((errors, values: any) => {
      if (errors) {
        return;
      }
      let obj: any = {
        unitConfigNo: values.unitConfigNo.value,
        volumeStartRange: values.volumeStartRange * 1,
        volumeEndRange: values.volumeEndRange * 1,
        containerType: values.containerType,
        volume: `${values.volumeStartRange}-${values.volumeEndRange}`,
        unit: values.unit * 1
      }
      for (let i = 0; i < tableList.length; i++) {
        if (obj.volumeStartRange < tableList[i].volumeEndRange) {
          Message.warning(lang['interval.cannot.repeated'])
          return;
        }
      }
      setTableList([...tableList, obj])
    });
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
    API.insertUnitConfig(tableList).then(res => {
      if (res.success) {
        Message.success(res.msg);
        history.push('/appointmentConfigure/unitListPage');
      } else {
        Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
      }
    })
  };

  useEffect(() => {
    getCabinetType();
    getConfigName();
  }, []);

  /**
   * 校验体积，结束只能大于等于起始
   * @param rule 
   * @param value 
   */
  const validatorEnd = (rule, value, callback) => {
    let start: any = searchField.getValue('volumeStartRange');
    if (start - value > 0) {
      setError('volumeEndRange', lang['start.cant.end']);
    }
    return callback();
  }

  const FormPage = (
    <div className="Search">
      <Form field={searchField} labelAlign="left" {...formLayout}>
        <Row>
          <Col span={6}>
            <FormItem required label={lang['fb4.config.item.name']} {...formItemLayout}>
              <Select dataSource={configName} name="unitConfigNo" placeholder={lang['fb4.please.choose']} style={{ width: '100%' }} defaultValue={configName[0]} />
            </FormItem>
          </Col>
        </Row>
        <h5 className="Title_h5">{lang['fb4.config.rule']}</h5>
        <Row>
          <Col span={6}>
            <FormItem required label={lang['fb4.cabinet.type.repeat']} {...formItemLayout}>
              <Select dataSource={cabinetType} placeholder={lang['fb4.please.choose']} style={{ width: '100%' }} name="containerType" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem required label={lang['fb4.volume.m3']} {...formItemLayout}>
              {/* <Input style={{ width: 120 }} name="volumeStartRange"
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
                <NumberPicker step={0.1} min={0} style={{ width: 120 }}
                {...init('volumeEndRange', {
                  initValue: 1,
                  rules: [{
                    required: true,
                    pattern: /^\d+(\.\d+)?$/,
                    validator: validatorEnd
                  }]
                })} />
              {/* <Input style={{ width: 120 }} name="volumeEndRange"
                {...init('volumeEndRange', {
                  initValue: '',
                  rules: [{
                    required: true,
                    pattern: /^\d+(\.\d+)?$/,
                    message: '请输入正确的数字',
                    validator: validatorEnd
                  }]
                })} /> */}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem required label="UNIT" {...formItemLayout}>
              <NumberPicker step={0.1} min={0} name="unit" style={{ width: 100 }} />
            </FormItem>
          </Col>
          <Col span={3} offset={2}>
            <Button type="primary" onClick={handleAdd}>{lang['fb4.add']}</Button>
          </Col>
        </Row>
        <Row>
          <Col offset={1} span={19}>
            <Table
              size="small"
              hasBorder={true}
              className={styles.Table}
              dataSource={tableList}
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
            <Form.Reset >{lang['fb4.close']}</Form.Reset>
          </Col>
        </Row>
      </Form>
    </div>
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: lang['new.unit.configuration'] }]}
      />
      {FormPage}
    </>
  );
});
