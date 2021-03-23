import React, {useState, useEffect} from 'react';
import { injectIntl } from 'react-intl';
import {Radio} from '@alifd/next';
import { setLocale, getLocale } from '@/locales/locale';
import styles from './index.module.scss';
import { set_WH_ALL, set_DICT } from '@/utils/index';

export default injectIntl(({intl, }) => {
  const [lang, setLang] = useState(getLocale())
  const selectLang = (value) => {
    setLocale(value);
    setLang(value);
  };
  
  return (
    <Radio.Group
      className={styles.lang}
      shape="button"
      value={lang}
      onChange={selectLang}
    >
      <Radio value="zh-CN">{intl.formatMessage({id: 'Lang.zhCN'})}</Radio>
      {/* <Radio value="ja-JP">{intl.formatMessage({id: 'Lang.jaJP'})}</Radio> */}
      {/* <Radio value="de-CH">{intl.formatMessage({id: 'Lang.deCH'})}</Radio> */}
      <Radio value="en-US">{intl.formatMessage({id: 'Lang.enUS'})}</Radio>
    </Radio.Group>
  );
});
