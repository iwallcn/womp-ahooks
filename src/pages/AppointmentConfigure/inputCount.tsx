import React, { useState, useContext, useEffect } from 'react';
import { NumberPicker } from '@alifd/next';
import globalContext from '@/contexts/globalContext'

/**
 * value, index, record, list, setTableAlist
 * 当前值， 第几个输入框， 一整行记录，list，setTableList
 */
export default ({ value, _key, record, index }) => {
  const { tableList, setTableList } = useContext(globalContext);
  const [inputValue, setInputValue] = useState(value);

  //　变更当前输入框的值，并且更新列表的数据
  const changeInput = (v) => {
    setInputValue(v)
    record[_key] = +v;
    console.log(record);
    setTableList([...tableList]);
  }

  useEffect(() => {
    setInputValue(value);
  }, []);

  return (
    <NumberPicker step={1} min={0} max={100} value={inputValue} style={{ width: '100%' }} onChange={changeInput} />
  )
};


