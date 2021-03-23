import * as React from 'react';
import { Icon } from '@alifd/next';
import { Link } from 'ice';
import styles from './index.module.scss';

const Services = () => (
  <div className={styles.link}>
    <Link to="/services" title="产品与服务">
      <Icon type="add" />
      <span>产品与服务</span>
    </Link>
  </div>
);

export default Services;
