import React, { useState, useContext, useEffect } from 'react';
import { TimePicker, Field } from '@alifd/next';
import globalContext from '@/contexts/globalContext'
import moment from 'moment';
/**
 * value, index, record, list, setTableAlist
 * 当前值， 第几个输入框， 一整行记录，list，setTableList
 */
export default ({ value, _key, record, index }) => {
  const { tableList, setTableList } = useContext(globalContext);
  const [inputValue, setInputValue] = useState(value);
  const searchField = Field.useField({ values: {} });
  const { init } = searchField;

  //　变更当前输入框的值，并且更新列表的数据
  const changeStartTime = (val) => {
    setInputValue(val);
    record[_key] = moment(val, 'HH:mm', true).format('HH:mm');
    setTableList([...tableList]);
  };

  useEffect(() => {
    setInputValue(value);
  }, []);

  return (
    <TimePicker hourStep={1} minuteStep={30} format="HH:mm" style={{ width: '120px' }}
      name={`${_key}${index}`}
      {...init(_key + index, {
        initValue: inputValue,
        props: {
          onChange: (val) => changeStartTime(val)
        }
      })}
    />
  )
}