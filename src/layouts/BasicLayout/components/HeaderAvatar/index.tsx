import React from 'react';
import { Overlay, Menu, Icon } from '@alifd/next';
import { injectIntl } from 'react-intl';
import styles from './index.module.scss';
import { CustomIcon } from "@/components/Iconfont";

const { Item } = Menu;
const { Popup } = Overlay;

const HeaderAvatar = injectIntl(({ user, intl }) => {
  let _url = ''
  if (window.origin.indexOf('test') > 0 || window.origin.indexOf('localhost') > 0) {
    _url = 'http://usc.test.i4px.com/user/changemypwd';
  } else if (window.origin.indexOf('uat') > 0) {
    _url = 'http://ucs.uat.i4px.com/user/changemypwd';
  } else {
    _url = 'http://ucs.i4px.com/user/changemypwd';
  }
  return (
    <Popup
      trigger={
        <div className={styles.headerAvatar}>
          {/* <Avatar size="small" src={user.avatar} alt={intl.formatMessage({ id: 'fb4.header.userAvatar' })} /> */}
          <CustomIcon type="usercopy"></CustomIcon>
          <span style={{ marginLeft: 10 }}>{user.fullName}</span>
        </div>
      }
      triggerType="click"
    >
      <div className={styles.avatarPopup}>
        <div className={styles.panel}>
          <div>
            <h4>{intl.formatMessage({ id: 'fb4.header.personalInfo' })}</h4>
            <ul>
              <li>{intl.formatMessage({ id: 'fb4.header.name' })}：{user.name}</li>
              <li>{intl.formatMessage({ id: 'fb4.header.phone' })}：{user.phone}</li>
              <li>{intl.formatMessage({ id: 'fb4.header.email' })}：{user.email}</li>
              <li>{intl.formatMessage({ id: 'fb4.header.region' })}：{user.address}</li>
            </ul>
          </div>
          <div>
            <h4>{intl.formatMessage({ id: 'fb4.header.remark' })}</h4>
            <div>{user.remark}</div>
          </div>
        </div>
        <Menu className={styles.menu}>
          <Item>
            <a href={_url}>
              <CustomIcon type="editpwd" size="small" />{intl.formatMessage({ id: 'fb4.header.editPwd' })}
            </a>
          </Item>
          <Item>
            <a href={`${window.origin}/logout`}>
              <CustomIcon type="logout" size="small" />{intl.formatMessage({ id: 'fb4.header.quit' })}
            </a>
          </Item>
        </Menu>
      </div>
    </Popup >
  );
});

export default HeaderAvatar;
