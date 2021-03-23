import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'ice';
import { Grid, Form, Field, Input, Button, Table, Message, DatePicker } from '@alifd/next';
import PageHeader from '@/components/PageHeader';
import API from './api';
import moment from 'moment';

const FormItem = Form.Item;
const formLayout = {
  labelCol: {
    fixedSpan: 10,
  },
  wrapperCol: {
    span: 14,
  },
};


export default withRouter(injectIntl(({ history, location, intl }) => {
  const lang = window.GLOBAL_LANG;
  const searchField = Field.useField({ values: {} });

  // 提交
  const submit = () => {
    searchField.validate((errors, values: any) => {
      if (errors) {
        return;
      }
      let data = {
        coNo: values.coNo,
        actualDate: moment(values.actualDate).format('YYYY-MM-DD hh:mm:00')
      }
      API.queuingAppointment(data).then(res => {
        if (res.success) {
          Message.success(res.msg)
          history.push('/appointmentConfigure/shipListPage');
        } else {
          Message.error(res.errors ? res.errors[0].errorMsg : res.msg);
        }
      })
    });
  };

  const onChange = () => {

  };
  const onOk = () => {

  }
  const FormPage = (
    <div className="Search">
      <Form field={searchField} labelAlign="left" {...formLayout}>
        <FormItem label={lang['fb4.reservation.no']} required>
          <Input name="coNo" hasClear style={{ width: 200 }} />
        </FormItem>
        <FormItem label="预约送仓时间" required>
          <DatePicker onChange={onChange} onOk={onOk} name="actualDate" format="YYYY-MM-DD" showTime={{ format: 'HH:mm' }} />
        </FormItem>
        <FormItem label="    " >
          <Form.Submit
            type="primary"
            onClick={submit}
            validate>
            {lang['fb4.html.order']}
          </Form.Submit>
        </FormItem>

      </Form>
    </div>
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: lang['fb4.inbound.appointment.set'] }, { name: '排队预约' }]}
      />
      {FormPage}
    </>
  );
}));

